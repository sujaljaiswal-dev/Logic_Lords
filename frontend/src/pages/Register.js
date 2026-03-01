import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ParticleBackground from '../components/ParticleBackground/ParticleBackground';
import './Auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '', password: '', confirmPassword: '',
    languagePreference: 'english', locality: 'urban',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState({});

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFocus = e => setFocused(f => ({ ...f, [e.target.name]: true }));
  const handleBlur = e => setFocused(f => ({ ...f, [e.target.name]: false }));
  const isFloating = (name) => focused[name] || form[name];

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try a different username.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ── Left panel ── */}
      <div className="auth-left">
        <ParticleBackground count={60} color="#06b6d4" speed={0.6} />
        <div className="auth-brand">
          <span className="brand-icon">🌿</span>
          <h1>ManoRakshak</h1>
          <p>Join thousands finding peace through compassionate AI</p>
        </div>
        <div className="auth-tagline">
          {[
            ['🗣️', 'Hindi & English support'],
            ['🏘️', 'Tailored for urban & rural India'],
            ['🧘', 'Guided by psychiatry best practices'],
            ['📓', 'AI-generated daily journal entries'],
          ].map(([icon, text], i) => (
            <div className="auth-feature" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
              <span>{icon}</span><span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="auth-right">
        <div className="auth-form-box">
          <h2>Create account</h2>
          <p className="subtitle">Your username is private and never shown in the app</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className={`form-group float-label ${isFloating('username') ? 'is-active' : ''}`}>
              <input name="username" type="text" value={form.username}
                onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur}
                required id="reg-username" />
              <label htmlFor="reg-username">Username (private)</label>
            </div>

            <div className={`form-group float-label ${isFloating('password') ? 'is-active' : ''}`}>
              <input name="password" type="password" value={form.password}
                onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur}
                required minLength={6} id="reg-password" />
              <label htmlFor="reg-password">Password</label>
            </div>

            <div className={`form-group float-label ${isFloating('confirmPassword') ? 'is-active' : ''}`}>
              <input name="confirmPassword" type="password" value={form.confirmPassword}
                onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur}
                required id="reg-confirm" />
              <label htmlFor="reg-confirm">Confirm Password</label>
            </div>

            <div className="form-group select-group">
              <label className="select-label">Preferred Language</label>
              <select name="languagePreference" value={form.languagePreference} onChange={handleChange}>
                <option value="english">English</option>
                <option value="hindi">हिंदी (Hindi)</option>
              </select>
            </div>

            <div className="form-group select-group">
              <label className="select-label">Your Area</label>
              <select name="locality" value={form.locality} onChange={handleChange}>
                <option value="urban">Urban (City / Town)</option>
                <option value="rural">Rural (Village / Countryside)</option>
              </select>
            </div>

            <button className="auth-btn ripple-btn" type="submit" disabled={loading}>
              {loading ? (
                <span className="btn-loading"><span /><span /><span /></span>
              ) : 'Create Account →'}
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
