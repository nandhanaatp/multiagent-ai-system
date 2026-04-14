CRITICAL_KEYWORDS = [
    "critical", "breach", "attack", "hack", "exploit", "malware", "ransomware",
    "data loss", "system down", "outage", "failure", "emergency", "severe",
    "unauthorized access", "intrusion", "corruption", "crash", "compromised"
]

HIGH_KEYWORDS = [
    "security", "vulnerability", "threat", "risk", "error", "bug", "leak",
    "performance", "slow", "degraded", "warning", "alert", "suspicious",
    "unusual", "abnormal", "overload", "timeout", "memory", "cpu"
]

# Risk score thresholds
HIGH_RISK_THRESHOLD   = 70
MEDIUM_RISK_THRESHOLD = 40

# Keyword boost weights
CRITICAL_KEYWORD_BOOST = 8
HIGH_KEYWORD_BOOST     = 3
REDUCE_KEYWORD_BOOST   = -5

REDUCE_KEYWORDS = [
    "test", "backup", "staging", "development", "sandbox", "dry run", "demo"
]
