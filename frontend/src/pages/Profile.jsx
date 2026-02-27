import React, { useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import { FaUser, FaEnvelope, FaClock, FaEdit, FaCamera, FaLock, FaCheckCircle } from 'react-icons/fa';
import './Profile.css';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await authAPI.getMe();
            setUser(response.data.data);
            setFormData(response.data.data);
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const response = await authAPI.updateProfile({
                name: formData.name,
                email: formData.email,
                ...formData
            });

            if (response.data.success) {
                setUser(response.data.data);
                setMessage('Profile updated successfully!');
                setIsEditing(false);
                setTimeout(() => setMessage(null), 3000);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        if (passwordData.new !== passwordData.confirm) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            await authAPI.changePassword({
                currentPassword: passwordData.current,
                newPassword: passwordData.new
            });

            setMessage('Password changed successfully!');
            setPasswordData({ current: '', new: '', confirm: '' });
            setShowPasswordForm(false);
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="profile-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-header-content">
                    <div className="profile-avatar">
                        <div className="avatar-placeholder">
                            <FaUser />
                        </div>
                    </div>
                    <div className="profile-greeting">
                        <h1>Welcome, {user.name}</h1>
                        <p>Manage your account and health information</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            {message && (
                <div className="message-box success-message">
                    <FaCheckCircle />
                    <p>{message}</p>
                </div>
            )}

            {error && (
                <div className="message-box error-message">
                    <p>{error}</p>
                </div>
            )}

            <div className="profile-grid">
                {/* Profile Card */}
                <div className="profile-card">
                    <div className="card-header">
                        <h2>Profile Information</h2>
                        <button
                            className="btn-icon"
                            onClick={() => {
                                setIsEditing(!isEditing);
                                if (isEditing) {
                                    setFormData(user);
                                }
                            }}
                            title="Edit Profile"
                        >
                            <FaEdit />
                        </button>
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleUpdateProfile} className="profile-form">
                            <div className="form-group">
                                <label htmlFor="name">
                                    <FaUser /> Full Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name || ''}
                                    onChange={handleInputChange}
                                    placeholder="Your full name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">
                                    <FaEnvelope /> Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email || ''}
                                    onChange={handleInputChange}
                                    placeholder="your.email@example.com"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="age">Age</label>
                                <input
                                    type="number"
                                    id="age"
                                    name="age"
                                    value={formData.age || ''}
                                    onChange={handleInputChange}
                                    placeholder="Your age"
                                    min="0"
                                    max="150"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="gender">Gender</label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={formData.gender || ''}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone || ''}
                                    onChange={handleInputChange}
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="allergies">Allergies</label>
                                <textarea
                                    id="allergies"
                                    name="allergies"
                                    value={formData.allergies || ''}
                                    onChange={handleInputChange}
                                    placeholder="List any allergies you have"
                                    rows="3"
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label htmlFor="medicalHistory">Medical History</label>
                                <textarea
                                    id="medicalHistory"
                                    name="medicalHistory"
                                    value={formData.medicalHistory || ''}
                                    onChange={handleInputChange}
                                    placeholder="Any past medical conditions or treatments"
                                    rows="3"
                                ></textarea>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData(user);
                                    }}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="profile-info">
                            <div className="info-row">
                                <span className="label"><FaUser /> Name</span>
                                <span className="value">{user.name}</span>
                            </div>

                            <div className="info-row">
                                <span className="label"><FaEnvelope /> Email</span>
                                <span className="value">{user.email}</span>
                            </div>

                            {user.age && (
                                <div className="info-row">
                                    <span className="label">Age</span>
                                    <span className="value">{user.age}</span>
                                </div>
                            )}

                            {user.gender && (
                                <div className="info-row">
                                    <span className="label">Gender</span>
                                    <span className="value">{user.gender}</span>
                                </div>
                            )}

                            {user.phone && (
                                <div className="info-row">
                                    <span className="label">Phone</span>
                                    <span className="value">{user.phone}</span>
                                </div>
                            )}

                            {user.allergies && (
                                <div className="info-row">
                                    <span className="label">Allergies</span>
                                    <span className="value">{user.allergies}</span>
                                </div>
                            )}

                            {user.medicalHistory && (
                                <div className="info-row">
                                    <span className="label">Medical History</span>
                                    <span className="value">{user.medicalHistory}</span>
                                </div>
                            )}

                            <div className="info-row">
                                <span className="label"><FaClock /> Member Since</span>
                                <span className="value">
                                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Security Card */}
                <div className="profile-card">
                    <div className="card-header">
                        <h2>Security</h2>
                    </div>

                    {showPasswordForm ? (
                        <form onSubmit={handleChangePassword} className="profile-form">
                            <div className="form-group">
                                <label htmlFor="current-password">
                                    <FaLock /> Current Password
                                </label>
                                <input
                                    type="password"
                                    id="current-password"
                                    name="current"
                                    value={passwordData.current}
                                    onChange={handlePasswordChange}
                                    placeholder="Enter current password"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="new-password">
                                    <FaLock /> New Password
                                </label>
                                <input
                                    type="password"
                                    id="new-password"
                                    name="new"
                                    value={passwordData.new}
                                    onChange={handlePasswordChange}
                                    placeholder="Enter new password"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirm-password">
                                    <FaLock /> Confirm Password
                                </label>
                                <input
                                    type="password"
                                    id="confirm-password"
                                    name="confirm"
                                    value={passwordData.confirm}
                                    onChange={handlePasswordChange}
                                    placeholder="Confirm new password"
                                    required
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => {
                                        setShowPasswordForm(false);
                                        setPasswordData({ current: '', new: '', confirm: '' });
                                    }}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="security-info">
                            <p className="info-text">Manage your account security and password</p>
                            <button
                                className="btn-change-password"
                                onClick={() => setShowPasswordForm(true)}
                            >
                                <FaLock /> Change Password
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Health Summary Card */}
            <div className="profile-card full-width">
                <h2>Health Summary</h2>
                <div className="health-summary">
                    <div className="summary-item">
                        <span className="label">Allergies</span>
                        <p>{user.allergies || 'No allergies recorded'}</p>
                    </div>
                    <div className="summary-item">
                        <span className="label">Medical History</span>
                        <p>{user.medicalHistory || 'No medical history recorded'}</p>
                    </div>
                    <div className="summary-item">
                        <span className="label">Account Status</span>
                        <p className="status-active">✓ Active</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
