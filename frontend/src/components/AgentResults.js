import React from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { 
  ShieldCheck, AlertTriangle, ShieldAlert, Zap, Search, Activity, Lock, 
  CheckCircle2, XCircle, BrainCircuit, Target, ListChecks, FileSearch,
  ChevronRight, Info
} from "lucide-react";
import "./AgentResults.css";

const VERDICT_META = {
  APPROVED:          { icon: <CheckCircle2 size={24} />, color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
  NEEDS_IMPROVEMENT: { icon: <AlertTriangle size={24} />, color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" },
  REJECTED:          { icon: <XCircle size={24} />, color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)" },
};

const DECISION_META = {
  ALLOW:  { color: "#10b981", glow: "rgba(16, 185, 129, 0.4)" },
  WARN:   { color: "#f59e0b", glow: "rgba(245, 158, 11, 0.4)" },
  REVIEW: { color: "#ea580c", glow: "rgba(234, 88, 12, 0.4)" },
  BLOCK:  { color: "#ef4444", glow: "rgba(239, 68, 68, 0.4)" },
};

const ConfidenceBar = ({ confidence }) => {
  const percentage = confidence ? Math.round(confidence * 100) : 0;
  return (
    <div className="confidence-bar-container">
      <div className="confidence-header">
        <span>Confidence</span>
        <span>{percentage}%</span>
      </div>
      <div className="confidence-track">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className="confidence-fill"
          style={{ background: percentage >= 80 ? "#10b981" : percentage >= 50 ? "#f59e0b" : "#ef4444" }}
        />
      </div>
    </div>
  );
};

const RiskGauge = ({ score }) => {
  const riskValue = isNaN(score) ? 0 : Math.min(100, Math.max(0, score));
  const data = [
    { name: "Safe", value: 40, color: "#10b981" },
    { name: "Warning", value: 30, color: "#f59e0b" },
    { name: "Danger", value: 30, color: "#ef4444" }
  ];

  const RADIAN = Math.PI / 180;
  const cx = 100;
  const cy = 100;
  const r = 80;
  const angle = 180 - (riskValue / 100) * 180;
  
  const needleX = cx + (r - 10) * Math.cos(angle * RADIAN);
  const needleY = cy - (r - 10) * Math.sin(angle * RADIAN);

  return (
    <div className="risk-gauge-container">
      <div className="risk-gauge-chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx={100}
              cy={100}
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <svg className="risk-gauge-needle">
          <circle cx={cx} cy={cy} r={6} fill="#f8fafc" />
          <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#f8fafc" strokeWidth={3} strokeLinecap="round" />
        </svg>
      </div>
      <div className="risk-gauge-label">
        <span className="risk-gauge-score">{riskValue.toFixed(1)}</span>
        <span className="risk-gauge-text">Risk Score</span>
      </div>
    </div>
  );
};

const FeatureBreakdown = ({ breakdown }) => {
  if (!breakdown || Object.keys(breakdown).length === 0) return null;
  return (
    <div className="feature-breakdown">
      <span className="feature-breakdown-title">Impact Factors</span>
      <ul className="feature-list">
        {Object.entries(breakdown).map(([key, val]) => (
          <li key={key} className="feature-item">
            <span className="feature-name">{key}</span>
            <span className={`feature-value ${val >= 0 ? (val > 20 ? 'positive' : 'neutral') : 'negative'}`}>
              {val > 0 ? `+${val}` : val}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

function AgentResults({ result, isCompact }) {
  const isGovernance = result.mode === "governance";

  return (
    <section className="agent-results-section">
      <div className="agent-results-header">
        <h2 className={`agent-results-title ${isGovernance ? 'gov' : 'ps'}`}>
          {isGovernance ? <ShieldCheck /> : <BrainCircuit />}
          {isGovernance ? "Governance Pipeline Analysis" : "Problem Solving Execution"}
        </h2>
        <p className="agent-results-subtitle">Multi-Agent reasoning traces and outputs</p>
      </div>

      <div className={`agent-grid ${isCompact ? 'compact' : ''}`}>
        {isGovernance ? (
          <>
            {/* Analysis Agent */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="agent-card"
            >
              <div className="agent-card-accent blue" />
              <div className="agent-card-header">
                <div className="agent-icon-wrapper blue"><Search size={20} /></div>
                <h3 className="agent-name">{result.analysis_output?.agent || "AnalysisAgent"}</h3>
              </div>
              <ConfidenceBar confidence={result.analysis_output?.confidence} />
              <div className="agent-details-list">
                <div className="detail-row">
                  <span className="detail-label">Intent</span>
                  <span className="detail-value">{result.analysis_output?.decision ?? "N/A"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Context</span>
                  <span className="detail-value dim">{result.analysis_output?.reason ?? "N/A"}</span>
                </div>
              </div>
              <FeatureBreakdown breakdown={result.analysis_output?.feature_breakdown} />
            </motion.div>

            {/* Risk Agent */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="agent-card"
            >
              <div className="agent-card-accent amber" />
              <div className="agent-card-header">
                <div className="agent-icon-wrapper amber"><Activity size={20} /></div>
                <h3 className="agent-name">{result.risk_output?.agent || "RiskAgent"}</h3>
              </div>
              
              <RiskGauge score={result.risk_output?.score} />
              
              <div className="agent-details-list">
                <div className="decision-row">
                  <span className="detail-label" style={{margin:0}}>Level</span>
                  <span className="decision-badge" style={{ backgroundColor: DECISION_META[result.risk_output?.decision]?.glow }}>
                    {result.risk_output?.decision ?? "N/A"}
                  </span>
                </div>
                <p className="detail-value dim" style={{marginTop:'0.5rem'}}>{result.risk_output?.reason ?? "N/A"}</p>
              </div>
              <FeatureBreakdown breakdown={result.risk_output?.feature_breakdown} />
            </motion.div>

            {/* Adversarial Agent */}
            {result.adversarial_output && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="agent-card"
                style={{ backgroundColor: 'rgba(69, 10, 10, 0.2)', borderColor: 'rgba(127, 29, 29, 0.3)' }}
              >
                <div className="agent-card-accent red" />
                <div className="agent-card-header">
                  <div className="agent-icon-wrapper red"><Lock size={20} /></div>
                  <h3 className="agent-name red-text">{result.adversarial_output?.agent || "AdversarialAgent"}</h3>
                </div>
                
                <RiskGauge score={result.adversarial_output?.score} />
                
                <div className="agent-details-list">
                  <div>
                    <span className="detail-label" style={{color: 'rgba(248, 113, 113, 0.8)'}}>Critique</span>
                    <p className="adversarial-critique">{result.adversarial_output?.critique ?? "N/A"}</p>
                  </div>
                  
                  {result.adversarial_output?.attack_scenarios?.length > 0 && (
                    <div className="attack-vector-list">
                      <span className="detail-label" style={{color: 'rgba(248, 113, 113, 0.8)'}}>Attack Vectors</span>
                      {result.adversarial_output.attack_scenarios.map((acc, i) => (
                        <div key={i} className="attack-vector-item">
                          <span className="attack-vector-type">{acc.attack_type}</span>
                          <span className="attack-vector-desc">{acc.description}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Governance Agent */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="agent-card"
            >
              <div className="agent-card-accent" style={{ backgroundColor: DECISION_META[result.governance_output?.decision]?.color || "#3b82f6" }} />
              <div className="agent-card-header">
                <div className="agent-icon-wrapper" style={{backgroundColor: 'rgba(51, 65, 85, 0.5)', color: '#cbd5e1'}}><ShieldCheck size={20} /></div>
                <h3 className="agent-name">{result.governance_output?.agent || "GovernanceAgent"}</h3>
              </div>
              
              <div className="final-action-container">
                <span className="final-action-label">Final Action</span>
                <div 
                  className="final-action-badge"
                  style={{ 
                    color: DECISION_META[result.governance_output?.decision]?.color || "#fff",
                    textShadow: `0 0 20px ${DECISION_META[result.governance_output?.decision]?.glow || "transparent"}`,
                    borderColor: DECISION_META[result.governance_output?.decision]?.glow || "rgba(255,255,255,0.1)"
                  }}
                >
                  {result.governance_output?.decision ?? "N/A"}
                </div>
              </div>

              <div className="agent-details-list">
                <span className="detail-label">Policy Applied</span>
                <p className="detail-value dim">{result.governance_output?.reason ?? "N/A"}</p>
              </div>
              <FeatureBreakdown breakdown={result.governance_output?.feature_breakdown} />
            </motion.div>

            {/* Explanation Agent */}
            {(result.explanation_output || result.inferred_parameters) && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="agent-card full-width"
                style={{ backgroundColor: 'rgba(49, 46, 129, 0.2)', borderColor: 'rgba(67, 56, 202, 0.3)' }}
              >
                <div className="agent-card-accent indigo" />
                <div className="agent-card-header" style={{ marginBottom: '1.5rem' }}>
                  <div className="agent-icon-wrapper indigo" style={{ padding: '0.75rem' }}><Zap size={24} /></div>
                  <h3 className="agent-name" style={{ fontSize: '1.25rem', color: '#e0e7ff' }}>{result.explanation_output?.agent || "Reasoning Engine"}</h3>
                </div>
                
                <div className="explanation-grid">
                  <div className="explanation-col">
                    <div className="explanation-section summary">
                      <h4><Target size={16}/> Executive Summary</h4>
                      <p>"{result.explanation_output?.summary ?? "N/A"}"</p>
                    </div>
                    
                    <div className="explanation-section reasoning">
                      <h4>Detailed Reasoning</h4>
                      <p>{result.explanation_output?.detailed_reasoning ?? "N/A"}</p>
                    </div>
                  </div>

                  <div className="explanation-col">
                    <div className="explanation-box purple">
                      <h4>Policy Justification</h4>
                      <p>{result.explanation_output?.policy_justification ?? "N/A"}</p>
                    </div>
                    
                    {result.explanation_output?.real_world_consequences && (
                      <div className="explanation-box orange">
                        <h4>Real-World Consequences</h4>
                        <p>{result.explanation_output.real_world_consequences}</p>
                      </div>
                    )}

                    {result.explanation_output?.mitigation_strategies && (
                      <div className="explanation-box emerald">
                        <h4>Mitigation Strategies</h4>
                        <p>{result.explanation_output.mitigation_strategies}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Smart Prompt Recommendation Phase 5 */}
            {result.suggested_prompt && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}
                className="smart-recommendation-card"
              >
                <div className="recommendation-content">
                  <div className="recommendation-text-area">
                    <h3 className="recommendation-title">
                      <ShieldAlert size={20} /> Smart Recommendation
                    </h3>
                    <p className="recommendation-desc">
                      The current prompt violates policies. Consider using this safer, compliant alternative:
                    </p>
                    <div className="recommendation-prompt-box">
                      {result.suggested_prompt}
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                       const inputEl = document.getElementById('problem-input');
                       if (inputEl) {
                         const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
                         setter.call(inputEl, result.suggested_prompt);
                         inputEl.dispatchEvent(new Event('input', { bubbles: true }));
                       }
                    }}
                    className="recommendation-btn"
                  >
                    Try this instead <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          /* Problem Solving Mode UI Upgrade */
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="ps-agent-card">
              <div className="ps-agent-header blue"><ListChecks size={24}/> <h3>{result.decomposer_output?.agent}</h3></div>
              <div className="ps-highlight-box">
                <span className="ps-highlight-label">Complexity</span>
                <span className="ps-highlight-value blue">{result.decomposer_output?.decision ?? "N/A"}</span>
              </div>
              <div className="ps-details">
                <span className="ps-details-label">Subtasks</span>
                <ul>
                  {result.decomposer_output?.subtasks?.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="ps-agent-card">
              <div className="ps-agent-header amber"><FileSearch size={24}/> <h3>{result.research_output?.agent}</h3></div>
              <div className="ps-highlight-box">
                <span className="ps-highlight-label">Confidence</span>
                <span className="ps-highlight-value amber">{result.research_output?.score?.toFixed(2) ?? "N/A"}</span>
              </div>
              <div className="ps-details">
                <span className="ps-details-label">Key Findings</span>
                <ul>
                  {result.research_output?.findings?.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="ps-agent-card">
              <div className="ps-agent-header emerald"><Zap size={24}/> <h3>{result.execution_output?.agent}</h3></div>
              <div className="ps-highlight-box">
                <span className="ps-highlight-label">Effort</span>
                <span className="ps-highlight-value emerald">{result.execution_output?.decision ?? "N/A"}</span>
              </div>
              <div className="ps-details">
                <span className="ps-details-label">Generated Solution</span>
                <p>{result.execution_output?.solution ?? "N/A"}</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="ps-agent-card">
              <div className="ps-agent-header indigo"><CheckCircle2 size={24}/> <h3>{result.validation_output?.agent}</h3></div>
              <div className="ps-highlight-box">
                <span className="ps-highlight-label">Status</span>
                <span className="ps-highlight-value indigo">{result.validation_output?.decision ?? "N/A"}</span>
              </div>
              <div className="ps-details">
                <span className="ps-details-label">Complete</span>
                <span style={{color: '#cbd5e1', display:'block', marginBottom:'0.5rem'}}>{result.validation_output?.is_complete ? "✅ Yes" : "❌ No"}</span>
                {result.validation_output?.gaps?.length > 0 && (
                  <>
                    <span className="ps-details-label" style={{marginTop:'0.5rem'}}>Gaps Identified</span>
                    <ul>
                      {result.validation_output.gaps.map((g, i) => <li key={i}>{g}</li>)}
                    </ul>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </div>

      {!isGovernance && (() => {
        const verdict = result.final_decision;
        const meta = VERDICT_META[verdict] || { icon: <Info size={24}/>, color: "#94a3b8", bg: "rgba(148, 163, 184, 0.1)" };
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="final-verdict-banner"
            style={{ backgroundColor: meta.bg, borderColor: meta.color }}
          >
            <div style={{ color: meta.color }}>{meta.icon}</div>
            <div className="verdict-info">
              <span className="verdict-label">Final Validation Verdict</span>
              <div className="verdict-value-container">
                <span className="verdict-value" style={{ color: meta.color }}>{verdict}</span>
                {result.validation_output?.reason && (
                  <span className="verdict-reason">({result.validation_output.reason})</span>
                )}
              </div>
            </div>
          </motion.div>
        );
      })()}
    </section>
  );
}

export default AgentResults;
