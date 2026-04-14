import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
const REFRESH_BEFORE_EXPIRY_MS = 5 * 60 * 1000;

const AuthContext = createContext(null);

// Token stored in memory only — not localStorage, not a cookie
let memoryToken = null;

export const getToken = () => memoryToken;

const authHeaders = () => ({
  'Content-Type': 'application/json',
  ...(memoryToken ? { 'Authorization': `Bearer ${memoryToken}` } : {})
});

const getTokenExpiry = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch { return null; }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionWarning, setSessionWarning] = useState(false);
  const refreshTimerRef = useRef(null);

  const logout = useCallback(() => {
    memoryToken = null;
    setUser(null);
    setSessionWarning(false);
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
  }, []);

  const scheduleRefresh = useCallback((token) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    const expiry = getTokenExpiry(token);
    if (!expiry) return;
    const delay = expiry - Date.now() - REFRESH_BEFORE_EXPIRY_MS;
    if (delay <= 0) { setSessionWarning(true); return; }

    refreshTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${memoryToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          memoryToken = data.access_token;
          scheduleRefresh(data.access_token);
          setSessionWarning(false);
        } else {
          setSessionWarning(true);
        }
      } catch {
        setSessionWarning(true);
      }
    }, delay);
  }, []);

  const register = async (username, email, password, fullName) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, full_name: fullName })
    });
    if (!res.ok) {
      const error = await res.json();
      const msg = typeof error.detail === 'string' ? error.detail
        : Array.isArray(error.detail) ? error.detail.map(e => e.msg).join(', ')
        : 'Registration failed';
      throw new Error(msg);
    }
    // register returns UserResponse, not a token — login after register
    return await res.json();
  };

  const login = async (username, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const error = await res.json();
      const msg = typeof error.detail === 'string' ? error.detail
        : Array.isArray(error.detail) ? error.detail.map(e => e.msg).join(', ')
        : 'Login failed';
      throw new Error(msg);
    }
    const data = await res.json();
    memoryToken = data.access_token;

    const meRes = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${memoryToken}` }
    });
    if (meRes.ok) {
      const userData = await meRes.json();
      setUser(userData);
      scheduleRefresh(memoryToken);
    }
  };

  const deleteAccount = async () => {
    const res = await fetch(`${API_URL}/auth/me`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${memoryToken}` }
    });
    if (!res.ok) {
      throw new Error('Failed to delete account');
    }
    logout();
  };

  const updateProfile = async (fullName) => {
    const res = await fetch(`${API_URL}/auth/me`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${memoryToken}` },
      body: JSON.stringify({ full_name: fullName })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to update profile');
    }
    const updatedUser = await res.json();
    setUser(updatedUser);
  };

  const updatePassword = async (oldPassword, newPassword) => {
    const res = await fetch(`${API_URL}/auth/password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${memoryToken}` },
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
    });
    if (!res.ok) {
      const error = await res.json();
      const msg = typeof error.detail === 'string' ? error.detail : Array.isArray(error.detail) ? error.detail.map(e => e.msg).join(', ') : 'Failed to update password';
      throw new Error(msg);
    }
  };

  useEffect(() => {
    // No persisted token on page load — user must log in
    setLoading(false);
    return () => { if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current); };
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading, sessionWarning,
      register, login, logout, deleteAccount,
      updateProfile, updatePassword,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
