import json
from groq import Groq
from config import settings
from agents.base_agent import BaseAgent
from typing import Dict, Any

client = Groq(api_key=settings.groq_api_key)

SYSTEM_PROMPT = """You are an Adversarial AI (Devil's Advocate) in a risk governance pipeline. 
Your job is to critically review the initial analysis of a problem and generate potential attack scenarios (like Prompt Injection, Data Leakage, Bias Exploitation).
Return ONLY a valid JSON object with the exact following structure:
{
  "adversarial_score": <float between 0.0 and 100.0 representing the critical risk level>,
  "critique": "A sharp, 2-3 sentence argument detailing what the initial analysis missed.",
  "worst_case_scenario": "A 1-2 sentence description of a cascading failure.",
  "confidence_in_critique": <float between 0.0 and 1.0>,
  "attack_scenarios": [
    {
      "attack_type": "Prompt Injection / Data Leak / Bias / Logic Exploit",
      "severity": "Low / Medium / High / Critical",
      "description": "How this specific attack would be executed.",
      "mitigation": "Technical recommendation to prevent it."
    }
  ]
}
Do not include markdown blocks, just the raw JSON object."""

class AdversarialAgent(BaseAgent):
    def analyze(self, problem_description: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        if context is None:
            context = {}
            
        initial_score = float(context.get('analysis_score', 50.0))
        parameters = context.get('parameters', {})
        
        try:
            prompt_context = f"""
            Problem: {problem_description}
            Parameters: {parameters}
            Initial Analysis Score: {initial_score}/100.0
            """
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt_context}
                ],
                temperature=0.7,
                max_tokens=800,
                response_format={"type": "json_object"}
            )
            parsed = json.loads(response.choices[0].message.content.strip())
            
            adv_score = float(parsed.get("adversarial_score", initial_score))
            conf = float(parsed.get("confidence_in_critique", 0.7))
            attacks = parsed.get("attack_scenarios", [])
            
            breakdown = {
                "Initial Score Deviation": round(adv_score - initial_score, 1),
                "Attack Vectors Found": float(len(attacks) * 10.0),
                "Critical Vulnerabilities": float(sum(1 for a in attacks if a.get("severity") in ["High", "Critical"]) * 15.0)
            }
            
            return {
                "agent": "AdversarialAgent",
                "score": adv_score,
                "confidence": conf,
                "feature_breakdown": breakdown,
                "decision": "CRITIQUED",
                "reason": parsed.get("critique", "Critique generated."),
                "critique": parsed.get("critique", "Critique unavailable."),
                "worst_case_scenario": parsed.get("worst_case_scenario", "Scenario unavailable."),
                "confidence_in_critique": int(conf * 10),
                "attack_scenarios": attacks
            }
        except Exception as e:
            return {
                "agent": "AdversarialAgent",
                "score": float(initial_score),
                "confidence": 0.0,
                "feature_breakdown": {"Error": 0.0},
                "decision": "FAILED",
                "reason": f"Failed to generate adversarial critique: {str(e)}",
                "critique": "Error generating critique.",
                "worst_case_scenario": "Error.",
                "confidence_in_critique": 0,
                "attack_scenarios": []
            }
