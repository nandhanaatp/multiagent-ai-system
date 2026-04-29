import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { User, Shield, AlertTriangle, CheckCircle, Save, KeyRound } from 'lucide-react';
import './UserProfile.css';

function UserProfile() {
  const { user, updateProfile, updatePassword, deleteAccount } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdError, setPwdError] = useState('');

  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError(''); setProfileMsg(''); setLoading(true);
    try {
      await updateProfile(fullName);
      setProfileMsg('Profile updated successfully!');
      setTimeout(() => setProfileMsg(''), 5000);
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPwdError(''); setPwdMsg(''); setLoading(true);
    if (newPassword.length < 8) {
      setPwdError('New password must be at least 8 characters');
      setLoading(false);
      return;
    }
    try {
      await updatePassword(oldPassword, newPassword);
      setPwdMsg('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setTimeout(() => setPwdMsg(''), 5000);
    } catch (error) {
      setPwdError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you absolutely sure you want to permanently delete your account? All data will be lost.")) {
      deleteAccount().catch(err => alert("Error: " + err.message));
    }
  };

  return (
    <div className="profile-container">
      {/* Sidebar navigation for Profile settings */}
      <aside className="profile-sidebar glass-card" style={{ padding: '1rem', height: 'fit-content' }}>
        <h3 style={{ margin: '0 0 1rem 0.5rem', fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Settings</h3>
        <button 
          className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`} 
          onClick={() => setActiveTab('profile')}
        >
          <User size={18} /> Account Profile
        </button>
        <button 
          className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`} 
          onClick={() => setActiveTab('security')}
        >
          <Shield size={18} /> Security & Auth
        </button>
        <div style={{ margin: '1rem 0', borderTop: '1px solid var(--border-default)' }}></div>
        <button 
          className={`profile-tab danger ${activeTab === 'danger' ? 'active' : ''}`} 
          onClick={() => setActiveTab('danger')}
        >
          <AlertTriangle size={18} /> Danger Zone
        </button>
      </aside>

      {/* Main Settings Content */}
      <main className="profile-content glass-card">
        <div className="card-header">
          <h2 className="card-title">
            {activeTab === 'profile' && "Account Profile"}
            {activeTab === 'security' && "Security & Auth"}
            {activeTab === 'danger' && "Danger Zone"}
          </h2>
        </div>

        <div className="card-body">
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="profile-form">
              <div className="form-group">
                <label className="form-label">Username</label>
                <input type="text" className="form-input disabled-input" value={user?.username || ''} disabled />
                <small style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Username cannot be changed.</small>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input disabled-input" value={user?.email || ''} disabled />
              </div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)} 
                  placeholder="Enter full name" 
                />
              </div>
              
              {profileMsg && <div className="profile-success-msg"><CheckCircle size={18} /> {profileMsg}</div>}
              {profileError && <div className="profile-error-msg"><AlertTriangle size={18} /> {profileError}</div>}
              
              <div style={{ marginTop: '1rem' }}>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handleUpdatePassword} className="profile-form">
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input 
                  type="password" 
                  className="form-input"
                  value={oldPassword} 
                  onChange={e => setOldPassword(e.target.value)} 
                  required 
                  placeholder="Enter current password"
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input 
                  type="password" 
                  className="form-input"
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  required 
                  placeholder="Create a new password"
                />
                <small style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Must be at least 8 characters long.</small>
              </div>
              
              {pwdMsg && <div className="profile-success-msg"><CheckCircle size={18} /> {pwdMsg}</div>}
              {pwdError && <div className="profile-error-msg"><AlertTriangle size={18} /> {pwdError}</div>}
              
              <div style={{ marginTop: '1rem' }}>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  <KeyRound size={18} /> {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'danger' && (
            <div className="danger-zone-box">
              <h3 style={{ color: 'var(--text-primary)', marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle color="var(--danger)" /> Delete Account
              </h3>
              <p>
                Warning: Deleting your account is completely irreversible. 
                All of your decision history, generated reports, and custom governance policies will be permanently destroyed.
              </p>
              <button onClick={handleDelete} className="btn btn-danger">
                Delete My Account
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default UserProfile;
