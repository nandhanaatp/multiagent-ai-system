import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import './UserProfile.css';

function UserProfile({ onClose }) {
  const { user, updateProfile, updatePassword, logout, deleteAccount } = useAuth();
  
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
    <div className="profile-overlay">
      <div className="profile-panel">
        <div className="profile-header">
          <h2>User Settings</h2>
          <button className="profile-close" onClick={onClose}>✕</button>
        </div>

        <div className="profile-tabs">
          <button className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profile</button>
          <button className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>Security</button>
          <button className={`profile-tab ${activeTab === 'danger' ? 'active danger' : ''}`} onClick={() => setActiveTab('danger')}>Danger Zone</button>
        </div>

        <div className="profile-body">
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="profile-form">
              <div className="form-group">
                <label>Username (Immutable)</label>
                <input type="text" value={user?.username || ''} disabled className="disabled-input" />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={user?.email || ''} disabled className="disabled-input" />
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter full name" />
              </div>
              {profileMsg && <div className="success-msg">{profileMsg}</div>}
              {profileError && <div className="error-msg">{profileError}</div>}
              <button type="submit" disabled={loading} className="save-btn">{loading ? 'Saving...' : 'Save Changes'}</button>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handleUpdatePassword} className="profile-form">
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
              </div>
              {pwdMsg && <div className="success-msg">{pwdMsg}</div>}
              {pwdError && <div className="error-msg">{pwdError}</div>}
              <button type="submit" disabled={loading} className="save-btn">{loading ? 'Updating...' : 'Update Password'}</button>
            </form>
          )}

          {activeTab === 'danger' && (
            <div className="danger-zone">
              <p>Warning: Deleting your account is irreversible. All of your decision history and policies will be permanently destroyed.</p>
              <button onClick={handleDelete} className="delete-btn">Delete My Account</button>
            </div>
          )}
        </div>
        
        <div className="profile-footer">
          <button onClick={logout} className="logout-full-btn">Log Out</button>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
