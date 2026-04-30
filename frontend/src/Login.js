import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { ShieldCheck, Mail, Lock, AlertTriangle, Eye, EyeOff, Activity, ShieldAlert, BrainCircuit, CheckCircle2 } from 'lucide-react';
import './Auth.css';

function Login({ onSwitchToRegister, onSwitchToForgot }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      
      {/* Left Side: Form */}
      <div className="auth-form-side">
        <div className="auth-form-container">
          
          <div className="auth-brand-mobile">
            <ShieldCheck size={28} /> AI Gov
          </div>

          <div className="auth-header">
            <h2>Welcome back</h2>
            <p>Log in to access your AI Governance dashboard.</p>
          </div>

          {error && (
            <div className="auth-error">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-input-group">
              <label className="auth-label">Username or Email</label>
              <div className="auth-input-wrapper">
                <Mail className="auth-icon" />
                <input
                  type="text"
                  className="auth-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username or email"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="auth-input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="auth-label">Password</label>
                <button type="button" onClick={onSwitchToForgot} className="auth-forgot-link" tabIndex="-1">
                  Forgot password?
                </button>
              </div>
              <div className="auth-input-wrapper">
                <Lock className="auth-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '20px', height: '20px', margin: 0, borderWidth: '2px' }}></div>
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <button onClick={onSwitchToRegister} className="auth-link">
                Create one now
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Visual / Brand */}
      <div className="auth-visual-side">
        <div className="visual-bg-glow"></div>
        <div className="visual-bg-glow-2"></div>
        
        <div className="visual-brand">
          <ShieldCheck size={32} /> Explainable AI Governance
        </div>

        <div className="visual-mockup-container">
          <div className="mockup-workflow">
            <div className="workflow-node user-node">User Prompt</div>
            <div className="workflow-line"></div>
            <div className="workflow-node agent-node">
              <BrainCircuit size={20} />
              Risk Analysis Agent
            </div>
            <div className="workflow-line"></div>
            <div className="workflow-node decision-node allow">
              <CheckCircle2 size={20} />
              Policy Approved
            </div>
          </div>

          <div className="mockup-floating-card top-right">
            <div className="card-header">Live Telemetry</div>
            <div className="card-stat">
              <span className="stat-value">12%</span>
              <span className="stat-label">Risk Score</span>
            </div>
            <div className="card-badge secure">Secure</div>
          </div>
          
          <div className="mockup-floating-card bottom-left">
            <div className="card-header">Threat Defense</div>
            <div className="threat-item">
              <ShieldAlert size={16} color="#f59e0b" />
              <span>Jailbreak Attempt Blocked</span>
            </div>
            <div className="threat-item">
              <Activity size={16} color="#10b981" />
              <span>Normal Traffic</span>
            </div>
          </div>
        </div>

        <div className="visual-content">
          <h1>Enterprise-Grade Agent Security.</h1>
          <p>
            Deploy and orchestrate autonomous AI agents with total confidence. 
            Real-time risk assessment, adversarial defense, and policy-driven governance.
          </p>
        </div>
      </div>

    </div>
  );
}

export default Login;
