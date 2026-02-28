import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Dashboard.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const TIPS = [
  "Take 5 deep breaths when you feel overwhelmed. Inhale for 4 counts, hold for 4, exhale for 6.",
  "एक छोटा ब्रेक लें। पानी पिएं और खिड़की के बाहर देखें।",
  "Try grounding: Name 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.",
  "Small progress is still progress. Be kind to yourself today.",
];

const stressColor = (level) => {
  if (level <= 3) return '#27ae60';
  if (level <= 6) return '#e67e22';
  return '#c0392b';
};

export default function Dashboard() {
  const { user, isIncognito, connectionSpeed } = useAuth();
  const navigate = useNavigate();
  const [journals, setJournals] = useState([]);
  const [tip] = useState(TIPS[Math.floor(Math.random() * TIPS.length)]);

  useEffect(() => {
    if (!isIncognito) {
      axios.get(`${API}/journal`).then(res => setJournals(res.data)).catch(() => { });
    }
  }, [isIncognito]);

  const stressLevel = user?.stressLevel || 0;
  const todayDate = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className={`dashboard ${isIncognito ? 'incognito' : ''}`}>
      <div className="dashboard-header">
        <h1>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'} 🌿</h1>
        <p>{todayDate}</p>
      </div>

      {isIncognito && (
        <div className="incognito-notice">
          🕵️ <span>You're in Incognito Mode — nothing is being saved or tracked right now.</span>
        </div>
      )}

      {connectionSpeed === 'very-slow' && (
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffc107',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          borderRadius: '0.5rem',
          color: '#856404',
          fontSize: '0.9rem'
        }}>
          ⚠️ <strong>Slow Connection Detected:</strong> Some features like voice chat and camera are disabled to save data. Text chat works great!
        </div>
      )}

      {!isIncognito && (
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">😤</span>
            <h3>{stressLevel}/10</h3>
            <p>Current Stress Level</p>
            <div className="stress-bar-wrap">
              <div className="stress-bar">
                <div className="stress-fill" style={{ width: `${stressLevel * 10}%`, background: stressColor(stressLevel) }} />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📓</span>
            <h3>{journals.length}</h3>
            <p>Journal Entries</p>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🌐</span>
            <h3>{user?.languagePreference?.charAt(0).toUpperCase() + user?.languagePreference?.slice(1)}</h3>
            <p>Preferred Language</p>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🏘️</span>
            <h3>{user?.locality?.charAt(0).toUpperCase() + user?.locality?.slice(1)}</h3>
            <p>Your Area</p>
          </div>
        </div>
      )}

      <div className="quick-actions">
        <h2>What would you like to do?</h2>
        <div className="actions-row">
          <button className="action-btn chat" onClick={() => navigate('/chat')}>
            <span className="action-icon">💬</span>
            <span className="action-label">Talk to ManoRakshak</span>
            <span className="action-desc">AI psychiatrist support, anytime</span>
          </button>
          {!isIncognito && (
            <button className="action-btn journal" onClick={() => navigate('/journal')}>
              <span className="action-icon">📓</span>
              <span className="action-label">My Journal</span>
              <span className="action-desc">View & generate your daily journal</span>
            </button>
          )}
          <button className="action-btn breathe" onClick={() => navigate('/chat')}>
            <span className="action-icon">🧘</span>
            <span className="action-label">Breathing Exercise</span>
            <span className="action-desc">Calm down with guided breathing</span>
          </button>
        </div>
      </div>

      <div className="tip-card">
        <h3>💡 Wellness Tip</h3>
        <p>{tip}</p>
      </div>
    </div>
  );
}
