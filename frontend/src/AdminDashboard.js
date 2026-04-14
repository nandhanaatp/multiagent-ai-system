import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, getToken } from './AuthContext';
import './AdminDashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

function AdminDashboard({ onClose }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/admin/stats`, { headers: { 'Authorization': `Bearer ${getToken()}` } }),
        fetch(`${API_URL}/admin/users`, { headers: { 'Authorization': `Bearer ${getToken()}` } })
      ]);

      if (!statsRes.ok || !usersRes.ok) throw new Error("Failed to load admin privileges.");

      setStats(await statsRes.json());
      setUsers(await usersRes.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`Are you absolutely sure you want to permanently delete user '${username}'?`)) {
      try {
        const res = await fetch(`${API_URL}/admin/users/${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || "Failed to delete user");
        }
        setUsers(users.filter(u => u.user_id !== userId));
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="admin-overlay">
      <div className="admin-panel">
        <div className="admin-header">
          <h2>🛡️ Global Admin Dashboard</h2>
          <button className="admin-close" onClick={onClose}>✕</button>
        </div>

        <div className="admin-content">
          {loading ? (
            <div className="admin-loading"><div className="spinner"></div></div>
          ) : error ? (
            <div className="error-message">🚨 {error}</div>
          ) : (
            <>
              {stats && (
                <div className="admin-stats-grid">
                  <div className="admin-stat-card">
                    <span className="stat-value">{stats.total_users}</span>
                    <span className="stat-label">Total Users</span>
                    <span className="stat-sub">({stats.total_admins} Administrators)</span>
                  </div>
                  <div className="admin-stat-card">
                    <span className="stat-value">{stats.total_queries}</span>
                    <span className="stat-label">Total Inferences</span>
                    <span className="stat-sub">Global platform volume</span>
                  </div>
                  <div className="admin-stat-card">
                    <span className="stat-value">{stats.decisions?.BLOCK || 0}</span>
                    <span className="stat-label">Blocks Executed</span>
                    <span className="stat-sub">High-risk interventions</span>
                  </div>
                </div>
              )}

              <div className="admin-users-section">
                <h3>👥 Registered Users</h3>
                <div className="users-table-container">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Email</th>
                        <th>Inferences</th>
                        <th>Joined Date</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.user_id}>
                          <td style={{color: '#9ca3af'}}>#{u.user_id}</td>
                          <td className="fw-bold">{u.username}</td>
                          <td>{u.email}</td>
                          <td><span className="query-badge">{u.query_count}</span></td>
                          <td>{new Date(u.created_at).toLocaleDateString()}</td>
                          <td>
                            {u.is_admin ? <span className="role-badge admin">ADMIN</span> : <span className="role-badge user">USER</span>}
                          </td>
                          <td>
                            {!u.is_admin && (
                              <button 
                                className="action-btn delete" 
                                onClick={() => handleDeleteUser(u.user_id, u.username)}
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
