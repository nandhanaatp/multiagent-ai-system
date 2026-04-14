import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from main import app, get_current_user
from models import User
from datetime import datetime

client = TestClient(app)

# ── Mock user ──────────────────────────────────────────────────────────────────

def mock_user():
    user = User(
        user_id=1,
        username="testuser",
        email="testuser@example.com",
        full_name="Test User",
        hashed_password="hashed_placeholder",
        is_active=True,
        is_admin=False,
        created_at=datetime(2024, 1, 1),
        updated_at=datetime(2024, 1, 1),
    )
    return user

app.dependency_overrides[get_current_user] = mock_user


# ── Public endpoints ───────────────────────────────────────────────────────────

def test_root_returns_healthy():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database_connected"] is True

def test_health_check_returns_200():
    response = client.get("/health")
    assert response.status_code == 200
    assert "status" in response.json()
    assert "database_connected" in response.json()


# ── Auth endpoints ─────────────────────────────────────────────────────────────

def test_register_missing_fields_returns_422():
    response = client.post("/auth/register", json={"username": "x"})
    assert response.status_code == 422

def test_login_missing_fields_returns_422():
    response = client.post("/auth/login", json={})
    assert response.status_code == 422

def test_get_me_returns_user():
    response = client.get("/auth/me")
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "testuser@example.com"

def test_refresh_token_returns_token():
    response = client.post("/auth/refresh")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_logout_clears_cookie():
    response = client.post("/auth/logout")
    assert response.status_code == 200
    assert response.json()["message"] == "Logged out successfully"


# ── Analyze endpoint ───────────────────────────────────────────────────────────

def test_analyze_missing_body_returns_422():
    response = client.post("/analyze", json={})
    assert response.status_code == 422

def test_analyze_short_description_returns_422():
    response = client.post("/analyze", json={
        "problem_description": "short",
        "parameters": {"impact": 5, "likelihood": 5, "urgency": 5, "confidence": 5}
    })
    assert response.status_code == 422

def test_analyze_invalid_parameters_returns_422():
    response = client.post("/analyze", json={
        "problem_description": "A valid problem description here",
        "parameters": {"impact": 11, "likelihood": 5, "urgency": 5, "confidence": 5}
    })
    assert response.status_code == 422

def test_analyze_invalid_mode_returns_422():
    response = client.post("/analyze", json={
        "problem_description": "A valid problem description here",
        "parameters": {"impact": 5, "likelihood": 5, "urgency": 5, "confidence": 5},
        "mode": "invalid_mode"
    })
    assert response.status_code == 422

def test_analyze_governance_mode_returns_correct_structure():
    response = client.post("/analyze", json={
        "problem_description": "Security vulnerability detected in production system",
        "parameters": {"impact": 8, "likelihood": 7, "urgency": 9, "confidence": 6},
        "mode": "governance"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["mode"] == "governance"
    assert "final_decision" in data
    assert data["final_decision"] in ["BLOCK", "REVIEW", "ALLOW"]
    assert data["analysis_output"] is not None
    assert data["risk_output"] is not None
    assert data["governance_output"] is not None
    assert data["decomposer_output"] is None
    assert data["validation_output"] is None

def test_analyze_problem_solving_mode_returns_correct_structure():
    response = client.post("/analyze", json={
        "problem_description": "Generate a study plan for a machine learning exam",
        "parameters": {"impact": 5, "likelihood": 5, "urgency": 5, "confidence": 5},
        "mode": "problem_solving"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["mode"] == "problem_solving"
    assert data["final_decision"] in ["APPROVED", "NEEDS_IMPROVEMENT", "REJECTED"]
    assert data["decomposer_output"] is not None
    assert data["research_output"] is not None
    assert data["execution_output"] is not None
    assert data["validation_output"] is not None
    assert data["analysis_output"] is None
    assert data["governance_output"] is None


# ── History & Analytics endpoints ──────────────────────────────────────────────

def test_history_returns_200_with_structure():
    response = client.get("/history")
    assert response.status_code == 200
    data = response.json()
    assert "history" in data
    assert "total" in data
    assert "limit" in data
    assert "offset" in data

def test_history_pagination_params():
    response = client.get("/history?limit=3&offset=0")
    assert response.status_code == 200
    data = response.json()
    assert data["limit"] == 3
    assert data["offset"] == 0

def test_analytics_returns_200_with_structure():
    response = client.get("/analytics")
    assert response.status_code == 200
    data = response.json()
    assert "total_analyses" in data
    assert "decisions" in data
    assert "avg_risk_score" in data
    assert "trend" in data
    # Verify all 6 decision types present
    for key in ["BLOCK", "REVIEW", "ALLOW", "APPROVED", "NEEDS_IMPROVEMENT", "REJECTED"]:
        assert key in data["decisions"]


# ── Policy Builder endpoints ───────────────────────────────────────────────────

def test_get_governance_policy_returns_defaults_structure():
    response = client.get("/policy/governance")
    assert response.status_code == 200
    data = response.json()
    assert "policies" in data
    for level in ["HIGH", "MEDIUM", "LOW"]:
        assert level in data["policies"]
        rule = data["policies"][level]
        assert all(k in rule for k in ["decision", "score", "reason", "actions"])


def test_update_governance_policy_round_trip():
    original = client.get("/policy/governance")
    assert original.status_code == 200
    original_payload = original.json()["policies"]

    updated_payload = {
        "policies": {
            "HIGH": {
                "decision": "REVIEW",
                "score": 7.2,
                "reason": "Custom high-level policy for test",
                "actions": ["Escalate to reviewer", "Collect more evidence"]
            },
            "MEDIUM": {
                "decision": "ALLOW",
                "score": 4.0,
                "reason": "Custom medium-level policy for test",
                "actions": ["Proceed with monitoring"]
            },
            "LOW": {
                "decision": "ALLOW",
                "score": 2.0,
                "reason": "Custom low-level policy for test",
                "actions": ["Log only"]
            }
        }
    }

    try:
        update_response = client.put("/policy/governance", json=updated_payload)
        assert update_response.status_code == 200
        updated = update_response.json()["policies"]
        assert updated["HIGH"]["decision"] == "REVIEW"
        assert float(updated["HIGH"]["score"]) == 7.2
        assert updated["HIGH"]["actions"] == ["Escalate to reviewer", "Collect more evidence"]

        get_again = client.get("/policy/governance")
        assert get_again.status_code == 200
        persisted = get_again.json()["policies"]
        assert persisted["HIGH"]["decision"] == "REVIEW"
        assert "Custom high-level policy for test" in persisted["HIGH"]["reason"]
    finally:
        restore_response = client.put("/policy/governance", json={"policies": original_payload})
        assert restore_response.status_code == 200
