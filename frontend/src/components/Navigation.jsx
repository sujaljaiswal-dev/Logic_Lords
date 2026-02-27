import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaPlus, FaList, FaStethoscope, FaSignOutAlt, FaBars, FaTimes, FaUser, FaCog } from 'react-icons/fa';
import './Navigation.css';

export default function Navigation({ user, onLogout }) {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/dashboard', icon: FaHome, label: 'Dashboard' },
        { path: '/entry', icon: FaPlus, label: 'New Entry' },
        { path: '/symptoms', icon: FaList, label: 'History' },
        { path: '/doctor-view', icon: FaStethoscope, label: "Doctor's View" }
    ];

    const handleLogout = () => {
        setUserMenuOpen(false);
        onLogout();
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo */}
                <Link to="/dashboard" className="navbar-brand">
                    <div className="navbar-logo">
                        <FaStethoscope />
                    </div>
                    <span>Symptom Mapper</span>
                </Link>

                {/* Desktop Nav Links */}
                <div className="navbar-menu">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`navbar-link ${isActive(link.path) ? 'active' : ''}`}
                            >
                                <Icon />
                                <span>{link.label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Right side - User menu & Mobile toggle */}
                <div className="navbar-right">
                    {/* Desktop User Menu */}
                    <div className="navbar-user-info">
                        <div className="navbar-user-name">
                            {user?.profile?.firstName || 'User'}
                        </div>
                        <div className="navbar-user-role">{user?.role || 'patient'}</div>
                    </div>

                    {/* User menu button */}
                    <div className="navbar-user-menu">
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="navbar-user-btn"
                            title="User menu"
                        >
                            <FaUser />
                        </button>

                        {/* User dropdown menu */}
                        {userMenuOpen && (
                            <div className="navbar-dropdown">
                                <Link
                                    to="/profile"
                                    className="navbar-dropdown-item"
                                    onClick={() => setUserMenuOpen(false)}
                                >
                                    <FaUser />
                                    <span>Profile</span>
                                </Link>
                                <Link
                                    to="/settings"
                                    className="navbar-dropdown-item"
                                    onClick={() => setUserMenuOpen(false)}
                                >
                                    <FaCog />
                                    <span>Settings</span>
                                </Link>
                                <div className="navbar-dropdown-divider" />
                                <button
                                    onClick={handleLogout}
                                    className="navbar-dropdown-item danger"
                                >
                                    <FaSignOutAlt />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className={`navbar-hamburger ${mobileMenuOpen ? 'active' : ''}`}
                        title="Toggle menu"
                    >
                        {mobileMenuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="navbar-mobile-menu active">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`navbar-mobile-menu-item ${isActive(link.path) ? 'active' : ''}`}
                            >
                                <Icon />
                                <span>{link.label}</span>
                            </Link>
                        );
                    })}

                    {/* Mobile User Menu */}
                    <div className="navbar-mobile-user-section">
                        <div className="navbar-mobile-user-info">
                            {user?.profile?.firstName} {user?.profile?.lastName}
                        </div>
                        <div className="navbar-mobile-user-email">{user?.email}</div>
                        <button
                            onClick={handleLogout}
                            className="navbar-mobile-menu-item"
                        >
                            <FaSignOutAlt />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}