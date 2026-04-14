import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import './Auth.css';

function Login({ onSwitchToRegister, onSwitchToForgot }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>🔐 Login</h2>
          <p>Welcome back to AI Governance System</p>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username or Email</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username or email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
            <p>
              Don't have an account?{' '}
              <button onClick={onSwitchToRegister} className="link-button">
                Register here
              </button>
            </p>
            <p>
              <button onClick={onSwitchToForgot} className="link-button" style={{color: '#6b7280'}}>
                Forgot Password?
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
