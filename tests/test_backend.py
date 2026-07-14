import json
import pytest
from fastapi.testclient import TestClient
from app.main import app
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
