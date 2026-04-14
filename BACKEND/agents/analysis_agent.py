import json
from groq import Groq
from config import settings
from constants import CRITICAL_KEYWORDS, HIGH_KEYWORDS


client = Groq(api_key=settings.groq_api_key)

SYSTEM_PROMPT = """You are a risk analysis expert. Analyze the given problem description and return ONLY a valid JSON object with this exact structure:
{
  "impact": <integer between 1 and 10>,
  "likelihood": <integer between 1 and 10>,
  "urgency": <integer between 1 and 10>,
  "confidence": <integer between 1 and 10>,
  "parameter_reasoning": "<one sentence explaining why these parameters were assigned>",
  "indicators": ["list of risk indicators you identified"],
  "detected_keywords": ["list of risk-related words found in the text"],
  "score": <float between 1.0 and 10.0>,
  "reason": "<one sentence summary of your analysis>"
}

Rules:
- impact, likelihood, urgency, confidence: rate from 1 to 10 based on problem severity, probability, time pressure, and data clarity.
- parameter_reasoning: briefly justify the 4 inferred parameters based on problem context.
- indicators: identify actual risk factors from the text meaning and context.
- detected_keywords: pick out words that signal risk, urgency, or danger.
- score: rate overall severity from 1 (no risk) to 10 (critical risk).
- reason: explain your score in one clear sentence.
- Return ONLY the JSON object, absolutely no extra text."""


from agents.base_agent import BaseAgent
from typing import Dict, Any

class AnalysisAgent(BaseAgent):

    def _call_llm(self, problem_description: str) -> Dict[str, Any]:
        try:
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"Problem: {problem_description}"}
                ],
                temperature=0.2,
                max_tokens=512,
                response_format={"type": "json_object"}
            )
            parsed = json.loads(response.choices[0].message.content.strip())
            return {
                "indicators": parsed.get("indicators", []),
                "keywords": parsed.get("detected_keywords", []),
                "score": float(parsed.get("score", 5.0)) if parsed.get("score") is not None else 5.0,
                "reason": parsed.get("reason", ""),
                "inferred_parameters": {
                    "impact": int(parsed.get("impact", 5)),
                    "likelihood": int(parsed.get("likelihood", 5)),
                    "urgency": int(parsed.get("urgency", 5)),
                    "confidence": int(parsed.get("confidence", 5)),
                    "reasoning": parsed.get("parameter_reasoning", "Inferred by AI based on context.")
                }
            }
        except Exception as e:
            return {
                "indicators": [], "keywords": [], "score": None, 
                "reason": f"LLM unavailable or parsing failed. ({str(e)})", 
                "inferred_parameters": None
            }

    def _rule_based_analysis(self, problem_description: str, parameters: Dict[str, Any], llm_keywords: list) -> Dict[str, Any]:
        indicators, keywords = [], []
        text = problem_description.lower()

        for kw in CRITICAL_KEYWORDS:
            if kw in text and kw not in llm_keywords:
                keywords.append(kw)
                indicators.append(f"Critical keyword detected: '{kw}'")
        for kw in HIGH_KEYWORDS:
            if kw in text and kw not in llm_keywords and kw not in keywords:
                keywords.append(kw)
                indicators.append(f"High-risk keyword detected: '{kw}'")

        impact, likelihood = parameters["impact"], parameters["likelihood"]
        urgency, confidence = parameters["urgency"], parameters["confidence"]

        for label, val, high_msg, mid_msg in [
            ("impact", impact, f"High impact level ({impact}/10) — significant consequences expected", f"Moderate impact level ({impact}/10)"),
            ("likelihood", likelihood, f"High likelihood ({likelihood}/10) — occurrence is probable", f"Moderate likelihood ({likelihood}/10)"),
            ("urgency", urgency, f"High urgency ({urgency}/10) — immediate attention required", f"Moderate urgency ({urgency}/10)"),
        ]:
            if val >= 7:
                indicators.append(high_msg)
            elif val >= 4:
                indicators.append(mid_msg)

        if confidence <= 3:
            indicators.append(f"Low confidence ({confidence}/10) — data reliability is uncertain")
        elif confidence >= 8:
            indicators.append(f"High confidence ({confidence}/10) — data is reliable")

        return {"indicators": indicators, "keywords": keywords}

    def _blend_scores(self, llm: Dict, rule: Dict, parameters: Dict[str, Any]) -> tuple:
        param_avg = sum(parameters.values()) / len(parameters)
        all_keywords = list(set(llm["keywords"] + rule["keywords"]))
        if llm["score"] is not None:
            score = round(min((llm["score"] * 0.7) + (param_avg * 0.3), 10.0), 2)
            reason = llm["reason"]
        else:
            score = round(min(param_avg + min(len(all_keywords) * 0.3, 2.0), 10.0), 2)
            reason = f"No critical keywords detected. {len(rule['indicators'])} parameter-based indicator(s) evaluated."
        return score, reason, all_keywords

    def analyze(self, problem_description: str, parameters: Dict[str, Any] = None, auto_detect: bool = False) -> Dict[str, Any]:
        if parameters is None:
            parameters = {}
        if not problem_description or not problem_description.strip():
            raise ValueError("Problem description cannot be empty")

        # Reject explicit parameter values outside 1-10 (API also validates; agents used directly should fail fast)
        for key in ("impact", "likelihood", "urgency", "confidence"):
            if key in parameters and parameters[key] is not None:
                val = parameters[key]
                if not isinstance(val, (int, float)) or val < 1 or val > 10:
                    raise ValueError(f"{key} must be an integer between 1 and 10")

        llm = self._call_llm(problem_description)

        if auto_detect or not all([parameters.get("impact"), parameters.get("likelihood"), parameters.get("urgency"), parameters.get("confidence")]):
            inferred = llm.get("inferred_parameters") or {"impact":5, "likelihood":5, "urgency":5, "confidence":5, "reasoning":"Fallback to defaults"}
            impact = inferred.get("impact", 5)
            likelihood = inferred.get("likelihood", 5)
            urgency = inferred.get("urgency", 5)
            confidence = inferred.get("confidence", 5)
            parameter_reasoning = inferred.get("reasoning", "Inferred by LLM.")
        else:
            impact = parameters.get("impact", 5)
            likelihood = parameters.get("likelihood", 5)
            urgency = parameters.get("urgency", 5)
            confidence = parameters.get("confidence", 5)
            parameter_reasoning = "User provided parameters."

        # Ensure parameters are within bounds
        impact = max(1, min(10, impact))
        likelihood = max(1, min(10, likelihood))
        urgency = max(1, min(10, urgency))
        confidence = max(1, min(10, confidence))

        params = {"impact": impact, "likelihood": likelihood, "urgency": urgency, "confidence": confidence}
        rule = self._rule_based_analysis(problem_description, params, llm["keywords"])
        score, reason, all_keywords = self._blend_scores(llm, rule, params)

        return {
            "agent": "AnalysisAgent",
            "score": score,
            "confidence": round(min(1.0, confidence / 10.0), 2),
            "feature_breakdown": {
                "Data Clarity": confidence * 10.0,
                "Context Completeness": likelihood * 10.0
            },
            "decision": "ANALYZED",
            "reason": reason,
            "indicators": llm["indicators"] + rule["indicators"],
            "detected_keywords": all_keywords,
            "inferred_parameters": params,
            "parameter_reasoning": parameter_reasoning
        }
