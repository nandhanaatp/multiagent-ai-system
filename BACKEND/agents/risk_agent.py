from constants import CRITICAL_KEYWORDS, HIGH_KEYWORDS, REDUCE_KEYWORDS, HIGH_RISK_THRESHOLD, MEDIUM_RISK_THRESHOLD, CRITICAL_KEYWORD_BOOST, HIGH_KEYWORD_BOOST, REDUCE_KEYWORD_BOOST
from agents.base_agent import BaseAgent
from typing import Dict, Any

class RiskAgent(BaseAgent):

    def _keyword_analysis(self, text: str) -> Dict[str, Any]:
        critical_hits = [kw for kw in CRITICAL_KEYWORDS if kw in text]
        high_hits = [kw for kw in HIGH_KEYWORDS if kw in text]
        reduce_hits = [kw for kw in REDUCE_KEYWORDS if kw in text]
        boost = (len(critical_hits) * CRITICAL_KEYWORD_BOOST) + (len(high_hits) * HIGH_KEYWORD_BOOST) + (len(reduce_hits) * REDUCE_KEYWORD_BOOST)
        return {"critical_hits": critical_hits, "high_hits": high_hits, "reduce_hits": reduce_hits, "boost": boost}

    def _build_reasons(self, critical_hits: list, high_hits: list, reduce_hits: list, impact: int, likelihood: int, urgency: int) -> list:
        reasons = []
        if critical_hits:
            reasons.append(f"Critical terms found in problem: {', '.join(critical_hits[:3])}")
        if high_hits:
            reasons.append(f"High-risk terms found: {', '.join(high_hits[:3])}")
        if reduce_hits:
            reasons.append(f"Context flags reducing risk: {', '.join(reduce_hits[:3])}")
        if impact >= 7:
            reasons.append(f"High impact score ({impact}/10)")
        if likelihood >= 7:
            reasons.append(f"High likelihood score ({likelihood}/10)")
        if urgency >= 7:
            reasons.append(f"High urgency score ({urgency}/10)")
        return reasons

    def _determine_risk_level(self, risk_score: float, reasons: list) -> str:
        if risk_score >= HIGH_RISK_THRESHOLD:
            if not reasons:
                reasons.append("Combined parameter scores indicate high risk")
            return "HIGH"
        elif risk_score >= MEDIUM_RISK_THRESHOLD:
            if not reasons:
                reasons.append("Moderate risk based on parameters and problem context")
            return "MEDIUM"
        else:
            if not reasons:
                reasons.append("Low risk — no critical indicators found in problem description")
            return "LOW"

    def analyze(self, problem_description: str, parameters: Dict[str, Any] = None) -> Dict[str, Any]:
        if parameters is None:
            parameters = {}
        impact = parameters.get("impact", 0)
        likelihood = parameters.get("likelihood", 0)
        urgency = parameters.get("urgency", 0)
        confidence_param = parameters.get("confidence", 5)

        if not all(1 <= val <= 10 for val in [impact, likelihood, urgency, confidence_param]):
            raise ValueError("All parameters must be between 1 and 10")

        kw = self._keyword_analysis(problem_description.lower())
        
        # Calculate Feature Breakdown
        base_risk = (impact * likelihood) # up to 100
        urgency_mod = urgency * 1.5 # up to +15
        conf_mod = -(confidence_param * 1.5) # up to -15
        kw_boost = kw["boost"]
        
        raw_score = base_risk + urgency_mod + conf_mod + kw_boost
        risk_score = max(0.0, min(100.0, float(raw_score))) # Clamp to 0-100 range
        
        reasons = self._build_reasons(kw["critical_hits"], kw["high_hits"], kw["reduce_hits"], impact, likelihood, urgency)
        risk_level = self._determine_risk_level(risk_score, reasons)
        
        breakdown = {
            "Base Risk (Impact x Likelihood)": round(base_risk, 1),
            "Urgency Modifier": round(urgency_mod, 1),
            "Confidence Reduction": round(conf_mod, 1),
            "Keyword Context Boost": round(kw_boost, 1)
        }

        return {
            "agent": "RiskAgent",
            "score": round(risk_score, 2),
            "confidence": round(min(1.0, confidence_param / 10.0), 2),
            "feature_breakdown": breakdown,
            "decision": risk_level,
            "reason": ". ".join(reasons) + f". Computed risk score: {round(risk_score, 2)}/100.",
            "keyword_boost": kw["boost"],
            "critical_hits": kw["critical_hits"],
            "high_hits": kw["high_hits"],
            "reduce_hits": kw["reduce_hits"]
        }
