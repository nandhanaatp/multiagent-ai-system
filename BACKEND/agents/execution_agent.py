import json
from groq import Groq
from config import settings
from agents.base_agent import BaseAgent
from typing import Dict, Any, List

client = Groq(api_key=settings.groq_api_key)

SYSTEM_PROMPT = """You are an execution expert. Given a problem, its subtasks, and research findings, generate a concrete solution and return ONLY a valid JSON object:
{
  "solution": "<detailed solution or action plan>",
  "steps": ["step 1", "step 2", ...],
  "estimated_effort": "LOW" | "MEDIUM" | "HIGH",
  "reason": "<one sentence explaining the solution approach>"
}
Rules:
- solution: a clear, actionable solution to the problem
- steps: 3 to 6 concrete implementation steps
- estimated_effort: effort required to implement
- Return ONLY the JSON object, no extra text"""


class ExecutionAgent(BaseAgent):

    def _call_llm(self, problem_description: str, subtasks: List[str], findings: List[str]) -> Dict[str, Any]:
        subtasks_text = "\n".join(f"- {s}" for s in subtasks)
        findings_text = "\n".join(f"- {f}" for f in findings)
        try:
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"Problem: {problem_description}\n\nSubtasks:\n{subtasks_text}\n\nResearch Findings:\n{findings_text}"}
                ],
                temperature=0.4,
                max_tokens=1024
            )
            parsed = json.loads(response.choices[0].message.content.strip())
            return {
                "solution": parsed.get("solution", ""),
                "steps": parsed.get("steps", []),
                "estimated_effort": parsed.get("estimated_effort", "MEDIUM"),
                "reason": parsed.get("reason", "")
            }
        except Exception as e:
            return {
                "solution": "Unable to generate solution due to LLM unavailability",
                "steps": ["Manual intervention required"],
                "estimated_effort": "MEDIUM",
                "reason": f"LLM unavailable, using fallback. ({str(e)})"
            }

    def analyze(self, problem_description: str, parameters: Dict[str, Any] = None) -> Dict[str, Any]:
        if not problem_description or not problem_description.strip():
            raise ValueError("Problem description cannot be empty")

        params = parameters or {}
        subtasks = params.get("subtasks", [problem_description])
        findings = params.get("findings", [])
        result = self._call_llm(problem_description, subtasks, findings)

        effort_score = {"LOW": 3.0, "MEDIUM": 6.0, "HIGH": 9.0}.get(result["estimated_effort"], 6.0)

        return {
            "agent": "ExecutionAgent",
            "score": effort_score,
            "decision": result["estimated_effort"],
            "reason": result["reason"],
            "solution": result["solution"],
            "steps": result["steps"]
        }
