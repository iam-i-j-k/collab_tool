import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, User, Lock, ArrowRight, Users, Eye, EyeOff } from 'lucide-react';
import { UserContext } from '../context/UserContext';
import './register.css';
// import { toast } from 'react-hot-toast'; // Optional success toast

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    gender: 'other',
    subscribe: false,
    bio: '',
    role: 'viewer',
  });
  const [passwordError, setPasswordError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [error, setError] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  // Validate password
  const isValidPassword = (pw) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,15}$/.test(pw);

  useEffect(() => {
    return () => {
      if (profilePreview) URL.revokeObjectURL(profilePreview);
    };
  }, [profilePreview]);

  // Validate username
  const isValidUsername = (username) => {
    const hasMinLength = username.length >= 6;
    const hasLetter = /[a-zA-Z]/.test(username);
    const hasNumber = /[0-9]/.test(username);
    return hasMinLength && hasLetter && hasNumber;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (name === 'name') {
      if (value && !isValidUsername(value)) {
        setUsernameError(
          'Username must be at least 6 characters long and include at least 1 letter and 1 number.'
        );
      } else {
        setUsernameError('');
      }
    }

    if (name === 'password') {
      if (value && !isValidPassword(value)) {
        setPasswordError(
          'Password must be 8–15 chars, include uppercase, lowercase, number, and special character.'
        );
      } else {
        setPasswordError('');
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validate required fields and username format
    if (!form.name.trim()) {
      setError('Username is required');
      document.getElementById('name').focus();
      return;
    }

    if (!isValidUsername(form.name)) {
      setError('Username must be at least 6 characters long and include at least 1 letter and 1 number');
      document.getElementById('name').focus();
      return;
    }

    if (!form.email.trim()) {
      setError('Email is required');
      document.getElementById('email').focus();
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address');
      document.getElementById('email').focus();
      return;
    }

    if (!isValidPassword(form.password)) {
      setPasswordError(
        'Password must be 8–15 chars, include uppercase, lowercase, number, and special character.'
      );
      document.getElementById('password').focus();
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (profileImage) formData.append('profileImage', profileImage);

      const { data } = await axios.post(
        `${process.env.REACT_APP_URL}/api/auth/register`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);

      // toast.success('Account created successfully!'); // Optional toast
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (!err.response) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setForm({
      name: '',
      email: '',
      password: '',
      gender: '',
      subscribe: false,
      bio: '',
      role: 'viewer',
    });
    setPasswordError('');
    setProfileImage(null);
    setProfilePreview('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Create Account</h1>
          <p>Join our community today</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleRegister} className="register-form">
          {/* Name */}
          <div className="form-group">
            <label htmlFor="name">
              <User size={18} />
              <span>Username</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your username (min 6 chars, 1 letter & 1 number)"
              required
              autoFocus
            />
            {usernameError && (
              <small style={{ color: '#ef4444', fontSize: '0.8rem' }}>
                {usernameError}
              </small>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">
              <Mail size={18} />
              <span>Email address</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">
              <Lock size={18} />
              <span>Password</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="toggle-password-btn"
                aria-label="Toggle password visibility"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#888',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordError && (
              <small style={{ color: '#ef4444', fontSize: '0.8rem' }}>
                {passwordError}
              </small>
            )}
          </div>

          {/* Gender */}
          <div className="form-group">
            <label>Gender</label>
            <div className="radio-group">
              {['male', 'female'].map((g) => (
                <label key={g}>
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={form.gender === g}
                    onChange={handleChange}
                  />{' '}
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </label>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="form-group">
            <label>Interests</label>
            <div className="checkbox-group">
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  name="subscribe"
                  checked={form.subscribe}
                  onChange={handleChange}
                />{' '}
                <span>Subscribe to newsletter</span>
              </label>
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  name="joinCommunity"
                  checked={form.joinCommunity}
                  onChange={handleChange}
                />{' '}
                <span>Join community discussions</span>
              </label>
            </div>
          </div>

          {/* Bio */}
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself (optional)"
              rows={4}
            ></textarea>
          </div>

          {/* Profile Image */}
          <div className="form-group">
            <label htmlFor="profileImage">Profile Image</label>
            <input
              id="profileImage"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setProfileImage(file);
                  setProfilePreview(URL.createObjectURL(file));
                } else {
                  setProfileImage(null);
                  setProfilePreview('');
                }
              }}
            />
            {profilePreview && (
              <img
                src={profilePreview}
                alt="Preview"
                className="profile-preview"
                style={{
                  maxWidth: '120px',
                  marginTop: '8px',
                  borderRadius: '8px',
                }}
              />
            )}
          </div>

          {/* Role */}
          <div className="form-group">
            <label htmlFor="role">
              <Users size={18} />
              <span>Role</span>
            </label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              required
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
          </div>


          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              className="register-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  Register <ArrowRight size={16} />
                </>
              )}
            </button>

            <button
              type="button"
              className="reset-button"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </form>

        <div className="register-footer">
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>

      {/* Background Shapes */}
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
    </div>
  );
}
