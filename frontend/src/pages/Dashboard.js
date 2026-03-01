import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import useAnimatedCounter from '../hooks/useAnimatedCounter';
import './Dashboard.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const TIPS = [
  "Take 5 deep breaths when you feel overwhelmed. Inhale for 4 counts, hold for 4, exhale for 6.",
  "एक छोटा ब्रेक लें। पानी पिएं और खिड़की के बाहर देखें।",
  "Try grounding: Name 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.",
  "Small progress is still progress. Be kind to yourself today.",
];

// Build stress arc path for SVG gauge
function StressGauge({ level }) {
  const maxLevel = 10;
  const pct = level / maxLevel;
  const R = 54, CX = 64, CY = 64;
  const startAngle = -210 * (Math.PI / 180);
  const endAngle = 30 * (Math.PI / 180);
  const totalArc = endAngle - startAngle;

  const polarToXY = (angle) => ({
    x: CX + R * Math.cos(angle),
    y: CY + R * Math.sin(angle),
  });

  const arcEnd = polarToXY(startAngle + totalArc * pct);
  const startPt = polarToXY(startAngle);
  const large = totalArc * pct > Math.PI ? 1 : 0;

  const trackD = `M ${polarToXY(startAngle).x} ${polarToXY(startAngle).y} A ${R} ${R} 0 1 1 ${polarToXY(endAngle).x} ${polarToXY(endAngle).y}`;
  const fillD = pct <= 0 ? '' :
    `M ${startPt.x} ${startPt.y} A ${R} ${R} 0 ${large} 1 ${arcEnd.x} ${arcEnd.y}`;

  const gaugeColor = level <= 3 ? '#10b981' : level <= 6 ? '#f59e0b' : '#f43f5e';

  return (
    <div className="stress-gauge">
      <svg width="128" height="84" viewBox="0 0 128 84">
        <path d={trackD} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" strokeLinecap="round" />
        {fillD && (
          <path d={fillD} fill="none" stroke={gaugeColor} strokeWidth="8"
            strokeLinecap="round"
            style={{ transition: 'all 1.2s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 6px ${gaugeColor})` }} />
        )}
      </svg>
      <div className="gauge-label" style={{ color: gaugeColor }}>
        <span className="gauge-value">{level}</span>
        <span className="gauge-max">/10</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, isIncognito, connectionSpeed } = useAuth();
  const navigate = useNavigate();
  const [journals, setJournals] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [tip] = useState(TIPS[Math.floor(Math.random() * TIPS.length)]);
  const [tipIdx, setTipIdx] = useState(0);

  const stressLevel = user?.stressLevel || 0;
  const journalCount = useAnimatedCounter(journals.length, 1000, mounted);
  const stressCount = useAnimatedCounter(stressLevel, 1200, mounted);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!isIncognito) {
      axios.get(`${API}/journal`).then(r => setJournals(r.data)).catch(() => { });
    }
  }, [isIncognito]);

  // Tip rotator
  useEffect(() => {
    const t = setInterval(() => setTipIdx(i => (i + 1) % TIPS.length), 8000);
    return () => clearInterval(t);
  }, []);

  const todayDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const greetEmoji = hour < 12 ? '☀️' : hour < 17 ? '🌤️' : '🌙';

  return (
    <div className={`dashboard ${isIncognito ? 'incognito' : ''}`}>
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-text">
          <h1 className="greeting-text">{greeting} <span>{greetEmoji}</span></h1>
          <p>{todayDate}</p>
        </div>
      </div>

      {isIncognito && (
        <div className="incognito-notice">
          🕵️ <span>You're in Incognito Mode — nothing is being saved or tracked right now.</span>
        </div>
      )}

      {connectionSpeed === 'very-slow' && (
        <div className="slow-connection-notice">
          ⚠️ <strong>Slow Connection:</strong> Voice chat and camera are disabled to save data.
        </div>
      )}

      {/* Stat cards */}
      {!isIncognito && (
        <div className="stats-grid">
          {/* Stress gauge card */}
          <div className="stat-card stat-stress" style={{ animationDelay: '0s' }}>
            <StressGauge level={stressLevel} />
            <p>Current Stress Level</p>
          </div>

          <div className="stat-card" style={{ animationDelay: '0.08s' }}>
            <span className="stat-icon">📓</span>
            <h3 className="stat-number">{journalCount}</h3>
            <p>Journal Entries</p>
          </div>

          <div className="stat-card" style={{ animationDelay: '0.16s' }}>
            <span className="stat-icon">🌐</span>
            <h3>{user?.languagePreference?.charAt(0).toUpperCase() + user?.languagePreference?.slice(1)}</h3>
            <p>Preferred Language</p>
          </div>

          <div className="stat-card" style={{ animationDelay: '0.24s' }}>
            <span className="stat-icon">🏘️</span>
            <h3>{user?.locality?.charAt(0).toUpperCase() + user?.locality?.slice(1)}</h3>
            <p>Your Area</p>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="quick-actions">
        <h2>What would you like to do?</h2>
        <div className="actions-row">
          <button className="action-btn chat" onClick={() => navigate('/chat')}
            style={{ animationDelay: '0.1s' }}>
            <div className="action-icon-wrap chat-icon">💬</div>
            <span className="action-label">Talk to ManoRakshak</span>
            <span className="action-desc">AI psychiatrist support, anytime</span>
            <div className="action-arrow">→</div>
          </button>

          {!isIncognito && (
            <button className="action-btn journal" onClick={() => navigate('/journal')}
              style={{ animationDelay: '0.2s' }}>
              <div className="action-icon-wrap journal-icon">📓</div>
              <span className="action-label">My Journal</span>
              <span className="action-desc">View & generate your daily journal</span>
              <div className="action-arrow">→</div>
            </button>
          )}

          <button className="action-btn breathe" onClick={() => navigate('/stress-relief')}
            style={{ animationDelay: '0.3s' }}>
            <div className="action-icon-wrap breathe-icon">🧘</div>
            <span className="action-label">Stress Relief</span>
            <span className="action-desc">Videos, breathing exercises & relaxation</span>
            <div className="action-arrow">→</div>
          </button>
        </div>
      </div>

      {/* Rotating tip */}
      <div className="tip-card">
        <h3>💡 Wellness Tip</h3>
        <p key={tipIdx} className="tip-text-animated">{TIPS[tipIdx]}</p>
      </div>
    </div>
  );
}
