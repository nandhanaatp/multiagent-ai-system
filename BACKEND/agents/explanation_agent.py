import json
from groq import Groq
from config import settings
from agents.base_agent import BaseAgent
from typing import Dict, Any

client = Groq(api_key=settings.groq_api_key)

SYSTEM_PROMPT = """You are an Explainable AI agent tasked with providing a deep, human-readable justification for an automated decision in a governance pipeline.
You will be provided with the problem description, inferred parameters, the calculated risk score, and the final decision.
Return ONLY a valid JSON object with the exact following structure:
{
  "summary": "A 1-sentence high level summary of the decision.",
  "detailed_reasoning": "A detailed explanation (3-4 sentences) outlining exactly how the parameters and problem context led to the calculated risk score.",
  "policy_justification": "A paragraph explaining why the final decision is the correct action to take from a policy, security, and risk standpoint.",
  "real_world_consequences": "A paragraph detailing the consequences if this action proceeds unchecked.",
  "mitigation_strategies": "Recommend 2-3 safer alternatives or mitigations."
}
Do not include markdown blocks, just the raw JSON object."""

class ExplanationAgent(BaseAgent):
    def analyze(self, problem_description: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        if context is None:
            context = {}
        
        try:
            prompt_context = f"""
Problem: {problem_description}
Parameters: {context.get('parameters', {})}
Risk Level: {context.get('risk_level', 'UNKNOWN')}
Risk Score: {context.get('risk_score', 'UNKNOWN')}
Final Decision: {context.get('final_decision', 'UNKNOWN')}
            """
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt_context}
                ],
                temperature=0.3,
                max_tokens=1024,
                response_format={"type": "json_object"}
            )
            parsed = json.loads(response.choices[0].message.content.strip())
            
            return {
                "agent": "ExplanationAgent",
                "score": 10.0,
                "confidence": 0.95,
                "feature_breakdown": {"Completeness": 100.0},
                "decision": "EXPLAINED",
                "reason": "Rich explanation generated successfully.",
                "summary": parsed.get("summary", "Summary unavailable."),
                "detailed_reasoning": parsed.get("detailed_reasoning", "Detailed reasoning unavailable."),
                "policy_justification": parsed.get("policy_justification", "Justification unavailable."),
                "real_world_consequences": parsed.get("real_world_consequences", "Consequences unavailable."),
                "mitigation_strategies": parsed.get("mitigation_strategies", "Alternatives unavailable.")
            }
        except Exception as e:
            return {
                "agent": "ExplanationAgent",
                "score": 5.0,
                "confidence": 0.0,
                "feature_breakdown": {"Error": 0.0},
                "decision": "FAILED",
                "reason": f"Failed to generate explanation: {str(e)}",
                "summary": "Error generating explanation.",
                "detailed_reasoning": "Error.",
                "policy_justification": "Error.",
                "real_world_consequences": "Error.",
                "mitigation_strategies": "Error."
            }
