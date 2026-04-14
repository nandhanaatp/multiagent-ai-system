import json
from groq import Groq
from config import settings
from agents.base_agent import BaseAgent
from typing import Dict, Any

client = Groq(api_key=settings.groq_api_key)

SYSTEM_PROMPT = """You are a task decomposition expert. Break down the given problem into clear subtasks and return ONLY a valid JSON object:
{
  "subtasks": ["subtask 1", "subtask 2", ...],
  "complexity": "LOW" | "MEDIUM" | "HIGH",
  "reason": "<one sentence explaining the decomposition>"
}
Rules:
- subtasks: 2 to 5 actionable subtasks
- complexity: overall complexity of the problem
- Return ONLY the JSON object, no extra text"""


class TaskDecomposerAgent(BaseAgent):

    def _call_llm(self, problem_description: str) -> Dict[str, Any]:
        try:
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"Problem: {problem_description}"}
                ],
                temperature=0.3,
                max_tokens=512
            )
            parsed = json.loads(response.choices[0].message.content.strip())
            return {
                "subtasks": parsed.get("subtasks", []),
                "complexity": parsed.get("complexity", "MEDIUM"),
                "reason": parsed.get("reason", "")
            }
        except Exception as e:
            return {
                "subtasks": [f"Analyze: {problem_description[:100]}"],
                "complexity": "MEDIUM",
                "reason": f"LLM unavailable, using fallback. ({str(e)})"
            }

    def analyze(self, problem_description: str, parameters: Dict[str, Any] = None) -> Dict[str, Any]:
        if not problem_description or not problem_description.strip():
            raise ValueError("Problem description cannot be empty")

        result = self._call_llm(problem_description)

        return {
            "agent": "TaskDecomposerAgent",
            "score": {"LOW": 3.0, "MEDIUM": 6.0, "HIGH": 9.0}.get(result["complexity"], 6.0),
            "decision": result["complexity"],
            "reason": result["reason"],
            "subtasks": result["subtasks"]
        }
