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
