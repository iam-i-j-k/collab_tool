import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Shield, Save, AlertTriangle, ChevronRight, Check } from 'lucide-react';
import './settings.css';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  
  // Password strength
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  useEffect(() => {
    // Get user data from sessionStorage
    const userString = sessionStorage.getItem("user");
    if (userString) {
      const userData = JSON.parse(userString);
      setUser(userData);
      setUsername(userData.name || '');
      setEmail(userData.email || '');
      setRole(userData.role || 'viewer');
    } else {
      // Redirect if no user is logged in
      navigate('/login');
    }
  }, [navigate]);
  
  useEffect(() => {
    // Simple password strength checker
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  }, [password]);
  
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      
      const response = await fetch("http://localhost:5000/api/auth/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          username, 
          email, 
          password: password || undefined, // Only send password if it's not empty
          role 
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        sessionStorage.setItem("user", JSON.stringify(updatedUser.user));
        
        // Show success toast
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
        
        // Clear password field after successful update
        setPassword('');
      } else {
        const error = await response.json();
        alert(`Failed to update settings: ${error.message}`);
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/auth/delete", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        navigate("/");
      } else {
        const error = await response.json();
        alert(`Failed to delete account: ${error.message}`);
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };
  
  if (!user) {
    return <div className="settings-loading">Loading settings...</div>;
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Account Settings</h1>
        <p>Manage your account preferences and settings</p>
      </div>
      
      <div className="settings-content">
        <div className="settings-sidebar">
          <div className="user-profile">
            <div className="user-avatar">
              {username ? username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <h3>{username || 'User'}</h3>
              <p>{email || 'No email set'}</p>
            </div>
          </div>
          
          <nav className="settings-nav">
            <button 
              className={`nav-item ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => setActiveTab('account')}
            >
              <User size={18} />
              <span>Account</span>
              <ChevronRight size={16} className="nav-arrow" />
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <Lock size={18} />
              <span>Security</span>
              <ChevronRight size={16} className="nav-arrow" />
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'permissions' ? 'active' : ''}`}
              onClick={() => setActiveTab('permissions')}
            >
              <Shield size={18} />
              <span>Permissions</span>
              <ChevronRight size={16} className="nav-arrow" />
            </button>
          </nav>
          
          <div className="sidebar-footer">
            <button 
              className="delete-account-btn"
              onClick={() => setShowDeleteModal(true)}
            >
              <AlertTriangle size={16} />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
        
        <div className="settings-main">
          {activeTab === 'account' && (
            <div className="settings-panel">
              <h2>Account Information</h2>
              <p>Update your basic account information</p>
              
              <div className="form-group">
                <label htmlFor="username">
                  <User size={16} />
                  <span>Username</span>
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">
                  <Mail size={16} />
                  <span>Email</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
            </div>
          )}
          
          {activeTab === 'security' && (
            <div className="settings-panel">
              <h2>Security Settings</h2>
              <p>Manage your password and security preferences</p>
              
              <div className="form-group">
                <label htmlFor="password">
                  <Lock size={16} />
                  <span>New Password</span>
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                
                {password && (
                  <div className="password-strength">
                    <div className="strength-meter">
                      <div 
                        className={`strength-value strength-${passwordStrength}`}
                        style={{ width: `${passwordStrength * 25}%` }}
                      ></div>
                    </div>
                    <span className="strength-text">
                      {passwordStrength === 0 && 'Very weak'}
                      {passwordStrength === 1 && 'Weak'}
                      {passwordStrength === 2 && 'Medium'}
                      {passwordStrength === 3 && 'Strong'}
                      {passwordStrength === 4 && 'Very strong'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="security-tips">
                <h4>Password Tips</h4>
                <ul>
                  <li className={password.length >= 8 ? 'valid' : ''}>
                    At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(password) ? 'valid' : ''}>
                    At least one uppercase letter
                  </li>
                  <li className={/[0-9]/.test(password) ? 'valid' : ''}>
                    At least one number
                  </li>
                  <li className={/[^A-Za-z0-9]/.test(password) ? 'valid' : ''}>
                    At least one special character
                  </li>
                </ul>
              </div>
            </div>
          )}
          
          {activeTab === 'permissions' && (
            <div className="settings-panel">
              <h2>Permissions</h2>
              <p>Manage your role and permissions</p>
              
              <div className="form-group">
                <label htmlFor="role">
                  <Shield size={16} />
                  <span>Role</span>
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                </select>
              </div>
              
              <div className="role-description">
                <h4>Role Permissions</h4>
                <div className="role-card">
                  <h5>Viewer</h5>
                  <p>Can view documents but cannot edit them</p>
                  <ul>
                    <li>View all documents</li>
                    <li>Download documents</li>
                    <li>Add comments</li>
                  </ul>
                </div>
                
                <div className="role-card">
                  <h5>Editor</h5>
                  <p>Can view and edit documents</p>
                  <ul>
                    <li>All viewer permissions</li>
                    <li>Create new documents</li>
                    <li>Edit existing documents</li>
                    <li>Share documents with others</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          <div className="settings-actions">
            <button 
              className={`save-btn ${isLoading ? 'loading' : ''}`}
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="spinner"></span>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <AlertTriangle size={24} className="warning-icon" />
              <h3>Delete Account</h3>
            </div>
            <p>Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.</p>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className={`confirm-delete-btn ${isLoading ? 'loading' : ''}`}
                onClick={handleDeleteAccount}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="spinner"></span>
                ) : (
                  'Delete Account'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Success Toast */}
      <div className={`success-toast ${showSuccessToast ? 'show' : ''}`}>
        <Check size={18} />
        <span>Settings updated successfully!</span>
      </div>
    </div>
  );
}
