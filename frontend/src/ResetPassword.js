import React, { useState } from 'react';
import './Auth.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

function ResetPassword({ token, onBackToLogin }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword })
      });

      if (!res.ok) {
        const errorData = await res.json();
        const msg = typeof errorData.detail === 'string' ? errorData.detail
          : Array.isArray(errorData.detail) ? errorData.detail.map(err => err.msg).join(', ')
          : 'Failed to reset password';
        throw new Error(msg);
      }

      setMessage("Password successfully reset! You can now log in.");
      window.history.pushState({}, document.title, window.location.pathname);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>🔒 Set New Password</h2>
          <p>Please enter your new password</p>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="success-message" style={{ background: '#dcfce7', padding: '12px', borderRadius: '8px', marginBottom: '16px', color: '#166534', border: '1px solid #bbf7d0' }}>
            <span className="error-icon">✅</span>
            <span>{message}</span>
          </div>
        )}

        {message ? (
          <button onClick={onBackToLogin} className="auth-button">
            Proceed to Login
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Must be at least 8 characters"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Saving...' : 'Reset Password'}
            </button>
            <div className="auth-footer" style={{ marginTop: '16px' }}>
                <button type="button" onClick={onBackToLogin} className="link-button" style={{ width: '100%' }}>
                  Cancel & Back to Login
                </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
