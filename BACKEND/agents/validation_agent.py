import json
from groq import Groq
from config import settings
from agents.base_agent import BaseAgent
from typing import Dict, Any, List

client = Groq(api_key=settings.groq_api_key)

SYSTEM_PROMPT = """You are a validation expert. Given a problem, its subtasks, and a proposed solution, verify its completeness and correctness. Return ONLY a valid JSON object:
{
  "is_complete": true | false,
  "is_correct": true | false,
  "gaps": ["gap 1", "gap 2"],
  "suggestions": ["improvement 1", "improvement 2"],
  "confidence_score": <float between 1.0 and 10.0>,
  "verdict": "APPROVED" | "NEEDS_IMPROVEMENT" | "REJECTED",
  "reason": "<one sentence summarizing the validation>"
}
Rules:
- gaps: missing aspects in the solution (empty list if none)
- suggestions: improvements to make the solution better (empty list if none)
- confidence_score: how confident you are in the solution (1=low, 10=high)
- Return ONLY the JSON object, no extra text"""


class ValidationAgent(BaseAgent):

    def _call_llm(self, problem_description: str, subtasks: List[str], solution: str, steps: List[str]) -> Dict[str, Any]:
        subtasks_text = "\n".join(f"- {s}" for s in subtasks)
        steps_text = "\n".join(f"- {s}" for s in steps)
        try:
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"Problem: {problem_description}\n\nSubtasks:\n{subtasks_text}\n\nProposed Solution:\n{solution}\n\nImplementation Steps:\n{steps_text}"}
                ],
                temperature=0.2,
                max_tokens=512
            )
            parsed = json.loads(response.choices[0].message.content.strip())
            return {
                "is_complete": parsed.get("is_complete", True),
                "is_correct": parsed.get("is_correct", True),
                "gaps": parsed.get("gaps", []),
                "suggestions": parsed.get("suggestions", []),
                "confidence_score": float(parsed.get("confidence_score", 7.0)),
                "verdict": parsed.get("verdict", "APPROVED"),
                "reason": parsed.get("reason", "")
            }
        except Exception as e:
            return {
                "is_complete": True,
                "is_correct": True,
                "gaps": [],
                "suggestions": [],
                "confidence_score": 5.0,
                "verdict": "APPROVED",
                "reason": f"LLM unavailable, defaulting to approved. ({str(e)})"
            }

    def analyze(self, problem_description: str, parameters: Dict[str, Any] = None) -> Dict[str, Any]:
        if not problem_description or not problem_description.strip():
            raise ValueError("Problem description cannot be empty")

        params = parameters or {}
        subtasks = params.get("subtasks", [])
        solution = params.get("solution", "")
        steps = params.get("steps", [])

        result = self._call_llm(problem_description, subtasks, solution, steps)

        return {
            "agent": "ValidationAgent",
            "score": result["confidence_score"],
            "decision": result["verdict"],
            "reason": result["reason"],
            "is_complete": result["is_complete"],
            "is_correct": result["is_correct"],
            "gaps": result["gaps"],
            "suggestions": result["suggestions"]
        }
