import React, { useState } from "react";
import html2pdf from "html2pdf.js";

const VERDICT_META = {
  APPROVED:          { icon: "✅", color: "#16a34a", css: "ALLOW",  desc: "The solution has been validated and approved." },
  NEEDS_IMPROVEMENT: { icon: "⚠️", color: "#f59e0b", css: "REVIEW", desc: "The solution needs improvement before proceeding." },
  REJECTED:          { icon: "🚫", color: "#dc2626", css: "BLOCK",  desc: "The solution was rejected. Please revise and resubmit." },
};

const DECISION_META = {
  BLOCK:  { icon: "🚫", color: "#dc2626", desc: "This action has been blocked due to high risk assessment." },
  REVIEW: { icon: "⚠️", color: "#f59e0b", desc: "This action requires human review before proceeding." },
  ALLOW:  { icon: "✅", color: "#16a34a", desc: "This action is approved and can proceed safely." },
};

function ReportViewer({ result, problemDescription, impact, likelihood, urgency, confidence }) {
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const isGovernance = result.mode === "governance";

  const finalDecision = result.final_decision;
  const meta = isGovernance
    ? (DECISION_META[finalDecision] || { icon: "ℹ️", color: "#6b7280", desc: "" })
    : (VERDICT_META[finalDecision]  || { icon: "ℹ️", color: "#6b7280", css: "ALLOW", desc: "" });

  const cssSuffix = isGovernance ? finalDecision : (meta.css || "ALLOW");

  const displayImpact = result.inferred_parameters?.impact ?? impact;
  const displayLikelihood = result.inferred_parameters?.likelihood ?? likelihood;
  const displayUrgency = result.inferred_parameters?.urgency ?? urgency;
  const displayConfidence = result.inferred_parameters?.confidence ?? confidence;
  const appliedPolicies = result.governance_output?.applied_policies;

  const handleCopy = () => {
    const lines = isGovernance
      ? [
          "GOVERNANCE DECISION REPORT",
          `Problem: ${problemDescription}`,
          `Analysis Score: ${result.analysis_output?.score}`,
          `Risk Level: ${result.risk_output?.decision}`,
          `Risk Score: ${result.risk_output?.score}`,
          `Final Decision: ${finalDecision}`,
          `Reasoning: ${result.governance_output?.reason}`,
        ]
      : [
          "PROBLEM SOLVING REPORT",
          `Problem: ${problemDescription}`,
          `Complexity: ${result.decomposer_output?.decision}`,
          `Subtasks: ${result.decomposer_output?.subtasks?.join(", ")}`,
          `Solution: ${result.execution_output?.solution}`,
          `Verdict: ${finalDecision}`,
          `Validation: ${result.validation_output?.reason}`,
        ];
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    const element = document.getElementById("report-printable-area");
    const opt = {
      margin:       [10, 10, 10, 10],
      filename:     `ai_report_${new Date().getTime()}.pdf`,
      image:        { type: "jpeg", quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: "mm", format: "a4", orientation: "portrait" }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      setIsGeneratingPdf(false);
    }).catch((err) => {
      console.error("PDF generation failed:", err);
      setIsGeneratingPdf(false);
    });
  };

  return (
    <>
      {/* Final Decision Banner */}
      <section className="decision-section">
        <div className="decision-card animate-fade-in-up" style={{ borderColor: meta.color, animationDelay: "0.1s" }}>
          <div className="decision-header">
            <h2>{isGovernance ? "Final System Decision" : "Validation Verdict"}</h2>
          </div>
          <div className="decision-result" style={{ color: meta.color }}>
            <span className="decision-icon animate-scale-in" style={{ animationDelay: "0.4s" }}>{meta.icon}</span>
            <span className="decision-text">{finalDecision}</span>
          </div>
          <div className="decision-description">{meta.desc}</div>
        </div>
      </section>

      {/* Report */}
      <section className="explanation-section">
        <div className="section-header">
          <h2>📋 {isGovernance ? "Detailed Decision Report" : "Problem Solving Report"}</h2>
          <p>Complete reasoning trace and explainability</p>
        </div>
        <div className="report-actions">
          <button className="copy-button" onClick={handleDownloadPdf} disabled={isGeneratingPdf} style={{ marginRight: '8px' }}>
            {isGeneratingPdf ? "⏳ Generating..." : "📥 Download PDF Report"}
          </button>
          <button className="copy-button" onClick={handleCopy}>
            {copied ? "✅ Copied!" : "📋 Copy Report"}
          </button>
        </div>

        <div className="report-card" id="report-printable-area">
          <div className="report-header">
            <span className="report-badge">
              {isGovernance ? "AI GOVERNANCE SYSTEM" : "AI PROBLEM SOLVER"}
            </span>
            <span className="report-title">
              {isGovernance ? "Decision Report" : "Solution Report"}
            </span>
          </div>

          <div className="report-problem animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="report-problem-label">📌 Problem Submitted</div>
            <div className="report-problem-text">{problemDescription}</div>
          </div>

          <div className="report-steps">
            {isGovernance ? (
              <>
                {/* Governance Step 1 */}
                <div className="report-step animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                  <div className="report-step-header step-analysis">
                    <span className="step-number">STEP 1</span>
                    <span className="step-name">📊 Analysis Agent</span>
                  </div>
                  <div className="report-step-body">
                    <div className="report-params-grid">
                      <div className="report-param"><span>Impact</span><strong>{displayImpact}/10</strong></div>
                      <div className="report-param"><span>Likelihood</span><strong>{displayLikelihood}/10</strong></div>
                      <div className="report-param"><span>Urgency</span><strong>{displayUrgency}/10</strong></div>
                      <div className="report-param"><span>Confidence</span><strong>{displayConfidence}/10</strong></div>
                    </div>
                    <div className="report-conclusion">
                      <span className="report-label">Conclusion:</span>
                      <span>{result.analysis_output?.reason}</span>
                    </div>
                    <div className="report-score-row">
                      <span className="report-label">Analysis Score:</span>
                      <span className="report-score-badge">{result.analysis_output?.score?.toFixed(2)}/10</span>
                    </div>
                  </div>
                </div>

                {/* Governance Step 2 */}
                <div className="report-step animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                  <div className="report-step-header step-risk">
                    <span className="step-number">STEP 2</span>
                    <span className="step-name">⚡ Risk Agent</span>
                  </div>
                  <div className="report-step-body">
                    <div className="report-formula">
                      <div className="formula-title">Risk Formula</div>
                      <div className="formula-text">Risk Score = (Impact × Likelihood) + Urgency − Confidence</div>
                      <div className="formula-calc">= ({displayImpact} × {displayLikelihood}) + {displayUrgency} − {displayConfidence} + keyword boost</div>
                      <div className="formula-result">= {result.risk_output?.score}</div>
                    </div>
                    <div className="report-conclusion">
                      <span className="report-label">Reasoning:</span>
                      <span>{result.risk_output?.reason}</span>
                    </div>
                    <div className="report-score-row">
                      <span className="report-label">Risk Level:</span>
                      <span className={`report-risk-badge risk-${result.risk_output?.decision}`}>
                        {result.risk_output?.decision}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Governance Step 3 */}
                <div className="report-step animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
                  <div className="report-step-header step-governance">
                    <span className="step-number">STEP 3</span>
                    <span className="step-name">🛡️ Governance Agent</span>
                  </div>
                  <div className="report-step-body">
                    <div className="report-policy-rules">
                      {["HIGH", "MEDIUM", "LOW"].map((level) => (
                        <div className="policy-rule" key={level}>
                          <span className={`policy-level ${level.toLowerCase()}`}>{level}</span>
                          <span className="policy-arrow">→</span>
                          <span className="policy-action">
                            {appliedPolicies?.[level]?.decision || (level === "HIGH" ? "BLOCK" : level === "MEDIUM" ? "REVIEW" : "ALLOW")}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="report-conclusion">
                      <span className="report-label">Policy Applied:</span>
                      <span>{result.governance_output?.reason}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Problem Solving Step 1 */}
                <div className="report-step animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                  <div className="report-step-header step-analysis">
                    <span className="step-number">STEP 1</span>
                    <span className="step-name">🧩 Task Decomposer</span>
                  </div>
                  <div className="report-step-body">
                    <div className="report-conclusion">
                      <span className="report-label">Complexity:</span>
                      <span>{result.decomposer_output?.decision}</span>
                    </div>
                    <div className="report-conclusion">
                      <span className="report-label">Subtasks:</span>
                      <ul className="detail-list">
                        {result.decomposer_output?.subtasks?.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    <div className="report-conclusion">
                      <span className="report-label">Reasoning:</span>
                      <span>{result.decomposer_output?.reason}</span>
                    </div>
                  </div>
                </div>

                {/* Problem Solving Step 2 */}
                <div className="report-step animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                  <div className="report-step-header step-risk">
                    <span className="step-number">STEP 2</span>
                    <span className="step-name">🔍 Research Agent</span>
                  </div>
                  <div className="report-step-body">
                    <div className="report-conclusion">
                      <span className="report-label">Context:</span>
                      <span>{result.research_output?.context}</span>
                    </div>
                    <div className="report-conclusion">
                      <span className="report-label">Key Findings:</span>
                      <ul className="detail-list">
                        {result.research_output?.findings?.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Problem Solving Step 3 */}
                <div className="report-step animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
                  <div className="report-step-header step-governance">
                    <span className="step-number">STEP 3</span>
                    <span className="step-name">⚙️ Execution Agent</span>
                  </div>
                  <div className="report-step-body">
                    <div className="report-conclusion">
                      <span className="report-label">Solution:</span>
                      <span>{result.execution_output?.solution}</span>
                    </div>
                    <div className="report-conclusion">
                      <span className="report-label">Steps:</span>
                      <ol className="detail-list">
                        {result.execution_output?.steps?.map((s, i) => <li key={i}>{s}</li>)}
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Problem Solving Step 4 */}
                <div className="report-step animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
                  <div className="report-step-header" style={{ background: "linear-gradient(135deg, #ede9fe, #f5f3ff)" }}>
                    <span className="step-number">STEP 4</span>
                    <span className="step-name">✅ Validation Agent</span>
                  </div>
                  <div className="report-step-body">
                    <div className="report-conclusion">
                      <span className="report-label">Complete:</span>
                      <span>{result.validation_output?.is_complete ? "✅ Yes" : "❌ No"}</span>
                    </div>
                    <div className="report-conclusion">
                      <span className="report-label">Correct:</span>
                      <span>{result.validation_output?.is_correct ? "✅ Yes" : "❌ No"}</span>
                    </div>
                    {result.validation_output?.gaps?.length > 0 && (
                      <div className="report-conclusion">
                        <span className="report-label">Gaps:</span>
                        <ul className="detail-list">
                          {result.validation_output.gaps.map((g, i) => <li key={i}>{g}</li>)}
                        </ul>
                      </div>
                    )}
                    {result.validation_output?.suggestions?.length > 0 && (
                      <div className="report-conclusion">
                        <span className="report-label">Suggestions:</span>
                        <ul className="detail-list">
                          {result.validation_output.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                    )}
                    <div className="report-conclusion">
                      <span className="report-label">Reasoning:</span>
                      <span>{result.validation_output?.reason}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Final verdict bar */}
          <div className={`report-final decision-${cssSuffix} animate-fade-in-up`} style={{ animationDelay: "0.7s" }}>
            <div className="report-final-label">
              {isGovernance ? "FINAL DECISION" : "VALIDATION VERDICT"}
            </div>
            <div className="report-final-value">
              {meta.icon} {finalDecision}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default ReportViewer;
