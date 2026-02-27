import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    languagePreference: 'english',
    locality: 'urban',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="brand-icon">🌿</span>
          <h1>MindSaathi</h1>
          <p>Join thousands finding peace and support through compassionate AI</p>
        </div>
        <div className="auth-tagline">
          <div className="auth-feature"><span>🗣️</span><span>Hindi, Marathi & English support</span></div>
          <div className="auth-feature"><span>🏘️</span><span>Tailored for urban & rural India</span></div>
          <div className="auth-feature"><span>🧘</span><span>Guided by psychiatry best practices</span></div>
          <div className="auth-feature"><span>📓</span><span>AI-generated daily journal entries</span></div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">
          <h2>Create account</h2>
          <p className="subtitle">Your username is private and never shown in the app</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username (private)</label>
              <input
                name="username"
                type="text"
                placeholder="Choose a username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                name="password"
                type="password"
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Preferred Language</label>
              <select name="languagePreference" value={form.languagePreference} onChange={handleChange}>
                <option value="english">English</option>
                <option value="hindi">हिंदी (Hindi)</option>
                <option value="marathi">मराठी (Marathi)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Your Area</label>
              <select name="locality" value={form.locality} onChange={handleChange}>
                <option value="urban">Urban (City / Town)</option>
                <option value="rural">Rural (Village / Countryside)</option>
              </select>
            </div>
            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
