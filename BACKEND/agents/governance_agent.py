class GovernanceAgent:

    def evaluate(self, risk_level):

        if risk_level == "HIGH":
            decision = "BLOCK"
            score = 9
            reason = "High-risk issues require immediate restriction"

        elif risk_level == "MEDIUM":
            decision = "REVIEW"
            score = 6
            reason = "Medium-risk issues require human review"

        else:
            decision = "ALLOW"
            score = 3
            reason = "Low-risk issues can proceed"

        return {
            "agent": "GovernanceAgent",
            "score": score,
            "decision": decision,
            "policy": reason
        }