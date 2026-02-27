import React, { useState } from 'react';
import { authAPI } from '../utils/api';
import { FaStethoscope } from 'react-icons/fa';
import './Login.css';

export default function Login({ onLogin }) {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = isRegister
                ? await authAPI.register(formData)
                : await authAPI.login({ email: formData.email, password: formData.password });

            onLogin(response.data.data.user, response.data.data.token);
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-4">
                        <FaStethoscope className="text-white text-3xl" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Silent Symptom Mapper</h1>
                    <p className="text-gray-600 mt-2">AI-powered health tracking for better diagnosis</p>
                </div>

                {/* Login/Register Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        {isRegister ? 'Create Account' : 'Welcome Back'}
                    </h2>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isRegister && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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
          <p>Your compassionate mental health companion, available 24/7</p>
        </div>
        <div className="auth-tagline">
          <div className="auth-feature"><span>🤝</span><span>Empathetic AI support in your language</span></div>
          <div className="auth-feature"><span>🔒</span><span>Private & secure conversations</span></div>
          <div className="auth-feature"><span>🌱</span><span>Daily journaling & mood tracking</span></div>
          <div className="auth-feature"><span>🕵️</span><span>Incognito mode for sensitive topics</span></div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">
          <h2>Welcome back</h2>
          <p className="subtitle">Sign in to continue your wellness journey</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                name="username"
                type="text"
                placeholder="Enter your username"
                value={form.username}
                onChange={handleChange}
                required
                autoComplete="username"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                name="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </div>
            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
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
lastName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength="8"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-3 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In')}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsRegister(!isRegister);
                                setError('');
                            }}
                            className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
                        </button>
                    </div>
                </div>

                {/* Features */}
                <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white/50 backdrop-blur-sm p-4 rounded-lg">
                        <div className="text-2xl mb-1">🎤</div>
                        <div className="text-sm text-gray-600">Voice Notes</div>
                    </div>
                    <div className="bg-white/50 backdrop-blur-sm p-4 rounded-lg">
                        <div className="text-2xl mb-1">📸</div>
                        <div className="text-sm text-gray-600">Photo Tracking</div>
                    </div>
                    <div className="bg-white/50 backdrop-blur-sm p-4 rounded-lg">
                        <div className="text-2xl mb-1">📊</div>
                        <div className="text-sm text-gray-600">AI Insights</div>
                    </div>
                </div>
            </div>
        </div>
    );
}