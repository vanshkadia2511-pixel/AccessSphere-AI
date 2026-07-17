import json
import pytest
from fastapi.testclient import TestClient
from app.main import app, rate_limiter, _SECURITY_HEADERS
from app import data, tools, assistant, offline

client = TestClient(app)

def test_healthz():
    response = client.get("/healthz")
    assert response.status_code == 200
    res = response.json()
    assert res["status"] == "ok"
    assert res["llm"] in ["live", "offline"]

def test_list_venues():
    response = client.get("/api/venues")
    assert response.status_code == 200
    res = response.json()
    assert "venues" in res
    assert len(res["venues"]) > 0
    assert res["venues"][0]["id"] == "los-angeles"

def test_get_venue():
    # Success path
    response = client.get("/api/venues/los-angeles")
    assert response.status_code == 200
    res = response.json()
    assert res["name"] == "SoFi Stadium"
    
    # 404 path
    response = client.get("/api/venues/invalid-id")
    assert response.status_code == 404

def test_search_venues():
    response = client.get("/api/venues/search?q=Los Angeles")
    assert response.status_code == 200
    res = response.json()
    assert len(res["venues"]) == 1
    assert res["venues"][0]["id"] == "los-angeles"

def test_chat_offline_fallback():
    payload = {
        "message": "hello",
        "profile": {
            "language": "en",
            "needs": ["sensory"],
            "venue_id": "los-angeles"
        },
        "history": []
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert "reply" in res
    assert res["mode"] in ["live", "offline"]

def test_chat_stream_offline_fallback():
    payload = {
        "message": "hello",
        "profile": {
            "language": "en",
            "needs": ["sensory"],
            "venue_id": "los-angeles"
        },
        "history": []
    }
    response = client.post("/api/chat/stream", json=payload)
    assert response.status_code == 200
    # Read the NDJSON lines
    lines = response.text.strip().split("\n")
    assert len(lines) >= 1
    meta = json.loads(lines[0])
    assert meta["type"] == "meta"
    assert meta["mode"] in ["live", "offline"]

def test_tools():
    # Basic get info
    info = tools.get_venue_info("los-angeles")
    assert "name" in info
    assert info["name"] == "SoFi Stadium"

    # Services filtering
    services = tools.find_accessible_services("los-angeles", "sensory")
    assert services["need"] == "sensory"

    # Live status simulation
    status = tools.get_live_status("los-angeles", hour=15)
    assert status["simulated"] is True
    assert status["hour_utc"] == 15

    # Visit plan
    plan = tools.plan_visit("los-angeles", needs=["sensory"], hour=15)
    assert "steps" in plan


# ── Security headers ──────────────────────────────────────────────────────────

def test_security_headers_on_api_response():
    """Every API response must carry all expected security headers."""
    response = client.get("/healthz")
    for header, expected_value in _SECURITY_HEADERS.items():
        assert header in response.headers, f"Missing header: {header}"
        assert response.headers[header] == expected_value, (
            f"Header {header!r} mismatch: {response.headers[header]!r} != {expected_value!r}"
        )

def test_coop_corp_headers_present():
    """Cross-Origin isolation headers must be present."""
    response = client.get("/api/venues")
    assert response.headers.get("Cross-Origin-Opener-Policy") == "same-origin"
    assert response.headers.get("Cross-Origin-Resource-Policy") == "same-origin"

def test_content_security_policy_header():
    """CSP must restrict default-src to self and deny framing."""
    response = client.get("/api/venues")
    csp = response.headers.get("Content-Security-Policy", "")
    assert "default-src 'self'" in csp
    assert "frame-ancestors 'none'" in csp

def test_x_frame_options_deny():
    response = client.get("/healthz")
    assert response.headers.get("X-Frame-Options") == "DENY"

def test_hsts_header():
    response = client.get("/healthz")
    assert "max-age=63072000" in response.headers.get("Strict-Transport-Security", "")


# ── Rate limiter ───────────────────────────────────────────────────────────────

def test_rate_limiter_returns_429_on_exhaustion():
    """The chat endpoint must return 429 once the per-IP bucket is empty."""
    rate_limiter.reset()
    payload = {
        "message": "hi",
        "profile": {"language": "en", "needs": [], "venue_id": "los-angeles"},
        "history": [],
    }
    # Drain the bucket
    for _ in range(20):
        rate_limiter.allow("testclient")
    # Next request should be rejected
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 429
    rate_limiter.reset()


# ── Data layer edge cases ──────────────────────────────────────────────────────

def test_search_venues_empty_returns_422():
    """Empty q is below min_length=1 — FastAPI should return 422."""
    response = client.get("/api/venues/search?q=")
    assert response.status_code == 422

def test_search_venues_no_match_returns_empty_list():
    response = client.get("/api/venues/search?q=nonexistentxyz")
    assert response.status_code == 200
    assert response.json()["venues"] == []

def test_get_venue_none_for_unknown_id():
    venue = data.get_venue("does-not-exist")
    assert venue is None

def test_search_venues_data_layer_direct():
    results = data.search_venues("mexico")
    assert len(results) > 0
    assert all("mexico" in v["country"].lower() for v in results)


# ── Tool dispatcher errors ─────────────────────────────────────────────────────

def test_execute_tool_unknown_name():
    result = json.loads(tools.execute_tool("nonexistent_tool", {}))
    assert "error" in result
    assert "Unknown tool" in result["error"]

def test_execute_tool_invalid_venue_id():
    result = json.loads(tools.execute_tool("get_venue_info", {"venue_id": "bad-id"}))
    assert "error" in result

def test_execute_tool_none_args_falls_back():
    """None args should be treated as empty dict and return venue error."""
    result = json.loads(tools.execute_tool("get_venue_info", None))
    assert "error" in result


# ── Offline engine ─────────────────────────────────────────────────────────────

def test_offline_greeting():
    reply = offline.offline_answer("hello", {"language": "en", "venue_id": "los-angeles"})
    assert isinstance(reply, str)
    assert len(reply) > 0

def test_offline_accessibility_intent():
    reply = offline.offline_answer(
        "wheelchair access", {"language": "en", "venue_id": "los-angeles"}
    )
    assert isinstance(reply, str)
    assert len(reply) > 0

def test_offline_navigation_intent():
    reply = offline.offline_answer(
        "how do I get to my seat", {"language": "en", "venue_id": "los-angeles"}
    )
    assert isinstance(reply, str)
    assert len(reply) > 0

def test_offline_spanish_response():
    reply = offline.offline_answer(
        "hola", {"language": "es", "venue_id": "los-angeles"}
    )
    assert isinstance(reply, str)
    assert len(reply) > 0

def test_offline_no_venue_asks_to_pick():
    """Without a venue_id, a venue-specific intent should prompt venue selection."""
    reply = offline.offline_answer("wheelchair access", {"language": "en"})
    assert isinstance(reply, str)
    assert len(reply) > 0


# ── Static fallback: path traversal hardening ─────────────────────────────────

def test_fallback_rejects_dotdot_traversal():
    """A ../ traversal attempt must never serve a file outside dist/."""
    response = client.get("/../app/main.py")
    assert response.status_code != 200 or "GEMINI" not in response.text

def test_fallback_rejects_encoded_traversal():
    """URL-encoded traversal (%2e%2e%2f) must not escape the static dir."""
    response = client.get("/%2e%2e%2f%2e%2e%2fapp%2fmain.py")
    assert response.status_code != 200 or "RATE_LIMIT_PER_MIN" not in response.text

def test_fallback_rejects_env_probe():
    """Common secret probes must never return file contents."""
    for probe in ("/.env", "/..%2f.env", "/....//....//etc/passwd"):
        response = client.get(probe)
        assert "GEMINI_API_KEY=" not in response.text
        assert "root:" not in response.text

def test_fallback_api_prefix_is_404():
    response = client.get("/api/nonexistent")
    assert response.status_code == 404


# ── Request schema caps (input validation) ─────────────────────────────────────

def _chat_payload(**overrides):
    payload = {
        "message": "hi",
        "profile": {"language": "en", "needs": [], "venue_id": "los-angeles"},
        "history": [],
    }
    payload.update(overrides)
    return payload

def test_chat_message_too_long_is_422():
    rate_limiter.reset()
    response = client.post("/api/chat", json=_chat_payload(message="x" * 2001))
    assert response.status_code == 422

def test_chat_empty_message_is_422():
    rate_limiter.reset()
    response = client.post("/api/chat", json=_chat_payload(message="   "))
    assert response.status_code == 422

def test_chat_extra_fields_forbidden():
    rate_limiter.reset()
    response = client.post("/api/chat", json=_chat_payload(evil="payload"))
    assert response.status_code == 422

def test_chat_history_over_cap_is_422():
    rate_limiter.reset()
    long_history = [{"role": "user", "text": "hi"}] * 21
    response = client.post("/api/chat", json=_chat_payload(history=long_history))
    assert response.status_code == 422

def test_chat_invalid_need_is_422():
    rate_limiter.reset()
    payload = _chat_payload()
    payload["profile"]["needs"] = ["telepathy"]
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 422

def test_chat_invalid_language_is_422():
    rate_limiter.reset()
    payload = _chat_payload()
    payload["profile"]["language"] = "english"
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 422

def test_search_query_over_cap_is_422():
    response = client.get("/api/venues/search", params={"q": "x" * 65})
    assert response.status_code == 422


# ── Token bucket limiter unit behaviour ────────────────────────────────────────

def test_token_bucket_allows_up_to_capacity():
    from app.main import TokenBucketLimiter
    limiter = TokenBucketLimiter(capacity=3, refill_seconds=60.0)
    assert limiter.allow("ip") is True
    assert limiter.allow("ip") is True
    assert limiter.allow("ip") is True
    assert limiter.allow("ip") is False

def test_token_bucket_keys_are_independent():
    from app.main import TokenBucketLimiter
    limiter = TokenBucketLimiter(capacity=1, refill_seconds=60.0)
    assert limiter.allow("a") is True
    assert limiter.allow("a") is False
    assert limiter.allow("b") is True

def test_token_bucket_refills_over_time(monkeypatch):
    import time as _time
    from app.main import TokenBucketLimiter
    limiter = TokenBucketLimiter(capacity=1, refill_seconds=1.0)
    base = _time.monotonic()
    monkeypatch.setattr("app.main.time.monotonic", lambda: base)
    assert limiter.allow("ip") is True
    assert limiter.allow("ip") is False
    monkeypatch.setattr("app.main.time.monotonic", lambda: base + 2.0)
    assert limiter.allow("ip") is True

def test_token_bucket_prunes_idle_buckets():
    from app.main import TokenBucketLimiter
    limiter = TokenBucketLimiter(capacity=5, refill_seconds=0.001, prune_threshold=4)
    for i in range(4):
        limiter.allow(f"client-{i}")
    import time as _time
    _time.sleep(0.01)  # let every bucket refill fully
    limiter.allow("new-client")  # triggers prune of the refilled buckets
    assert len(limiter._buckets) <= 4

def test_token_bucket_reset_clears_state():
    from app.main import TokenBucketLimiter
    limiter = TokenBucketLimiter(capacity=1, refill_seconds=60.0)
    assert limiter.allow("ip") is True
    limiter.reset()
    assert limiter.allow("ip") is True


# ── Streaming endpoint parity ──────────────────────────────────────────────────

def test_chat_stream_rate_limited_returns_429():
    """The stream endpoint must share the same per-IP rate limit as /api/chat."""
    rate_limiter.reset()
    for _ in range(20):
        rate_limiter.allow("testclient")
    response = client.post("/api/chat/stream", json=_chat_payload())
    assert response.status_code == 429
    rate_limiter.reset()

def test_chat_stream_delta_frames_carry_text():
    rate_limiter.reset()
    response = client.post("/api/chat/stream", json=_chat_payload(message="wheelchair access"))
    assert response.status_code == 200
    frames = [json.loads(line) for line in response.text.strip().split("\n")]
    deltas = [f for f in frames if f["type"] == "delta"]
    assert len(deltas) >= 1
    assert all(isinstance(f["text"], str) and f["text"] for f in deltas)

def test_chat_stream_meta_carries_venue_id():
    rate_limiter.reset()
    response = client.post("/api/chat/stream", json=_chat_payload())
    meta = json.loads(response.text.strip().split("\n")[0])
    assert meta["venue_id"] == "los-angeles"

def test_chat_stream_validation_rejected_before_streaming():
    rate_limiter.reset()
    response = client.post("/api/chat/stream", json=_chat_payload(message=""))
    assert response.status_code == 422


# ── Assistant fallback + decline localization ─────────────────────────────────

def test_assistant_offline_when_no_key(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    monkeypatch.delenv("GOOGLE_API_KEY", raising=False)
    reply = assistant.answer("hello", {"language": "en", "venue_id": "los-angeles"})
    assert reply.mode == "offline"
    assert reply.text

def test_assistant_decline_language_resolution():
    assert assistant._decline_language({"language": "es"}) == "es"
    assert assistant._decline_language({"language": "AR"}) == "ar"
    assert assistant._decline_language({"language": "xx"}) == "en"
    assert assistant._decline_language({}) == "en"

def test_assistant_preamble_includes_context():
    text = assistant._preamble(
        "where is gate c", {"venue_id": "los-angeles", "needs": ["mobility"], "language": "en"}
    )
    assert "venue_id: los-angeles" in text
    assert "needs: mobility" in text
    assert "where is gate c" in text

def test_assistant_preamble_prompts_for_missing_venue():
    text = assistant._preamble("hi", {})
    assert "none selected" in text

def test_security_headers_present_on_404():
    """Even error responses must carry the strict security headers."""
    response = client.get("/api/venues/unknown-venue-id")
    assert response.status_code == 404
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert "default-src 'self'" in response.headers.get("Content-Security-Policy", "")
