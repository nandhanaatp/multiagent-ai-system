import React, { useState } from 'react';
import { ShieldCheck, Mail, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import './Auth.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Check your email for reset instructions.');
      } else {
        setError(data.detail || 'Failed to process request.');
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
            <h2>Reset Password</h2>
            <p>Enter your email to receive reset instructions.</p>
          </div>

          {error && (
            <div className="auth-error">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="auth-error" style={{ backgroundColor: 'var(--success-bg)', borderColor: 'rgba(16, 185, 129, 0.3)', color: 'var(--success)' }}>
              <CheckCircle size={18} />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-input-group">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrapper">
                <Mail className="auth-icon" />
                <input
                  type="email"
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '20px', height: '20px', margin: 0, borderWidth: '2px' }}></div>
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: '2rem' }}>
            <button onClick={onBackToLogin} className="auth-link" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }}>
              <ArrowLeft size={16} /> Back to Login
            </button>
          </div>
        </div>
      </div>

      {/* Right Side: Visual / Brand */}
      <div className="auth-visual-side" style={{ background: 'linear-gradient(135deg, #1e1b4b, var(--bg-app))' }}>
        <div className="visual-bg-glow" style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(15, 23, 42, 0) 70%)' }}></div>
        
        <div className="visual-brand">
          <ShieldCheck size={32} /> Explainable AI Governance
        </div>

        <div className="visual-content">
          <h1>Account Recovery.</h1>
          <p>
            Regain access to your secure environment. We ensure all communications are encrypted and identity verified.
          </p>
        </div>
      </div>

    </div>
  );
}

export default ForgotPassword;
