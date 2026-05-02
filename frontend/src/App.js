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
import { Activity, Search, ShieldAlert, History as HistoryIcon, Settings, User, Menu, X, LogOut, ShieldCheck, PieChart, Zap } from "lucide-react";
import "./App.css";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

function App() {
  const { user, logout, isAuthenticated, loading: authLoading, sessionWarning } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  
  // App State
  const [activeTab, setActiveTab] = useState("analysis");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Analysis State
  const [problemDescription, setProblemDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("governance");

  // Simulation State
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
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading AI Governance Platform...</p>
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
            style={{ position: "absolute", top: "20px", left: "20px", zIndex: 100, padding: "8px 16px", background: "rgba(255,255,255,0.1)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", backdropFilter: "blur(4px)" }}
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

  const generateSaferPrompt = (prompt) => {
    let lower = prompt.toLowerCase();
    if (lower.includes("hack") || lower.includes("bypass") || lower.includes("steal") || lower.includes("unauthorized")) {
      return "Please provide an authorized security audit report for the target system, ensuring all penetration testing guidelines and enterprise compliance policies are strictly followed.";
    }
    if (lower.includes("drop") || lower.includes("delete") || lower.includes("destroy") || lower.includes("remove")) {
      return "Please generate a secure data archiving procedure that backs up the target assets before initiating any soft-deletion workflows in accordance with data retention policies.";
    }
    if (lower.includes("force") || lower.includes("ignore") || lower.includes("override")) {
      return "Requesting standard procedure to perform this action following all safety protocols, requiring secondary manager approval if necessary.";
    }
    return "Analyze the following request while strictly enforcing enterprise security policies, ensuring no unauthorized access or data exposure occurs: " + prompt;
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

  const getPageTitle = () => {
    switch(activeTab) {
      case "analysis": return "AI Analysis Hub";
      case "dashboard": return "Analytics Dashboard";
      case "history": return "Audit History";
      case "policy": return "Policy Builder";
      case "profile": return "User Profile";
      case "admin": return "Admin Command Center";
      default: return "AI Governance Platform";
    }
  };

  return (
    <ErrorBoundary>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#f8fafc', border: '1px solid #334155' } }} />
      <div className="app-container">
        
        {/* Sidebar */}
        <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-header">
            <div className="brand-logo">
              <ShieldCheck size={24} /> <span>AIGov Platform</span>
            </div>
          </div>
          
          <nav className="sidebar-nav">
            <button className={`nav-item ${activeTab === 'analysis' ? 'active' : ''}`} onClick={() => { setActiveTab('analysis'); setMobileMenuOpen(false); }}>
              <Search /> <span>Analysis Hub</span>
            </button>
            <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}>
              <PieChart /> <span>Dashboard</span>
            </button>
            <button className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => { setActiveTab('history'); setMobileMenuOpen(false); }}>
              <HistoryIcon /> <span>Audit History</span>
            </button>
            <button className={`nav-item ${activeTab === 'policy' ? 'active' : ''}`} onClick={() => { setActiveTab('policy'); setMobileMenuOpen(false); }}>
              <Settings /> <span>Policy Builder</span>
            </button>
            {user?.is_admin && (
              <button className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }} style={{ marginTop: '1rem', borderTop: '1px solid var(--border-default)', paddingTop: '1.5rem', borderRadius: 0 }}>
                <ShieldAlert className="text-red-400" /> <span className="text-red-400">Admin Center</span>
              </button>
            )}
          </nav>
          
          <div className="sidebar-footer">
            <button className="nav-item text-red-400" onClick={logout}>
              <LogOut size={18} /> <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Wrapper */}
        <div className="main-wrapper">
          
          {/* Navbar */}
          <header className="navbar">
            <div className="navbar-left">
              <button className="btn-icon d-md-none" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ display: window.innerWidth <= 768 ? 'block' : 'none' }}>
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="page-title">{getPageTitle()}</h1>
            </div>
            
            <div className="navbar-right">
              <div className="user-profile-menu" onClick={() => setActiveTab('profile')}>
                <div className="user-info-text text-right mr-2">
                  <span className="user-name">{user?.full_name || user?.username}</span>
                  <span className="user-role">{user?.is_admin ? 'Administrator' : 'User'}</span>
                </div>
                <div className="user-avatar">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </header>

          {/* Scrollable Content Area */}
          <main className={`main-content custom-scrollbar ${activeTab === 'analysis' && !result && !loading ? 'centered-state' : ''}`}>
            <div className="content-container">
              
              {sessionWarning && (
                <div className="session-warning">
                  <span>⚠️ Your session is about to expire. Please save your work.</span>
                  <button onClick={logout} className="session-logout-btn">Logout</button>
                </div>
              )}

              {activeTab === 'analysis' && (
                <>
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
                      
                      {result.mode === "governance" && (result.governance_output?.decision === 'BLOCK' || result.governance_output?.decision === 'REVIEW') && (
                        <div className="prompt-suggestion-card" style={{ marginTop: '2rem', padding: '2rem', borderRadius: 'var(--radius-xl)', background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.1), rgba(6, 78, 59, 0.2))', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                          <div className="prompt-suggestion-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <ShieldCheck className="text-emerald-400" size={28} />
                            <h3 style={{ color: '#34d399', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Prompt Improvement Suggestion</h3>
                          </div>
                          <p style={{ color: '#cbd5e1', marginBottom: '1.5rem', fontSize: '1.05rem' }}>Your prompt triggered a security policy. Try this safer, enterprise-compliant version:</p>
                          <div className="prompt-suggestion-box" style={{ background: '#0f172a', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid #334155', color: '#f8fafc', fontStyle: 'italic', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                            "{generateSaferPrompt(problemDescription)}"
                          </div>
                          <button 
                            className="btn btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#10b981', color: '#0f172a', fontWeight: 700, padding: '0.75rem 1.5rem' }}
                            onClick={() => {
                               setProblemDescription(generateSaferPrompt(problemDescription));
                               window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                          >
                            <Zap size={18} /> Use Suggested Prompt
                          </button>
                        </div>
                      )}

                      {result.mode === "governance" && (
                        <ReportViewer
                          result={result}
                          problemDescription={problemDescription}
                        />
                      )}
                    </>
                  )}

                  {result && altResult && isSimulation && (
                    <div className="simulation-insights">
                      <div className="sim-insight-card">
                        <h2 className="sim-insight-title">
                          <Activity size={24} className="text-blue-500" /> Decision Comparison Insight
                        </h2>
                        
                        <div className="sim-grid">
                          {/* Decision Change */}
                          <div className="sim-box">
                            <span className="sim-box-label">Decision Change</span>
                            <div className="sim-box-value">
                              <span style={{ color: result.governance_output?.decision === 'BLOCK' ? '#ef4444' : '#f8fafc' }}>{result.governance_output?.decision}</span> 
                              <span className="text-slate-500 mx-2">➔</span> 
                              <span style={{ color: altResult.governance_output?.decision === 'ALLOW' ? '#10b981' : '#f8fafc' }}>{altResult.governance_output?.decision}</span>
                            </div>
                          </div>

                          {/* Risk Change */}
                          {(() => {
                            const r1 = result.risk_output?.score || 0;
                            const r2 = altResult.risk_output?.score || 0;
                            const diff = r1 - r2;
                            const isImproved = diff > 0;
                            const diffColor = isImproved ? "#10b981" : (diff < 0 ? "#ef4444" : "#94a3b8");
                            return (
                              <div className="sim-box" style={{ borderColor: isImproved ? "rgba(16, 185, 129, 0.3)" : (diff < 0 ? "rgba(239, 68, 68, 0.3)" : "") }}>
                                <span className="sim-box-label">Risk Indicator</span>
                                <div className="sim-box-value">
                                  {r1} <span className="text-slate-500 mx-2">➔</span> {r2} 
                                  <span className="sim-box-delta" style={{ color: diffColor }}>
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
                            const diffColor = isImproved ? "#10b981" : (diff < 0 ? "#ef4444" : "#94a3b8");
                            return (
                              <div className="sim-box" style={{ borderColor: isImproved ? "rgba(16, 185, 129, 0.3)" : (diff < 0 ? "rgba(239, 68, 68, 0.3)" : "") }}>
                                <span className="sim-box-label">Confidence Change</span>
                                <div className="sim-box-value">
                                  {c1.toFixed(0)}% <span className="text-slate-500 mx-2">➔</span> {c2.toFixed(0)}% 
                                  <span className="sim-box-delta" style={{ color: diffColor }}>
                                    ({isImproved ? `↑${Math.abs(diff).toFixed(0)}%` : (diff < 0 ? `↓${Math.abs(diff).toFixed(0)}%` : 'No Change')})
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Side-by-Side Explanations */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', marginTop: '3rem' }}>
                        <div>
                          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.5rem' }}>Original Scenario Analysis</h3>
                          <AgentResults result={result} isCompact={true} />
                        </div>
                        <div>
                          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.5rem' }}>Modified Scenario Analysis</h3>
                          <AgentResults result={altResult} isCompact={true} />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Other Tabs */}
              {activeTab === 'dashboard' && <Dashboard onClose={() => setActiveTab('analysis')} />}
              {activeTab === 'history' && <History onClose={() => setActiveTab('analysis')} />}
              {activeTab === 'policy' && <PolicyBuilder onClose={() => setActiveTab('analysis')} />}
              {activeTab === 'profile' && <UserProfile onClose={() => setActiveTab('analysis')} />}
              {activeTab === 'admin' && <AdminDashboard onClose={() => setActiveTab('analysis')} />}

            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;