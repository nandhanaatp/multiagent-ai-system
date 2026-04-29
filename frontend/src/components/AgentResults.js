import React from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { 
  ShieldCheck, AlertTriangle, ShieldAlert, Zap, Search, Activity, Lock, 
  CheckCircle2, XCircle, BrainCircuit, Target, ListChecks, FileSearch,
  ChevronRight, Info
} from "lucide-react";

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
    <div className="mt-4 mb-2">
      <div className="flex justify-between items-center mb-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <span>Confidence</span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className="h-full rounded-full"
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

  // Needle calculation
  const RADIAN = Math.PI / 180;
  const cx = 100;
  const cy = 100;
  const r = 80;
  // Score goes from 0 to 100, mapping to 180 to 0 degrees
  const angle = 180 - (riskValue / 100) * 180;
  
  const needleX = cx + (r - 10) * Math.cos(angle * RADIAN);
  const needleY = cy - (r - 10) * Math.sin(angle * RADIAN);

  return (
    <div className="relative w-full h-28 flex flex-col items-center justify-end overflow-hidden mb-2">
      <div className="absolute top-0 w-[200px] h-[120px]">
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
        {/* Needle */}
        <svg className="absolute top-0 left-0 w-full h-full" style={{ pointerEvents: "none" }}>
          <circle cx={cx} cy={cy} r={6} fill="#f8fafc" />
          <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#f8fafc" strokeWidth={3} strokeLinecap="round" />
        </svg>
      </div>
      <div className="absolute bottom-0 text-center">
        <span className="text-2xl font-bold text-white">{riskValue.toFixed(1)}</span>
        <span className="text-xs block text-slate-400 font-medium uppercase tracking-widest mt-[-4px]">Risk Score</span>
      </div>
    </div>
  );
};

