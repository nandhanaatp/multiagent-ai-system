import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from agents.analysis_agent import AnalysisAgent
from agents.risk_agent import RiskAgent
from agents.governance_agent import GovernanceAgent

analysis   = AnalysisAgent()
risk       = RiskAgent()
governance = GovernanceAgent()

PARAMS_HIGH = {"impact": 9, "likelihood": 9, "urgency": 9, "confidence": 5}
PARAMS_MED  = {"impact": 5, "likelihood": 5, "urgency": 5, "confidence": 5}
PARAMS_LOW  = {"impact": 2, "likelihood": 2, "urgency": 2, "confidence": 9}


# ── AnalysisAgent ──────────────────────────────────────────────────────────────

class TestAnalysisAgent:

    def test_returns_required_keys(self):
        result = analysis.analyze("System error detected", PARAMS_MED)
        assert all(k in result for k in ["agent", "score", "decision", "reason", "indicators", "detected_keywords"])

    def test_agent_name(self):
        assert analysis.analyze("Minor issue here", PARAMS_LOW)["agent"] == "AnalysisAgent"

    def test_decision_always_analyzed(self):
        assert analysis.analyze("Some problem description here", PARAMS_MED)["decision"] == "ANALYZED"

    def test_score_within_range(self):
        result = analysis.analyze("Critical security breach attack", PARAMS_HIGH)
        assert 0 <= result["score"] <= 10

    def test_detects_critical_keywords(self):
        result = analysis.analyze("ransomware attack has compromised the system", PARAMS_MED)
        assert len(result["detected_keywords"]) > 0

    def test_no_critical_keywords_in_clean_description(self):
        result = analysis.analyze("Routine scheduled maintenance update", PARAMS_LOW)
        assert not any(kw in ["breach", "attack", "hack", "malware"] for kw in result["detected_keywords"])

    def test_empty_description_raises(self):
        with pytest.raises(ValueError):
            analysis.analyze("", PARAMS_MED)

    def test_invalid_parameters_raises(self):
        with pytest.raises(ValueError):
            analysis.analyze("Some problem", {"impact": 11, "likelihood": 5, "urgency": 5, "confidence": 5})

    def test_high_impact_indicator(self):
        result = analysis.analyze("Some problem description here", PARAMS_HIGH)
        assert any("impact" in i.lower() for i in result["indicators"])


# ── RiskAgent ──────────────────────────────────────────────────────────────────

class TestRiskAgent:

    def test_returns_required_keys(self):
        result = risk.analyze("System error", PARAMS_MED)
        assert all(k in result for k in ["agent", "score", "decision", "reason", "keyword_boost"])

    def test_agent_name(self):
        assert risk.analyze("Minor issue here", PARAMS_LOW)["agent"] == "RiskAgent"

    def test_high_risk_decision(self):
        result = risk.analyze("critical security breach attack compromised", PARAMS_HIGH)
        assert result["decision"] == "HIGH"

    def test_low_risk_decision(self):
        result = risk.analyze("Routine maintenance scheduled today", PARAMS_LOW)
        assert result["decision"] == "LOW"

    def test_keyword_boost_applied(self):
        with_kw    = risk.analyze("ransomware attack breach detected", PARAMS_MED)
        without_kw = risk.analyze("Routine maintenance update scheduled", PARAMS_MED)
        assert with_kw["score"] > without_kw["score"]

    def test_base_formula(self):
        params = {"impact": 5, "likelihood": 4, "urgency": 3, "confidence": 2}
        result = risk.analyze("Routine maintenance update", params)
        assert result["score"] >= (5 * 4) + 3 - 2  # base = 21

    def test_invalid_parameters_raises(self):
        with pytest.raises(ValueError):
            risk.analyze("Some problem", {"impact": 0, "likelihood": 5, "urgency": 5, "confidence": 5})


# ── GovernanceAgent ────────────────────────────────────────────────────────────

class TestGovernanceAgent:

    def test_high_risk_blocks(self):
        assert governance.analyze("", {"risk_score": 75})["decision"] == "BLOCK"

    def test_medium_risk_reviews(self):
        assert governance.analyze("", {"risk_score": 60})["decision"] == "REVIEW"

    def test_warn_risk_warns(self):
        assert governance.analyze("", {"risk_score": 40})["decision"] == "WARN"

    def test_low_risk_allows(self):
        assert governance.analyze("", {"risk_score": 10})["decision"] == "ALLOW"

    def test_returns_required_keys(self):
        result = governance.analyze("", {"risk_score": 75})
        assert all(k in result for k in ["agent", "score", "decision", "reason", "recommended_actions", "confidence", "feature_breakdown"])

    def test_agent_name(self):
        assert governance.analyze("", {"risk_score": 10})["agent"] == "GovernanceAgent"

    def test_security_context_in_reason(self):
        result = governance.analyze("security breach detected", {"risk_score": 75})
        assert "security" in result["reason"].lower()

    def test_recommended_actions_not_empty(self):
        for score in [80, 60, 40, 10]:
            assert len(governance.analyze("", {"risk_score": score})["recommended_actions"]) > 0

    def test_scores_are_passed_through(self):
        assert governance.analyze("", {"risk_score": 85.5})["score"] == 85.5
        assert governance.analyze("", {"risk_score": 60.0})["score"] == 60.0
        assert governance.analyze("", {"risk_score": 10.0})["score"] == 10.0
