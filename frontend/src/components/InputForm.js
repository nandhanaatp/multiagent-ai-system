import React from "react";
import { AlertTriangle, Edit3, ShieldCheck, Zap } from "lucide-react";
import "./InputForm.css";

function InputForm({ 
  mode, setMode,
  problemDescription, setProblemDescription,
  isSimulation, setIsSimulation,
  altDescription, setAltDescription,
  error, setError,
  loading, handleAnalyze,
  isFormValid
}) {
  const isGovernance = mode === "governance";

  return (
    <section className="input-section">
      <div className="section-header">
        <h2><Edit3 size={28} color="var(--primary)" /> Problem Analysis Input</h2>
        <p>Describe the issue and configure risk parameters</p>
      </div>

      {/* Mode Toggle */}
      <div className="mode-toggle-container">
        <button
          className={`mode-btn ${isGovernance ? "mode-btn-active" : ""}`}
          onClick={() => setMode("governance")}
        >
          <ShieldCheck size={20} /> Governance Mode
        </button>
        <button
          className={`mode-btn ${!isGovernance ? "mode-btn-active" : ""}`}
          onClick={() => setMode("problem_solving")}
        >
          <Zap size={20} /> Problem Solving Mode
        </button>
      </div>

      {error && (
        <div className="auth-error" style={{ marginBottom: "1.5rem" }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="input-card">
        <label className="input-label">Problem Description</label>
        <textarea
          className="problem-input"
          placeholder="Describe the problem or scenario you want to analyze..."
          value={problemDescription}
          onChange={(e) => {
             setProblemDescription(e.target.value);
             setError(null);
          }}
          rows="4"
          maxLength="5000"
        />
        <div className="character-count">
          {problemDescription.length} / 5000 characters
        </div>
      </div>

      <div className="sim-toggle-card">
        <label className="sim-toggle-label">
          <input 
            type="checkbox" 
            checked={isSimulation || false} 
            onChange={(e) => setIsSimulation(e.target.checked)}
          />
          🧪 Enable What-If Simulation (Compare Prompts)
        </label>
        
        {isSimulation && (
          <div className="input-card" style={{ marginTop: "1.5rem", marginBottom: 0 }}>
            <label className="input-label" style={{ color: "var(--primary)" }}>Alternative / Modified Scenario</label>
            <textarea
              className="problem-input"
              placeholder="Slightly modify the first prompt to test how the governance system reacts (e.g., remove the word 'leak')..."
              value={altDescription || ""}
              onChange={(e) => {
                 setAltDescription(e.target.value);
                 setError(null);
              }}
              rows="4"
              maxLength="5000"
              style={{ border: "1px solid rgba(59, 130, 246, 0.4)", backgroundColor: "rgba(15, 23, 42, 0.4)" }}
            />
          </div>
        )}
      </div>

      <button 
        className="analyze-button" 
        onClick={handleAnalyze}
        disabled={loading || !isFormValid}
      >
        {isGovernance ? <ShieldCheck size={24} /> : <Zap size={24} />} 
        {loading ? "Analyzing..." : isGovernance ? "Analyze with Governance Agents" : "Solve with AI Agents"}
      </button>
    </section>
  );
}

export default InputForm;
