class AnalysisAgent:

    def analyze(self, problem_description, parameters):

        indicators = []

        impact = parameters.get("impact", 0)
        likelihood = parameters.get("likelihood", 0)
        urgency = parameters.get("urgency", 0)
        confidence = parameters.get("confidence", 5)

        # Score calculation
        score = (impact + likelihood + urgency + confidence) / 4

        # Reasoning logic
        if impact >= 7:
            indicators.append("High impact level detected")

        if likelihood >= 7:
            indicators.append("High likelihood of occurrence")

        if urgency >= 7:
            indicators.append("Urgent attention required")

        if confidence <= 3:
            indicators.append("Low confidence in available data")

        if not indicators:
            summary = "No major red flags detected"
        else:
            summary = "Critical indicators identified"

        return {
            "agent": "AnalysisAgent",
            "score": score,
            "decision": "ANALYZED",
            "reason": summary,
            "problem_description": problem_description,
            "indicators": indicators
        }