from agents.base_agent import BaseAgent
from typing import Dict, Any

class GovernanceAgent(BaseAgent):

    DEFAULT_POLICIES = {
        "HIGH": {
            "decision": "BLOCK",
            "score": 9,
            "reason": "High-risk classification triggers immediate blocking policy",
            "actions": [
                "Immediately restrict access or halt the process",
                "Escalate to security/management team",
                "Conduct full incident investigation",
                "Document and log all related activities"
            ]
        },
        "MEDIUM": {
            "decision": "REVIEW",
            "score": 6,
            "reason": "Medium-risk classification requires human review before proceeding",
            "actions": [
                "Flag for manual review by authorized personnel",
                "Gather additional context and evidence",
                "Monitor closely for escalation",
                "Set a review deadline within 24-48 hours"
            ]
        },
        "LOW": {
            "decision": "ALLOW",
            "score": 3,
            "reason": "Low-risk classification — issue can proceed with standard monitoring",
            "actions": [
                "Allow the process to continue",
                "Log the event for audit trail",
                "Schedule routine follow-up check",
                "No immediate action required"
            ]
        }
    }

    def analyze(self, problem_description: str, parameters: Dict[str, Any] = None) -> Dict[str, Any]:
        if parameters is None:
            parameters = {}

        risk_level = parameters.get("risk_level", "LOW").upper()
        policy_overrides = parameters.get("policy_overrides") or {}

        # Use user-defined policy overrides if available, else fall back to defaults
        policies = {**self.DEFAULT_POLICIES, **policy_overrides}
        policy = policies.get(risk_level, policies["LOW"])

        decision = policy["decision"]
        score = float(policy["score"])
        reason = policy["reason"]
        actions = list(policy["actions"])

        text = problem_description.lower()
        if "security" in text or "breach" in text:
            reason += " Security incident protocol applied."
        elif "data" in text or "leak" in text:
            reason += " Data protection protocol applied."

        return {
            "agent": "GovernanceAgent",
            "score": score,
            "confidence": 0.95,
            "feature_breakdown": {
                "Risk Level": risk_level,
                "Policy Source": "override" if risk_level in policy_overrides else "default"
            },
            "decision": decision,
            "reason": reason,
            "recommended_actions": actions
        }
