import React from "react";

const VERDICT_META = {
  APPROVED:          { icon: "✅", color: "#16a34a" },
  NEEDS_IMPROVEMENT: { icon: "⚠️", color: "#f59e0b" },
  REJECTED:          { icon: "🚫", color: "#dc2626" },
};

const DECISION_META = {
  ALLOW:  { color: "#16a34a" },
  WARN:   { color: "#f59e0b" },
  REVIEW: { color: "#ea580c" },
  BLOCK:  { color: "#dc2626" },
};

const ConfidenceBar = ({ confidence }) => {
  const percentage = confidence ? Math.round(confidence * 100) : 0;
  return (
    <div className="confidence-container" style={{ margin: "1rem 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontSize: "0.85rem", fontWeight: "bold", color: "#475569" }}>
        <span>Agent Confidence</span>
        <span>{percentage}%</span>
      </div>
      <div style={{ width: "100%", height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
        <div style={{ 
          width: `${percentage}%`, 
          height: "100%", 
          background: percentage >= 80 ? "#22c55e" : percentage >= 50 ? "#eab308" : "#ef4444",
          transition: "width 1s ease-in-out" 
        }}></div>
      </div>
    </div>
  );
};

const RiskMeter = ({ score }) => {
  const riskValue = isNaN(score) ? 0 : Math.min(100, Math.max(0, score));
  return (
    <div className="risk-meter-container" style={{ margin: "1rem 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontSize: "0.85rem", fontWeight: "bold", color: "#475569" }}>
        <span>Risk Severity Meter</span>
        <span style={{color: riskValue > 70 ? "#dc2626" : riskValue > 40 ? "#ea580c" : riskValue > 20 ? "#f59e0b" : "#16a34a"}}>{riskValue}/100</span>
      </div>
      <div style={{ width: "100%", height: "12px", background: "#e2e8f0", borderRadius: "6px", overflow: "hidden", display: "flex" }}>
        <div style={{ flex: 3, background: "#22c55e", opacity: riskValue <= 40 ? 1 : 0.3 }}></div>
        <div style={{ flex: 3, background: "#f59e0b", opacity: riskValue > 40 && riskValue <= 70 ? 1 : 0.3 }}></div>
        <div style={{ flex: 4, background: "#dc2626", opacity: riskValue > 70 ? 1 : 0.3 }}></div>
        <div 
          style={{ 
            position: "absolute", 
            width: "4px", 
            height: "16px", 
            background: "#0f172a", 
            top: "-2px", 
            left: `calc(${riskValue}% - 2px)`,
            transition: "left 1s ease-out",
            borderRadius: "2px"
          }}
        ></div>
      </div>
    </div>
  );
};

const FeatureBreakdown = ({ breakdown }) => {
  if (!breakdown || Object.keys(breakdown).length === 0) return null;
  return (
    <div className="feature-breakdown" style={{ marginTop: "1rem", background: "#f8fafc", padding: "0.75rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
      <span style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", textTransform: "uppercase", color: "#64748b", marginBottom: "0.5rem" }}>Score Breakdown</span>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.9rem", color: "#334155" }}>
        {Object.entries(breakdown).map(([key, val]) => (
          <li key={key} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #cbd5e1", paddingBottom: "0.25rem", marginBottom: "0.25rem" }}>
            <span>{key}:</span>
            <span style={{ fontWeight: "bold", color: val >= 0 ? (val > 20 ? "#dc2626" : "#475569") : "#16a34a" }}>
              {val > 0 ? `+${val}` : val}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

function AgentResults({ result }) {
  const isGovernance = result.mode === "governance";

  return (
    <section className="agents-section">
      <div className="section-header">
        <h2>{isGovernance ? "🛡️ Governance Pipeline Visualizer" : "🤖 Problem Solving Agent Analysis"}</h2>
        <p>Transparent, Multi-Agent Reasoning Tracking</p>
      </div>

      <div className="agents-grid">
        {isGovernance ? (
          <>
            {/* Analysis Agent */}
            <div className="agent-card animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <div className="agent-icon animate-scale-in" style={{ animationDelay: "0.2s" }}>📊</div>
              <h3 className="agent-title">{result.analysis_output?.agent || "AnalysisAgent"}</h3>
              <ConfidenceBar confidence={result.analysis_output?.confidence} />
              <div className="agent-details">
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value">{result.analysis_output?.decision ?? "N/A"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Reasoning:</span>
                  <span className="detail-text">{result.analysis_output?.reason ?? "N/A"}</span>
                </div>
              </div>
              <FeatureBreakdown breakdown={result.analysis_output?.feature_breakdown} />
            </div>

            {/* Risk Agent */}
            <div className="agent-card animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="agent-icon animate-scale-in" style={{ animationDelay: "0.3s" }}>⚡</div>
              <h3 className="agent-title">{result.risk_output?.agent || "RiskAgent"}</h3>
              <RiskMeter score={result.risk_output?.score} />
              <ConfidenceBar confidence={result.risk_output?.confidence} />
              
              <div className="agent-details">
                <div className="detail-row">
                  <span className="detail-label">Risk Level:</span>
                  <span className="detail-value risk-badge" data-risk={result.risk_output?.decision}>
                    {result.risk_output?.decision ?? "N/A"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Reasoning:</span>
                  <span className="detail-text">{result.risk_output?.reason ?? "N/A"}</span>
                </div>
              </div>
              <FeatureBreakdown breakdown={result.risk_output?.feature_breakdown} />
            </div>

            {/* Adversarial Agent */}
            {result.adversarial_output && (
              <div className="agent-card adversarial-card animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                <div className="agent-icon animate-scale-in" style={{ animationDelay: "0.4s" }}>😈</div>
                <h3 className="agent-title">{result.adversarial_output?.agent || "AdversarialAgent"}</h3>
                <RiskMeter score={result.adversarial_output?.score} />
                <ConfidenceBar confidence={result.adversarial_output?.confidence} />
                
                <div className="agent-details">
                  <div className="detail-row" style={{display: "block", marginBottom: "0.5rem"}}>
                    <span className="detail-label" style={{color: "#991b1b"}}>Critique:</span>
                    <span className="detail-text" style={{ fontStyle: "italic", color: "#7f1d1d", display: "block", marginTop: "0.2rem" }}>
                      "{result.adversarial_output?.critique ?? "N/A"}"
                    </span>
                  </div>
                  
                  {result.adversarial_output?.attack_scenarios?.length > 0 && (
                    <div className="detail-row" style={{display: "block", marginTop: "1rem"}}>
                      <span className="detail-label" style={{color: "#991b1b"}}>Generated Attack Vectors:</span>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
                        {result.adversarial_output.attack_scenarios.map((acc, i) => (
                          <div key={i} style={{ background: "#fef2f2", borderLeft: `4px solid ${acc.severity === 'High' || acc.severity === 'Critical' ? '#dc2626' : '#f59e0b'}`, padding: "0.5rem" }}>
                            <strong style={{fontSize: "0.85rem", color: "#991b1b"}}>{acc.attack_type} [{acc.severity}]</strong>
                            <p style={{fontSize: "0.8rem", margin: "0.25rem 0", color: "#7f1d1d"}}>{acc.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <FeatureBreakdown breakdown={result.adversarial_output?.feature_breakdown} />
              </div>
            )}

            {/* Governance Agent */}
            <div className="agent-card animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <div className="agent-icon animate-scale-in" style={{ animationDelay: "0.5s" }}>🛡️</div>
              <h3 className="agent-title">{result.governance_output?.agent || "GovernanceAgent"}</h3>
              <ConfidenceBar confidence={result.governance_output?.confidence} />
              
              <div className="agent-details">
                <div className="detail-row">
                  <span className="detail-label">Final Action:</span>
                  <span className="detail-value" style={{fontSize: "1.5rem", fontWeight: "900", color: DECISION_META[result.governance_output?.decision]?.color || "#111827"}}>
                    {result.governance_output?.decision ?? "N/A"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Policy Logic:</span>
                  <span className="detail-text" style={{ fontStyle: "italic", borderLeft: "2px solid #cbd5e1", paddingLeft: "8px" }}>
                    {result.governance_output?.reason ?? "N/A"}
                  </span>
                </div>
              </div>
              <FeatureBreakdown breakdown={result.governance_output?.feature_breakdown} />
            </div>

            {/* Explanation Agent */}
            {(result.explanation_output || result.inferred_parameters) && (
              <div className="agent-card explanation-card animate-fade-in-up" style={{ animationDelay: "0.5s", gridColumn: "1 / -1" }}>
                <div className="agent-icon animate-scale-in" style={{ animationDelay: "0.6s" }}>🧠</div>
                <h3 className="agent-title">{result.explanation_output?.agent || "ExplanationAgent (Deep Dive)"}</h3>
                <ConfidenceBar confidence={result.explanation_output?.confidence} />
                
                <div className="agent-details" style={{gap: "1.5rem", marginTop: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "start"}}>
                  
                  <div className="detail-row" style={{display:"block", gridColumn: "1 / -1", textAlign: "center", marginBottom: "1rem"}}>
                    <h4 style={{ color: "#4c1d95", margin: 0 }}>Executive Summary</h4>
                    <p style={{fontSize: "1.1rem", fontStyle: "italic", color: "#334155"}}>"{result.explanation_output?.summary ?? "N/A"}"</p>
                  </div>

                  <div className="detail-row" style={{display:"block"}}>
                    <span className="detail-label" style={{display:"block", marginBottom:"0.5rem", fontSize:"1.1rem", fontWeight:"800", color:"#4c1d95"}}>Detailed Reasoning</span>
                    <p style={{margin:0, lineHeight:"1.6", color:"#334155", fontSize:"1.05rem"}}>
                      {result.explanation_output?.detailed_reasoning ?? "N/A"}
                    </p>
                  </div>
                  
                  <div className="detail-row" style={{display:"block"}}>
                    <span className="detail-label" style={{display:"block", marginBottom:"0.5rem", fontSize:"1.1rem", fontWeight:"800", color:"#6d28d9"}}>Policy Decision Justification</span>
                    <p style={{margin:0, lineHeight:"1.6", color:"#4c1d95", fontSize:"1.05rem", background:"rgba(237, 233, 254, 0.8)", padding:"1.2rem", borderRadius:"12px", border:"1px solid #ddd6fe", borderLeft: "4px solid #8b5cf6"}}>
                      {result.explanation_output?.policy_justification ?? "N/A"}
                    </p>
                  </div>
                  
                  {result.explanation_output?.real_world_consequences && (
                    <div className="detail-row" style={{display:"block"}}>
                      <span className="detail-label" style={{display:"block", marginBottom:"0.5rem", fontSize:"1.1rem", fontWeight:"800", color:"#c2410c"}}>Real-World Consequences</span>
                      <p style={{margin:0, lineHeight:"1.6", color:"#9a3412", fontSize:"1.05rem", background:"rgba(255, 237, 213, 0.8)", padding:"1.2rem", borderRadius:"12px", border:"1px solid #fed7aa", borderLeft: "4px solid #f97316"}}>
                        {result.explanation_output.real_world_consequences}
                      </p>
                    </div>
                  )}

                  {result.explanation_output?.mitigation_strategies && (
                    <div className="detail-row" style={{display:"block"}}>
                      <span className="detail-label" style={{display:"block", marginBottom:"0.5rem", fontSize:"1.1rem", fontWeight:"800", color:"#15803d"}}>Mitigation Strategies</span>
                      <p style={{margin:0, lineHeight:"1.6", color:"#166534", fontSize:"1.05rem", background:"rgba(220, 252, 231, 0.8)", padding:"1.2rem", borderRadius:"12px", border:"1px solid #bbf7d0", borderLeft: "4px solid #22c55e"}}>
                        {result.explanation_output.mitigation_strategies}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="agent-card animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <div className="agent-icon animate-scale-in" style={{ animationDelay: "0.2s" }}>🧩</div>
              <h3 className="agent-title">{result.decomposer_output?.agent}</h3>
              <div className="agent-score">
                <span className="score-label">Complexity</span>
                <span className="score-value">{result.decomposer_output?.decision ?? "N/A"}</span>
              </div>
              <div className="agent-details">
                <div className="detail-row">
                  <span className="detail-label">Subtasks:</span>
                  <ul className="detail-list">
                    {result.decomposer_output?.subtasks?.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Reasoning:</span>
                  <span className="detail-text">{result.decomposer_output?.reason ?? "N/A"}</span>
                </div>
              </div>
            </div>

            <div className="agent-card animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="agent-icon animate-scale-in" style={{ animationDelay: "0.3s" }}>🔍</div>
              <h3 className="agent-title">{result.research_output?.agent}</h3>
              <div className="agent-score">
                <span className="score-label">Score</span>
                <span className="score-value">{result.research_output?.score?.toFixed(2) ?? "N/A"}</span>
              </div>
              <div className="agent-details">
                <div className="detail-row">
                  <span className="detail-label">Context:</span>
                  <span className="detail-text">{result.research_output?.context ?? "N/A"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Key Findings:</span>
                  <ul className="detail-list">
                    {result.research_output?.findings?.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              </div>
            </div>

            <div className="agent-card animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <div className="agent-icon animate-scale-in" style={{ animationDelay: "0.4s" }}>⚙️</div>
              <h3 className="agent-title">{result.execution_output?.agent}</h3>
              <div className="agent-score">
                <span className="score-label">Effort</span>
                <span className="score-value">{result.execution_output?.decision ?? "N/A"}</span>
              </div>
              <div className="agent-details">
                <div className="detail-row">
                  <span className="detail-label">Solution:</span>
                  <span className="detail-text">{result.execution_output?.solution ?? "N/A"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Steps:</span>
                  <ol className="detail-list">
                    {result.execution_output?.steps?.map((s, i) => <li key={i}>{s}</li>)}
                  </ol>
                </div>
              </div>
            </div>

            <div className="agent-card animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <div className="agent-icon animate-scale-in" style={{ animationDelay: "0.5s" }}>✅</div>
              <h3 className="agent-title">{result.validation_output?.agent}</h3>
              <div className="agent-score">
                <span className="score-label">Confidence</span>
                <span className="score-value">{result.validation_output?.score?.toFixed(2) ?? "N/A"}</span>
              </div>
              <div className="agent-details">
                <div className="detail-row">
                  <span className="detail-label">Verdict:</span>
                  <span className="detail-value">{result.validation_output?.decision ?? "N/A"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Complete:</span>
                  <span className="detail-value">{result.validation_output?.is_complete ? "✅ Yes" : "❌ No"}</span>
                </div>
                {result.validation_output?.gaps?.length > 0 && (
                  <div className="detail-row">
                    <span className="detail-label">Gaps:</span>
                    <ul className="detail-list">
                      {result.validation_output.gaps.map((g, i) => <li key={i}>{g}</li>)}
                    </ul>
                  </div>
                )}
                {result.validation_output?.suggestions?.length > 0 && (
                  <div className="detail-row">
                    <span className="detail-label">Suggestions:</span>
                    <ul className="detail-list">
                      {result.validation_output.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {!isGovernance && (() => {
        const verdict = result.final_decision;
        const meta = VERDICT_META[verdict] || { icon: "ℹ️", color: "#6b7280" };
        return (
          <div className="ps-verdict-banner animate-fade-in-up" style={{ borderColor: meta.color, animationDelay: "0.6s" }}>
            <span className="ps-verdict-icon animate-scale-in" style={{ animationDelay: "0.7s" }}>{meta.icon}</span>
            <span className="ps-verdict-label">Validation Verdict:</span>
            <span className="ps-verdict-value" style={{ color: meta.color }}>{verdict}</span>
            {result.validation_output?.reason && (
              <span className="ps-verdict-reason">{result.validation_output.reason}</span>
            )}
          </div>
        );
      })()}    </section>
  );
}

export default AgentResults;
