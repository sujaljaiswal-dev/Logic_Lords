import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { symptomAPI, dashboardAPI } from '../utils/api';
import { FaPlus, FaChartLine, FaCamera, FaMicrophone } from 'react-icons/fa';
import { format } from 'date-fns';
import PatientRemedies from '../components/PatientRemedies';
import './Dashboard.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function Dashboard({ user }) {
    const [symptoms, setSymptoms] = useState([]);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [symptomsRes, dashboardRes] = await Promise.all([
                symptomAPI.getAll({ limit: 5 }),
                dashboardAPI.get({ days: 30 })
            ]);

            setSymptoms(symptomsRes.data.data);
            setDashboardData(dashboardRes.data.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    // Prepare chart data
    const chartData = {
        labels: dashboardData?.severityTimeline?.map(s =>
            format(new Date(s.date), 'MMM d')
        ) || [],
        datasets: [{
            label: 'Symptom Severity',
            data: dashboardData?.severityTimeline?.map(s => s.severity) || [],
            borderColor: 'rgb(14, 165, 233)',
            backgroundColor: 'rgba(14, 165, 233, 0.1)',
            tension: 0.4
        }]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: 'Severity Trend (Last 30 Days)'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 10,
                title: {
                    display: true,
                    text: 'Severity (1-10)'
                }
            }
        }
    };

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <h1 className="dashboard-title">
                    Welcome back, {user?.profile?.firstName}!
                </h1>
                <p className="dashboard-subtitle">Track and manage your health symptoms</p>
            </div>

            {/* Quick Stats */}
            <div className="dashboard-grid">
                <div className="stat-card">
                    <div className="stat-header">
                        <div>
                            <p className="stat-label">Total Entries</p>
                            <p className="stat-value">
                                {dashboardData?.totalEntries || 0}
                            </p>
                        </div>
                        <div className="stat-icon">
                            <FaChartLine />
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <div>
                            <p className="stat-label">Voice Notes</p>
                            <p className="stat-value">
                                {symptoms.filter(s => s.voiceNote).length}
                            </p>
                        </div>
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)' }}>
                            <FaMicrophone />
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <div>
                            <p className="stat-label">Photos</p>
                            <p className="stat-value">
                                {dashboardData?.photoTimeline?.length || 0}
                            </p>
                        </div>
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}>
                            <FaCamera />
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <div>
                            <p className="stat-label">Trend</p>
                            <p className={`stat-value ${dashboardData?.trends?.trend === 'improving' ? 'positive' :
                                dashboardData?.trends?.trend === 'worsening' ? 'negative' :
                                    ''
                                }`} style={{
                                    color: dashboardData?.trends?.trend === 'improving' ? '#10b981' :
                                        dashboardData?.trends?.trend === 'worsening' ? '#ff6b6b' :
                                            '#f59e0b'
                                }}>
                                {dashboardData?.trends?.trend === 'improving' ? '↓ Better' :
                                    dashboardData?.trends?.trend === 'worsening' ? '↑ Worse' :
                                        '→ Stable'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                {/* Chart */}
                <div className="chart-container" style={{ gridColumn: 'span 2' }}>
                    {dashboardData?.severityTimeline?.length > 0 ? (
                        <Line data={chartData} options={chartOptions} />
                    ) : (
                        <div className="empty-state">
                            <p>No symptom data yet</p>
                            <Link to="/entry" style={{ color: '#0066ff', marginTop: '8px', display: 'inline-block' }}>
                                Create your first entry
                            </Link>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="chart-container">
                    <div className="chart-header" style={{ marginBottom: '16px' }}>Quick Actions</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <Link
                            to="/entry"
                            className="dashboard-action-btn"
                            style={{ justifyContent: 'center' }}
                        >
                            <FaPlus />
                            New Symptom Entry
                        </Link>
                        <Link
                            to="/doctor-view"
                            className="dashboard-action-btn"
                            style={{ background: '#f0f2f5', color: '#0066ff', justifyContent: 'center' }}
                        >
                            View Doctor's Dashboard
                        </Link>
                    </div>

                    {/* AI Summary */}
                    {dashboardData?.summary && (
                        <div style={{ marginTop: '16px', padding: '16px', background: '#e6f0ff', borderRadius: '8px' }}>
                            <h4 style={{ fontWeight: 'bold', color: '#0066ff', marginBottom: '8px' }}>AI Insights</h4>
                            <p style={{ fontSize: '13px', color: '#0052cc' }}>
                                {dashboardData.summary.summary}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Symptoms */}
            <div className="recent-symptoms">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 className="recent-symptoms-title">Recent Symptoms</h3>
                    <Link to="/symptoms" style={{ color: '#0066ff', fontSize: '13px' }}>
                        View All
                    </Link>
                </div>

                {symptoms.length > 0 ? (
                    <div className="symptoms-list">
                        {symptoms.map((symptom) => (
                            <div
                                key={symptom._id}
                                className="symptom-item"
                            >
                                <div className="symptom-icon">📋</div>
                                <div className="symptom-info">
                                    <div className="symptom-name">
                                        {symptom.analysis?.symptomType || 'Symptom'}
                                    </div>
                                    <div className="symptom-time">
                                        {format(new Date(symptom.recordedAt), 'MMM d, yyyy h:mm a')}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    {symptom.analysis?.severity && (
                                        <span className={`symptom-severity ${symptom.analysis.severity <= 3 ? 'low' :
                                            symptom.analysis.severity <= 6 ? 'medium' :
                                                'high'
                                            }`}>
                                            {symptom.analysis.severity}/10
                                        </span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {symptom.voiceNote && (
                                        <div style={{ width: '32px', height: '32px', background: '#e6f0ff', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0066ff' }}>
                                            <FaMicrophone style={{ fontSize: '14px' }} />
                                        </div>
                                    )}
                                    {symptom.photo && (
                                        <div style={{ width: '32px', height: '32px', background: '#f0e6ff', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
                                            <FaCamera style={{ fontSize: '14px' }} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No symptoms recorded yet</p>
                        <Link to="/entry" style={{ color: '#0066ff', marginTop: '8px', display: 'inline-block' }}>
                            Create your first entry
                        </Link>
                    </div>
                )}
            </div>

            {/* Patient Remedies Section */}
            <div style={{ marginTop: '32px' }}>
                <PatientRemedies symptoms={symptoms} />
            </div>
        </div>
    );
}