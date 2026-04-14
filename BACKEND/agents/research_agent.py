import json
from groq import Groq
from config import settings
from agents.base_agent import BaseAgent
from typing import Dict, Any, List

client = Groq(api_key=settings.groq_api_key)

SYSTEM_PROMPT = """You are a research expert. Given a problem and its subtasks, gather relevant context and return ONLY a valid JSON object:
{
  "findings": ["key finding 1", "key finding 2", ...],
  "context": "<brief background context for the problem>",
  "references": ["relevant concept or domain 1", "relevant concept or domain 2"],
  "reason": "<one sentence summarizing the research>"
}
Rules:
- findings: 3 to 5 key facts or insights relevant to the problem
- context: 1-2 sentences of background
- references: relevant domains, frameworks, or concepts
- Return ONLY the JSON object, no extra text"""


class ResearchAgent(BaseAgent):

    def _call_llm(self, problem_description: str, subtasks: List[str]) -> Dict[str, Any]:
        subtasks_text = "\n".join(f"- {s}" for s in subtasks)
        
        # Real-Time Web Search
        web_context = ""
        try:
            from duckduckgo_search import DDGS
            with DDGS() as ddgs:
                # Try fetching news from the past week first
                results = list(ddgs.text(problem_description + " latest news", max_results=3, timelimit='w'))
                if not results:
                    # Fallback to past month
                    results = list(ddgs.text(problem_description, max_results=3, timelimit='m'))
                if not results:
                    # Ultimate fallback: No time limit (for lists, comprehensive research, older articles)
                    results = list(ddgs.text(problem_description, max_results=4))
                
                if results:
                    web_context = "### REAL-TIME LIVE WEB DATA (MUST USE) ###\n"
                    for r in results:
                        web_context += f"- Source ({r.get('title', '')}): {r.get('body', '')}\n"
        except Exception as e:
            web_context = f"### Web Search Unavailable ###\nError: {e}\n"

        user_content = f"Problem: {problem_description}\n\nSubtasks:\n{subtasks_text}"
        if web_context:
            user_content += f"\n\n{web_context}\n\nCRITICAL INSTRUCTION: You MUST align your answer, findings, and context with the REAL-TIME LIVE WEB DATA provided above. Ignore your outdated training data if it contradicts the live web search context."

        try:
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_content}
                ],
                temperature=0.3,
                max_tokens=512
            )
            parsed = json.loads(response.choices[0].message.content.strip())
            return {
                "findings": parsed.get("findings", []),
                "context": parsed.get("context", ""),
                "references": parsed.get("references", []),
                "reason": parsed.get("reason", "")
            }
        except Exception as e:
            return {
                "findings": ["Unable to retrieve findings due to LLM unavailability"],
                "context": "Context unavailable",
                "references": [],
                "reason": f"LLM unavailable, using fallback. ({str(e)})"
            }

    def analyze(self, problem_description: str, parameters: Dict[str, Any] = None) -> Dict[str, Any]:
        if not problem_description or not problem_description.strip():
            raise ValueError("Problem description cannot be empty")

        subtasks = (parameters or {}).get("subtasks", [problem_description])
        result = self._call_llm(problem_description, subtasks)

        return {
            "agent": "ResearchAgent",
            "score": min(len(result["findings"]) * 2.0, 10.0),
            "decision": "RESEARCHED",
            "reason": result["reason"],
            "findings": result["findings"],
            "context": result["context"],
            "references": result["references"]
        }
