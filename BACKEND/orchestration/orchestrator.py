from agents.analysis_agent import AnalysisAgent
from agents.risk_agent import RiskAgent
from agents.governance_agent import GovernanceAgent


class Orchestrator:

    def process(self, input_data):

        problem_description = input_data.get("problem_description")
        parameters = input_data.get("parameters", {})

        # Initialize agents
        analysis_agent = AnalysisAgent()
        risk_agent = RiskAgent()
        governance_agent = GovernanceAgent()

        # Run Analysis Agent
        analysis_result = analysis_agent.analyze(problem_description, parameters)

        analysis_score = analysis_result.get("score")
        analysis_reason = analysis_result.get("reason")

        # Run Risk Agent
        risk_result = risk_agent.analyze(problem_description, parameters)

        risk_level = risk_result.get("risk_level")
        risk_score = risk_result.get("score")
        risk_reason = risk_result.get("reason")

        # Run Governance Agent
        governance_result = governance_agent.evaluate(risk_level)

        governance_score = governance_result.get("score")
        final_decision = governance_result.get("decision")
        policy_reason = governance_result.get("policy")

        explanation_text = (
            "The final decision was derived using multi-agent reasoning "
            "over structured problem parameters."
        )

        return {

            "analysis_output": {
                "agent": "AnalysisAgent",
                "score": analysis_score,
                "decision": None,
                "reason": analysis_reason
            },

            "risk_output": {
                "agent": "RiskAgent",
                "score": risk_score,
                "decision": risk_level,
                "reason": risk_reason
            },

            "governance_output": {
                "agent": "GovernanceAgent",
                "score": governance_score,
                "decision": final_decision,
                "reason": policy_reason
            },

            "final_decision": final_decision,
            "explanation": explanation_text
        }