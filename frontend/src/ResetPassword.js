import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import './Auth.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

function ResetPassword({ token, onBackToLogin }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password has been reset successfully.');
        setSuccess(true);
      } else {
        setError(data.detail || 'Failed to reset password.');
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
            <h2>Create New Password</h2>
            <p>Please enter your new password below.</p>
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

          {!success ? (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-input-group">
                <label className="auth-label">New Password</label>
                <div className="auth-input-wrapper">
                  <Lock className="auth-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="auth-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
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

              <div className="auth-input-group">
                <label className="auth-label">Confirm Password</label>
                <div className="auth-input-wrapper">
                  <Lock className="auth-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="auth-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: '20px', height: '20px', margin: 0, borderWidth: '2px' }}></div>
                    Updating...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          ) : (
            <div className="auth-footer" style={{ marginTop: '2rem' }}>
              <button onClick={onBackToLogin} className="auth-submit-btn" style={{ width: '100%' }}>
                Go to Login
              </button>
            </div>
          )}

          {!success && (
            <div className="auth-footer" style={{ marginTop: '2rem' }}>
              <button onClick={onBackToLogin} className="auth-link">
                Cancel and return to Login
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Visual / Brand */}
      <div className="auth-visual-side" style={{ background: 'linear-gradient(135deg, #064e3b, var(--bg-app))' }}>
        <div className="visual-bg-glow" style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0) 70%)' }}></div>
        
        <div className="visual-brand">
          <ShieldCheck size={32} /> Explainable AI Governance
        </div>

        <div className="visual-content">
          <h1>Security First.</h1>
          <p>
            Your credentials are secure. After updating your password, you will be redirected to the secure portal.
          </p>
        </div>
      </div>

    </div>
  );
}

export default ResetPassword;
