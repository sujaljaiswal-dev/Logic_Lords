import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const NAV_ITEMS = [
  { to: '/dashboard', icon: '⬡', label: 'Dashboard' },
  { to: '/chat', icon: '◈', label: 'Chat' },
  { to: '/stress-relief', icon: '◉', label: 'Stress Relief' },
  { to: '/journal', icon: '◻', label: 'Journal' },
];

export default function Layout() {
  const { logout, isIncognito, toggleIncognito, toggleSlowMode, manualSlowMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pageKey, setPageKey] = useState(location.pathname);

  useEffect(() => {
    setPageKey(location.pathname);
  }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="layout">
      {/* ── Sidebar ── */}
      <aside className={`sidebar ${isIncognito ? 'incognito' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">
            <span>🌿</span>
          </div>
          <div className="logo-text">
            <h2>ManoRakshak</h2>
            {isIncognito && <span className="incognito-badge">Incognito</span>}
          </div>
        </div>

        {/* Nav */}
        <ul className="nav-links">
          {NAV_ITEMS.map(({ to, icon, label }, i) => (
            <li key={to} style={{ '--stagger': i }}>
              <NavLink to={to} className={({ isActive }) => isActive ? 'active' : ''}>
                <span className="nav-icon">{icon}</span>
                <span className="nav-label">{label}</span>
                <span className="nav-glow" />
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Bottom controls */}
        <div className="sidebar-bottom">
          <button className={`incognito-toggle ${isIncognito ? 'active' : ''}`} onClick={toggleIncognito}>
            <span>🕵️</span>
            <span className="toggle-label">Incognito</span>
            <div className={`toggle-switch ${isIncognito ? 'on' : ''}`}><div className="toggle-knob" /></div>
          </button>
          <button className={`incognito-toggle ${manualSlowMode ? 'active' : ''}`} onClick={toggleSlowMode}
            title="Enable Data Saver Mode to disable voice and camera features">
            <span>📶</span>
            <span className="toggle-label">Data Saver</span>
            <div className={`toggle-switch ${manualSlowMode ? 'on' : ''}`}><div className="toggle-knob" /></div>
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <span>↩</span> Logout
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className={`main-content ${isIncognito ? 'incognito' : ''}`}
        key={pageKey}>
        <Outlet />
      </main>
    </div>
  );
}
