import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, User, AlertTriangle, Eye, EyeOff, CheckCircle, Activity, ShieldAlert, BrainCircuit, CheckCircle2 } from 'lucide-react';
import './Auth.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

function Register({ onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg('Registration successful! You can now log in.');
        setUsername('');
        setEmail('');
        setPassword('');
      } else {
        setError(data.detail || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
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
            <h2>Create an account</h2>
            <p>Join the secure AI Governance platform.</p>
          </div>

          {error && (
            <div className="auth-error">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="auth-error" style={{ backgroundColor: 'var(--success-bg)', borderColor: 'rgba(16, 185, 129, 0.3)', color: 'var(--success)' }}>
              <CheckCircle size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-input-group">
              <label className="auth-label">Username</label>
              <div className="auth-input-wrapper">
                <User className="auth-icon" />
                <input
                  type="text"
                  className="auth-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrapper">
                <Mail className="auth-icon" />
                <input
                  type="email"
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrapper">
                <Lock className="auth-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
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
                  Creating Account...
                </>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <button onClick={onSwitchToLogin} className="auth-link">
                Log in here
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Visual / Brand */}
      <div className="auth-visual-side" style={{ background: 'linear-gradient(135deg, var(--bg-panel), #0f172a)' }}>
        <div className="visual-bg-glow" style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0) 70%)' }}></div>
        <div className="visual-bg-glow-2" style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(15, 23, 42, 0) 70%)' }}></div>
        
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
          <h1>Secure By Design.</h1>
          <p>
            Build trust in your AI systems. Register now to gain access to comprehensive audit trails, policy management, and intelligent agent orchestration.
          </p>
        </div>
      </div>

    </div>
  );
}

export default Register;
