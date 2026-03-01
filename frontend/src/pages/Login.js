import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ParticleBackground from '../components/ParticleBackground/ParticleBackground';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState({});

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFocus = e => setFocused(f => ({ ...f, [e.target.name]: true }));
  const handleBlur = e => setFocused(f => ({ ...f, [e.target.name]: false }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const isFloating = (name) => focused[name] || form[name];

  return (
    <div className="auth-page">
      {/* ── Left panel ── */}
      <div className="auth-left">
        <ParticleBackground count={60} color="#7c3aed" speed={0.7} />
        <div className="auth-brand">
          <span className="brand-icon">🌿</span>
          <h1>ManoRakshak</h1>
          <p>Your compassionate mental health companion, available 24/7</p>
        </div>
        <div className="auth-tagline">
          {[
            ['🤝', 'Empathetic AI support in your language'],
            ['🔒', 'Private & secure conversations'],
            ['🌱', 'Daily journaling & mood tracking'],
            ['🕵️', 'Incognito mode for sensitive topics'],
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
          <h2>Welcome back</h2>
          <p className="subtitle">Sign in to continue your wellness journey</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} autoComplete="off">
            {/* Floating label inputs */}
            <div className={`form-group float-label ${isFloating('username') ? 'is-active' : ''}`}>
              <input
                name="username" type="text"
                value={form.username} onChange={handleChange}
                onFocus={handleFocus} onBlur={handleBlur}
                required autoComplete="username" id="login-username"
              />
              <label htmlFor="login-username">Username</label>
            </div>

            <div className={`form-group float-label ${isFloating('password') ? 'is-active' : ''}`}>
              <input
                name="password" type="password"
                value={form.password} onChange={handleChange}
                onFocus={handleFocus} onBlur={handleBlur}
                required autoComplete="current-password" id="login-password"
              />
              <label htmlFor="login-password">Password</label>
            </div>

            <button className="auth-btn ripple-btn" type="submit" disabled={loading}>
              {loading ? (
                <span className="btn-loading"><span /><span /><span /></span>
              ) : 'Sign In →'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
