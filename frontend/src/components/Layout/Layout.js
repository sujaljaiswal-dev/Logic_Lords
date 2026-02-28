import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

export default function Layout() {
  const { logout, isIncognito, toggleIncognito, toggleSlowMode, manualSlowMode } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside className={`sidebar ${isIncognito ? 'incognito' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">🌿</div>
          <div>
            <h2>ManoRakshak</h2>
            {isIncognito && <span className="incognito-badge">Incognito</span>}
          </div>
        </div>

        <ul className="nav-links">
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="nav-icon">🏠</span> Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/chat" className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="nav-icon">💬</span> Chat
            </NavLink>
          </li>
          <li>
            <NavLink to="/journal" className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="nav-icon">📓</span> Journal
            </NavLink>
          </li>
        </ul>

        <div className="sidebar-bottom">
          <button
            className={`incognito-toggle ${isIncognito ? 'active' : ''}`}
            onClick={toggleIncognito}
          >
            <span>🕵️</span>
            Incognito Mode
            <div className={`toggle-switch ${isIncognito ? 'on' : ''}`}>
              <div className="toggle-knob" />
            </div>
          </button>
          <button
            className={`incognito-toggle ${manualSlowMode ? 'active' : ''}`}
            onClick={toggleSlowMode}
            title="Enable Data Saver Mode to disable voice and camera features"
          >
            <span>📶</span>
            Data Saver Mode
            <div className={`toggle-switch ${manualSlowMode ? 'on' : ''}`}>
              <div className="toggle-knob" />
            </div>
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      <main className={`main-content ${isIncognito ? 'incognito' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}