const FeatureBreakdown = ({ breakdown }) => {
  if (!breakdown || Object.keys(breakdown).length === 0) return null;
  return (
    <div className="mt-4 pt-4 border-t border-slate-700/50">
      <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Impact Factors</span>
      <ul className="space-y-1">
        {Object.entries(breakdown).map(([key, val]) => (
          <li key={key} className="flex justify-between items-center text-sm">
            <span className="text-slate-300">{key}</span>
            <span className={`font-mono font-semibold ${val >= 0 ? (val > 20 ? 'text-red-400' : 'text-slate-400') : 'text-emerald-400'}`}>
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
    <section className="mt-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          {isGovernance ? <ShieldCheck className="text-blue-500" /> : <BrainCircuit className="text-indigo-500" />}
          {isGovernance ? "Governance Pipeline Analysis" : "Problem Solving Execution"}
        </h2>
        <p className="text-slate-400 mt-1">Multi-Agent reasoning traces and outputs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {isGovernance ? (
          <>
            {/* Analysis Agent */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-xl backdrop-blur-sm relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Search size={20} /></div>
                <h3 className="font-bold text-slate-200">{result.analysis_output?.agent || "AnalysisAgent"}</h3>
              </div>
              <ConfidenceBar confidence={result.analysis_output?.confidence} />
              <div className="mt-4 space-y-2">
                <div className="text-sm"><span className="text-slate-400 uppercase text-xs font-bold tracking-wider block mb-1">Intent</span><span className="text-slate-200">{result.analysis_output?.decision ?? "N/A"}</span></div>
                <div className="text-sm"><span className="text-slate-400 uppercase text-xs font-bold tracking-wider block mb-1">Context</span><span className="text-slate-300 leading-relaxed">{result.analysis_output?.reason ?? "N/A"}</span></div>
              </div>
              <FeatureBreakdown breakdown={result.analysis_output?.feature_breakdown} />
            </motion.div>

            {/* Risk Agent */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-xl backdrop-blur-sm relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400"><Activity size={20} /></div>
                <h3 className="font-bold text-slate-200">{result.risk_output?.agent || "RiskAgent"}</h3>
              </div>
              
              <RiskGauge score={result.risk_output?.score} />
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Level</span>
                  <span className="px-2 py-1 rounded text-xs font-bold" style={{ backgroundColor: DECISION_META[result.risk_output?.decision]?.glow, color: "#fff" }}>
                    {result.risk_output?.decision ?? "N/A"}
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mt-2">{result.risk_output?.reason ?? "N/A"}</p>
              </div>
              <FeatureBreakdown breakdown={result.risk_output?.feature_breakdown} />
            </motion.div>

            {/* Adversarial Agent */}
            {result.adversarial_output && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-red-950/20 border border-red-900/30 rounded-2xl p-5 shadow-xl backdrop-blur-sm relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-500/10 rounded-lg text-red-400"><Lock size={20} /></div>
                  <h3 className="font-bold text-red-100">{result.adversarial_output?.agent || "AdversarialAgent"}</h3>
                </div>
                
                <RiskGauge score={result.adversarial_output?.score} />
                
                <div className="mt-4 space-y-3">
                  <div>
                    <span className="text-red-400/80 text-xs font-bold uppercase tracking-wider block mb-1">Critique</span>
                    <p className="text-sm text-red-200 italic border-l-2 border-red-800 pl-2">{result.adversarial_output?.critique ?? "N/A"}</p>
                  </div>
                  
                  {result.adversarial_output?.attack_scenarios?.length > 0 && (
                    <div className="space-y-2 mt-3">
                      <span className="text-red-400/80 text-xs font-bold uppercase tracking-wider block">Attack Vectors</span>
                      {result.adversarial_output.attack_scenarios.map((acc, i) => (
                        <div key={i} className="bg-red-950/50 border border-red-900/50 rounded p-2">
                          <span className="text-xs font-bold text-red-300 block">{acc.attack_type}</span>
                          <span className="text-[11px] text-red-200/70">{acc.description}</span>
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
              className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-xl backdrop-blur-sm relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: DECISION_META[result.governance_output?.decision]?.color || "#3b82f6" }} />
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-700/50 rounded-lg text-slate-300"><ShieldCheck size={20} /></div>
                <h3 className="font-bold text-slate-200">{result.governance_output?.agent || "GovernanceAgent"}</h3>
              </div>
              
              <div className="flex flex-col items-center justify-center my-6">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Final Action</span>
                <div 
                  className="text-3xl font-black tracking-widest px-6 py-2 rounded-xl"
                  style={{ 
                    color: DECISION_META[result.governance_output?.decision]?.color || "#fff",
                    textShadow: `0 0 20px ${DECISION_META[result.governance_output?.decision]?.glow || "transparent"}`,
                    border: `1px solid ${DECISION_META[result.governance_output?.decision]?.glow || "rgba(255,255,255,0.1)"}`,
                    background: "rgba(15, 23, 42, 0.5)"
                  }}
                >
                  {result.governance_output?.decision ?? "N/A"}
                </div>
              </div>

              <div className="mt-4">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Policy Applied</span>
                <p className="text-sm text-slate-300 leading-relaxed">{result.governance_output?.reason ?? "N/A"}</p>
              </div>
              <FeatureBreakdown breakdown={result.governance_output?.feature_breakdown} />
            </motion.div>

            {/* Explanation Agent */}
            {(result.explanation_output || result.inferred_parameters) && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="col-span-1 md:col-span-2 xl:col-span-4 bg-indigo-950/20 border border-indigo-900/30 rounded-2xl p-6 shadow-xl backdrop-blur-sm relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500" />
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><Zap size={24} /></div>
                  <h3 className="text-xl font-bold text-indigo-100">{result.explanation_output?.agent || "Reasoning Engine"}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-indigo-400 font-bold mb-2 flex items-center gap-2"><Target size={16}/> Executive Summary</h4>
                      <p className="text-slate-300 text-sm leading-relaxed italic bg-indigo-950/30 p-4 rounded-xl border border-indigo-900/50">
                        "{result.explanation_output?.summary ?? "N/A"}"
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-2">Detailed Reasoning</h4>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {result.explanation_output?.detailed_reasoning ?? "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-purple-950/30 border border-purple-900/50 p-4 rounded-xl border-l-4 border-l-purple-500">
                      <h4 className="text-purple-400 font-bold text-sm mb-2">Policy Justification</h4>
                      <p className="text-slate-300 text-sm">{result.explanation_output?.policy_justification ?? "N/A"}</p>
                    </div>
                    
                    {result.explanation_output?.real_world_consequences && (
                      <div className="bg-orange-950/30 border border-orange-900/50 p-4 rounded-xl border-l-4 border-l-orange-500">
                        <h4 className="text-orange-400 font-bold text-sm mb-2">Real-World Consequences</h4>
                        <p className="text-slate-300 text-sm">{result.explanation_output.real_world_consequences}</p>
                      </div>
                    )}

                    {result.explanation_output?.mitigation_strategies && (
                      <div className="bg-emerald-950/30 border border-emerald-900/50 p-4 rounded-xl border-l-4 border-l-emerald-500">
                        <h4 className="text-emerald-400 font-bold text-sm mb-2">Mitigation Strategies</h4>
                        <p className="text-slate-300 text-sm">{result.explanation_output.mitigation_strategies}</p>
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
                className="col-span-1 md:col-span-2 xl:col-span-4 bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(16,185,129,0.15)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2 mb-2">
                      <ShieldAlert size={20} /> Smart Recommendation
                    </h3>
                    <p className="text-emerald-100/70 text-sm mb-4">
                      The current prompt violates policies. Consider using this safer, compliant alternative:
                    </p>
                    <div className="bg-slate-900/50 border border-emerald-500/20 p-4 rounded-lg text-emerald-50 font-mono text-sm leading-relaxed">
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
                    className="shrink-0 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/50 transition-all active:scale-95 flex items-center gap-2"
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center gap-3 mb-4 text-blue-400"><ListChecks size={24}/> <h3 className="font-bold text-slate-200">{result.decomposer_output?.agent}</h3></div>
              <div className="bg-slate-900/50 p-3 rounded-lg mb-4 text-center border border-slate-700/50">
                <span className="text-xs text-slate-400 uppercase tracking-widest block mb-1">Complexity</span>
                <span className="text-xl font-bold text-blue-400">{result.decomposer_output?.decision ?? "N/A"}</span>
              </div>
              <div className="space-y-2 text-sm">
                <span className="text-slate-400 font-bold uppercase text-xs block">Subtasks</span>
                <ul className="list-disc pl-4 text-slate-300 space-y-1">
                  {result.decomposer_output?.subtasks?.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center gap-3 mb-4 text-amber-400"><FileSearch size={24}/> <h3 className="font-bold text-slate-200">{result.research_output?.agent}</h3></div>
              <div className="bg-slate-900/50 p-3 rounded-lg mb-4 text-center border border-slate-700/50">
                <span className="text-xs text-slate-400 uppercase tracking-widest block mb-1">Confidence</span>
                <span className="text-xl font-bold text-amber-400">{result.research_output?.score?.toFixed(2) ?? "N/A"}</span>
              </div>
              <div className="space-y-2 text-sm">
                <span className="text-slate-400 font-bold uppercase text-xs block">Key Findings</span>
                <ul className="list-disc pl-4 text-slate-300 space-y-1">
                  {result.research_output?.findings?.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center gap-3 mb-4 text-emerald-400"><Zap size={24}/> <h3 className="font-bold text-slate-200">{result.execution_output?.agent}</h3></div>
              <div className="bg-slate-900/50 p-3 rounded-lg mb-4 text-center border border-slate-700/50">
                <span className="text-xs text-slate-400 uppercase tracking-widest block mb-1">Effort</span>
                <span className="text-xl font-bold text-emerald-400">{result.execution_output?.decision ?? "N/A"}</span>
              </div>
              <div className="space-y-2 text-sm">
                <span className="text-slate-400 font-bold uppercase text-xs block">Generated Solution</span>
                <p className="text-slate-300 italic">{result.execution_output?.solution ?? "N/A"}</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center gap-3 mb-4 text-indigo-400"><CheckCircle2 size={24}/> <h3 className="font-bold text-slate-200">{result.validation_output?.agent}</h3></div>
              <div className="bg-slate-900/50 p-3 rounded-lg mb-4 text-center border border-slate-700/50">
                <span className="text-xs text-slate-400 uppercase tracking-widest block mb-1">Status</span>
                <span className="text-xl font-bold text-indigo-400">{result.validation_output?.decision ?? "N/A"}</span>
              </div>
              <div className="space-y-2 text-sm">
                <span className="text-slate-400 font-bold uppercase text-xs block">Complete</span>
                <span className="text-slate-300 block mb-2">{result.validation_output?.is_complete ? "✅ Yes" : "❌ No"}</span>
                {result.validation_output?.gaps?.length > 0 && (
                  <>
                    <span className="text-slate-400 font-bold uppercase text-xs block mt-2">Gaps Identified</span>
                    <ul className="list-disc pl-4 text-slate-300 space-y-1">
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
            className="mt-6 flex items-center gap-4 p-4 rounded-xl border"
            style={{ backgroundColor: meta.bg, borderColor: meta.color }}
          >
            <div style={{ color: meta.color }}>{meta.icon}</div>
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Final Validation Verdict</span>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black tracking-wider" style={{ color: meta.color }}>{verdict}</span>
                {result.validation_output?.reason && (
                  <span className="text-slate-300 text-sm">({result.validation_output.reason})</span>
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
