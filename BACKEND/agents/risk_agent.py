class RiskAgent:

    def analyze(self, problem_description, parameters):

        impact = parameters.get("impact", 0)
        likelihood = parameters.get("likelihood", 0)
        urgency = parameters.get("urgency", 0)
        confidence = parameters.get("confidence", 5)

        # Risk model
        risk_score = (impact * likelihood) + urgency - confidence

        if risk_score >= 60:
            risk_level = "HIGH"
            reason = "High combined impact and likelihood detected"
        elif risk_score >= 30:
            risk_level = "MEDIUM"
            reason = "Moderate risk based on parameters"
        else:
            risk_level = "LOW"
            reason = "Low risk level detected"

        return {
            "agent": "RiskAgent",
            "score": risk_score,
            "decision": risk_level,
            "reason": reason
        }