import React, { useState, useEffect } from "react";
import { useAuth, getToken } from "./AuthContext";
import Login from "./Login";
import Register from "./Register";
import History from "./History";
import Dashboard from "./Dashboard";
import ErrorBoundary from "./components/ErrorBoundary";
import InputForm from "./components/InputForm";
import AgentResults from "./components/AgentResults";
import ReportViewer from "./components/ReportViewer";
import PipelineVisualizer from "./components/PipelineVisualizer";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import PolicyBuilder from "./PolicyBuilder";
import UserProfile from "./UserProfile";
import AdminDashboard from "./AdminDashboard";
import LandingPage from "./LandingPage";
import { Toaster } from "react-hot-toast";
import "./App.css";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

function App() {
  const { user, logout, isAuthenticated, loading: authLoading, sessionWarning } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const [problemDescription, setProblemDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showPolicyBuilder, setShowPolicyBuilder] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [mode, setMode] = useState("governance");

  const [isSimulation, setIsSimulation] = useState(false);
  const [altDescription, setAltDescription] = useState("");
  const [altResult, setAltResult] = useState(null);

  const handleModeChange = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setResult(null);
    setAltResult(null);
    setError(null);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("reset_token");
    if (token) {
      setResetToken(token);
    }
  }, []);

  if (authLoading) {
    return (
      <div className="app">
        <div className="loading-section">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (resetToken) {
      return <ResetPassword token={resetToken} onBackToLogin={() => setResetToken(null)} />;
    }
    if (showForgotPassword) {
      return <ForgotPassword onBackToLogin={() => { setShowForgotPassword(false); setShowLogin(true); }} />;
    }
    if (showRegister) {
      return <Register onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }} />;
    }
    if (showLogin) {
      return (
        <div style={{ position: "relative" }}>
          <button 
            onClick={() => setShowLogin(false)} 
            style={{ position: "absolute", top: "20px", left: "20px", zIndex: 100, padding: "8px 16px", background: "rgba(255,255,255,0.1)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
          >
            ← Back to Home
          </button>
          <Login 
            onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }} 
            onSwitchToForgot={() => { setShowLogin(false); setShowForgotPassword(true); }}
          />
        </div>
      );
    }
    return <LandingPage onLogin={() => setShowLogin(true)} onRegister={() => setShowRegister(true)} />;
  }

  const performAnalysis = async (text) => {
    const response = await fetch(`${API_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
      body: JSON.stringify({
        problem_description: text,
        mode,
        auto_detect: true,
        parameters: null,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        logout();
        throw new Error("Session expired. Please login again.");
      }
      const errorData = await response.json();
      throw new Error(errorData.detail || `Server error: ${response.status}`);
    }
    return await response.json();
  };

  const handleAnalyze = async () => {
    if (!problemDescription.trim()) {
      setError("Please enter a problem description");
      return;
    }
    if (problemDescription.trim().length < 10) {
      setError("Problem description must be at least 10 characters");
      return;
    }
    if (isSimulation && (!altDescription.trim() || altDescription.trim().length < 10)) {
      setError("Alternative scenario must be at least 10 characters");
      return;
    }

    setLoading(true);
    setResult(null);
    setAltResult(null);
    setError(null);

    try {
      if (isSimulation) {
        const [res1, res2] = await Promise.all([
          performAnalysis(problemDescription),
          performAnalysis(altDescription)
        ]);
        setResult(res1);
        setAltResult(res2);
      } else {
        const res = await performAnalysis(problemDescription);
        setResult(res);
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "Failed to connect to backend. Please ensure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = problemDescription.trim().length >= 10 && (!isSimulation || altDescription.trim().length >= 10);

  return (
    <ErrorBoundary>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#f8fafc' } }} />
      <div className="app">
        <header className="header">
          <div className="header-content">
            <div className="logo">🤖 AI Governance</div>
            <h1 className="title">Explainable Multi-Agent Risk Governance System</h1>
            <p className="subtitle">Powered by intelligent decision-making agents</p>
          </div>
          
          <div className="user-info">
            <div className="user-avatar">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.full_name || user?.username}</div>
              <div className="user-email">{user?.email}</div>
            </div>
            <button onClick={() => setShowProfile(true)} className="history-button" style={{ marginLeft: "auto" }}>👤 Profile</button>
            {user?.is_admin && (
              <button 
                onClick={() => setShowAdminDashboard(true)} 
                className="history-button" 
                style={{ background: "rgba(220, 38, 38, 0.9)", borderColor: "#ef4444" }}
              >
                🛡️ Admin
              </button>
            )}
            <button onClick={() => setShowDashboard(true)} className="history-button">📊 Dashboard</button>
            <button onClick={() => setShowHistory(true)} className="history-button">📜 History</button>
            <button onClick={() => setShowPolicyBuilder(true)} className="history-button">⚙️ Policy Builder</button>
          </div>
        </header>

        {showAdminDashboard && <AdminDashboard onClose={() => setShowAdminDashboard(false)} />}
        {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
        {showHistory && <History onClose={() => setShowHistory(false)} />}
        {showDashboard && <Dashboard onClose={() => setShowDashboard(false)} />}
        {showPolicyBuilder && <PolicyBuilder onClose={() => setShowPolicyBuilder(false)} />}

        <div className="dashboard">
          {sessionWarning && (
            <div className="session-warning">
              ⚠️ Your session is about to expire. Please save your work.
              <button onClick={logout} className="session-logout-btn">Logout</button>
            </div>
          )}

          <InputForm
            mode={mode}
            setMode={handleModeChange}
            problemDescription={problemDescription}
            setProblemDescription={setProblemDescription}
            isSimulation={isSimulation}
            setIsSimulation={setIsSimulation}
            altDescription={altDescription}
            setAltDescription={setAltDescription}
            error={error}
            setError={setError}
            loading={loading}
            handleAnalyze={handleAnalyze}
            isFormValid={isFormValid}
          />

          {loading && (
            <PipelineVisualizer mode={mode} />
          )}

          {result && !isSimulation && (
            <>
              <AgentResults result={result} />
              {result.mode === "governance" && (
                <ReportViewer
                  result={result}
                  problemDescription={problemDescription}
                />
              )}
            </>
          )}

          {result && altResult && isSimulation && (
            <div className="simulation-insights" style={{ marginBottom: "2rem" }}>
              <div style={{ background: "white", padding: "1.5rem", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", border: "1px solid #e2e8f0" }}>
                <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: 0, color: "#1e293b", borderBottom: "2px solid #f1f5f9", paddingBottom: "0.75rem" }}>
                  ⚖️ Decision Comparison Insight
                </h2>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginTop: "1.5rem" }}>
                  {/* Decision Change */}
                  <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                    <span style={{ display: "block", fontSize: "0.85rem", textTransform: "uppercase", fontWeight: "bold", color: "#64748b", marginBottom: "0.5rem" }}>Decision Change</span>
                    <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#0f172a" }}>
                      <span style={{ color: result.governance_output?.decision === 'BLOCK' ? '#dc2626' : '#1e293b' }}>{result.governance_output?.decision}</span> 
                      {" ➔ "} 
                      <span style={{ color: altResult.governance_output?.decision === 'ALLOW' ? '#16a34a' : '#1e293b' }}>{altResult.governance_output?.decision}</span>
                    </div>
                  </div>

                  {/* Risk Change */}
                  {(() => {
                    const r1 = result.risk_output?.score || 0;
                    const r2 = altResult.risk_output?.score || 0;
                    const diff = r1 - r2;
                    const isImproved = diff > 0;
                    return (
                      <div style={{ background: isImproved ? "#f0fdf4" : (diff < 0 ? "#fef2f2" : "#f8fafc"), padding: "1rem", borderRadius: "8px", border: "1px solid", borderColor: isImproved ? "#bbf7d0" : (diff < 0 ? "#fecaca" : "#e2e8f0"), textAlign: "center" }}>
                        <span style={{ display: "block", fontSize: "0.85rem", textTransform: "uppercase", fontWeight: "bold", color: isImproved ? "#166534" : (diff < 0 ? "#991b1b" : "#64748b"), marginBottom: "0.5rem" }}>Risk Indicator</span>
                        <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#0f172a" }}>
                          {r1} ➔ {r2} 
                          <span style={{ color: isImproved ? '#16a34a' : (diff < 0 ? '#dc2626' : '#64748b'), marginLeft: "0.5rem", fontSize: "1rem" }}>
                            ({isImproved ? `↓${Math.abs(diff).toFixed(1)}` : (diff < 0 ? `↑${Math.abs(diff).toFixed(1)}` : 'No Change')})
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Confidence Change */}
                  {(() => {
                    const c1 = (result.governance_output?.confidence || 0) * 100;
                    const c2 = (altResult.governance_output?.confidence || 0) * 100;
                    const diff = c2 - c1;
                    const isImproved = diff > 0;
                    return (
                      <div style={{ background: isImproved ? "#f0fdf4" : (diff < 0 ? "#fef2f2" : "#f8fafc"), padding: "1rem", borderRadius: "8px", border: "1px solid", borderColor: isImproved ? "#bbf7d0" : (diff < 0 ? "#fecaca" : "#e2e8f0"), textAlign: "center" }}>
                        <span style={{ display: "block", fontSize: "0.85rem", textTransform: "uppercase", fontWeight: "bold", color: isImproved ? "#166534" : (diff < 0 ? "#991b1b" : "#64748b"), marginBottom: "0.5rem" }}>Confidence Change</span>
                        <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#0f172a" }}>
                          {c1.toFixed(0)}% ➔ {c2.toFixed(0)}% 
                          <span style={{ color: isImproved ? '#16a34a' : (diff < 0 ? '#dc2626' : '#64748b'), marginLeft: "0.5rem", fontSize: "1rem" }}>
                            ({isImproved ? `↑${Math.abs(diff).toFixed(0)}%` : (diff < 0 ? `↓${Math.abs(diff).toFixed(0)}%` : 'No Change')})
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {(() => {
                    const r1 = result.risk_output?.score || 0;
                    const r2 = altResult.risk_output?.score || 0;
                    const diff = r1 - r2;
                    if (diff > 0) {
                      return (
                        <div style={{ marginTop: "1.5rem", background: "#f0fdfa", padding: "1rem", borderRadius: "8px", borderLeft: "4px solid #0d9488" }}>
                          <h4 style={{ margin: "0 0 0.5rem 0", color: "#115e59", display: "flex", alignItems: "center", gap: "0.5rem" }}>💡 Why is it safer now?</h4>
                          <p style={{ margin: 0, fontSize: "0.95rem", color: "#0f766e", lineHeight: "1.5" }}>
                            The modified scenario significantly reduces the risk profile by removing highly sensitive terminology and narrowing ambiguity. This restricts potential adversarial exploitation, shifting the governance action into a safer threshold zone, making it strictly recommended for use.
                          </p>
                        </div>
                      );
                    } else if (diff < 0) {
                       return (
                        <div style={{ marginTop: "1.5rem", background: "#fef2f2", padding: "1rem", borderRadius: "8px", borderLeft: "4px solid #ef4444" }}>
                          <h4 style={{ margin: "0 0 0.5rem 0", color: "#991b1b", display: "flex", alignItems: "center", gap: "0.5rem" }}>⚠️ Why is it more dangerous now?</h4>
                          <p style={{ margin: 0, fontSize: "0.95rem", color: "#7f1d1d", lineHeight: "1.5" }}>
                            The modified scenario increases the risk profile by introducing sensitive keywords or widening ambiguity. The adversarial exploitability is higher, shifting the governance action into a more restricted threshold zone. The original prompt is safer and recommended.
                          </p>
                        </div>
                      );
                    }
                    return null;
                })()}
              </div>
            </div>
          )}

          {result && altResult && isSimulation && (
            <div className="simulation-results-container" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "1rem" }}>
              <div className="sim-column" style={{ background: "#f8fafc", padding: "1.5rem", borderRadius: "12px", border: "2px solid #cbd5e1" }}>
                <h2 style={{ textAlign: "center", color: "#334155", borderBottom: "2px solid #e2e8f0", paddingBottom: "1rem" }}>A: Original Scenario</h2>
                <div style={{ fontStyle: "italic", color: "#475569", marginBottom: "1.5rem", padding: "1rem", background: "#f1f5f9", borderRadius: "8px" }}>"{problemDescription}"</div>
                <AgentResults result={result} />
              </div>
              <div className="sim-column" style={{ background: "#f0fdf4", padding: "1.5rem", borderRadius: "12px", border: "2px solid #bbf7d0" }}>
                <h2 style={{ textAlign: "center", color: "#166534", borderBottom: "2px solid #dcfce7", paddingBottom: "1rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
                  B: Modified Scenario <span style={{fontSize: "0.9rem", padding: "0.2rem 0.6rem", background: "#22c55e", color: "white", borderRadius: "20px"}}>What-If</span>
                </h2>
                <div style={{ fontStyle: "italic", color: "#15803d", marginBottom: "1.5rem", padding: "1rem", background: "#dcfce7", borderRadius: "8px" }}>"{altDescription}"</div>
                <AgentResults result={altResult} />
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;