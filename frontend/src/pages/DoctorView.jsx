import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { dashboardAPI } from '../utils/api';
import { format } from 'date-fns';
import { FaDownload, FaPlay, FaPause } from 'react-icons/fa';
import './DoctorView.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function DoctorView() {
    const [dashboardData, setDashboardData] = useState(null);
    const [timeLapseData, setTimeLapseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeLapseIndex, setTimeLapseIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (isPlaying && timeLapseData && timeLapseIndex < timeLapseData.frames.length - 1) {
            const timer = setTimeout(() => {
                setTimeLapseIndex(prev => prev + 1);
            }, 1500);
            return () => clearTimeout(timer);
        } else {
            setIsPlaying(false);
        }
    }, [isPlaying, timeLapseIndex, timeLapseData]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [dashboard, timeLapse] = await Promise.all([
                dashboardAPI.get({ days: 90 }),
                dashboardAPI.getTimeLapse({})
            ]);

            if (dashboard.data?.data) {
                setDashboardData(dashboard.data.data);
            }
            if (timeLapse.data?.data) {
                setTimeLapseData(timeLapse.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch dashboard:', err);
            setError(err.response?.data?.error || 'Failed to load doctor dashboard');
            // Set default empty data
            setDashboardData({
                summary: {
                    clinicalSummary: 'Unable to load data',
                    severityTrend: 'N/A',
                    patterns: [],
                    riskFactors: [],
                    recommendations: [],
                    alerts: [],
                    confidenceScore: 0,
                    trends: [],
                    concerns: [],
                    timeline: 'No data available'
                },
                severityTimeline: [],
                symptomFrequency: {},
                totalEntries: 0
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading doctor dashboard...</p>
            </div>
        );
    }

    if (error && !dashboardData) {
        return (
            <div className="error-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: 'white', padding: '32px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                    <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>⚠️ Error Loading Dashboard</h2>
                    <p style={{ color: '#666', marginBottom: '16px' }}>{error}</p>
                    <button
                        onClick={fetchData}
                        style={{ background: '#3b82f6', color: 'white', padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Chart configurations with safe fallbacks
    const severityChartData = {
        labels: (dashboardData?.severityTimeline || [])?.map(s =>
            format(new Date(s.date), 'MMM d')
        ) || ['No data'],
        datasets: [{
            label: 'Severity',
            data: (dashboardData?.severityTimeline || [])?.map(s => s.severity) || [0],
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            fill: true
        }]
    };

    const frequencyChartData = {
        labels: Object.keys(dashboardData?.symptomFrequency || {}) || ['No data'],
        datasets: [{
            label: 'Frequency',
            data: Object.values(dashboardData?.symptomFrequency || {}) || [0],
            backgroundColor: [
                'rgba(59, 130, 246, 0.6)',
                'rgba(16, 185, 129, 0.6)',
                'rgba(245, 158, 11, 0.6)',
                'rgba(239, 68, 68, 0.6)',
                'rgba(168, 85, 247, 0.6)',
            ]
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 10
            }
        }
    };

    return (
        <div className="doctor-view-container">
            <div className="doctor-view-content">
                {/* Header with Export */}
                <div className="doctor-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="doctor-title">Doctor's Dashboard</h1>
                        <p className="doctor-subtitle">5-Second Medical Summary</p>
                    </div>
                    <button className="action-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaDownload />
                        <span>Export PDF</span>
                    </button>
                </div>

                {/* AI Summary Card - The Quick Scan */}
                <div className="ai-summary" style={{ background: 'linear-gradient(135deg, #0066ff 0%, #0052cc 100%)', color: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0, 102, 255, 0.3)', marginBottom: '32px', border: 'none' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>⚡ 5-Second Scan Summary</h2>
                    {dashboardData?.summary ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <h3 style={{ fontWeight: 'bold', fontSize: '18px', opacity: 0.9, marginBottom: '8px' }}>Overview</h3>
                                <p style={{ color: 'rgba(255,255,255,0.9)' }}>{dashboardData.summary?.clinicalSummary || 'No clinical summary available'}</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div>
                                    <h3 style={{ fontWeight: 'bold', opacity: 0.9, marginBottom: '8px' }}>Key Trends</h3>
                                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {(dashboardData.summary?.trends || []).length > 0 ? (
                                            dashboardData.summary.trends.map((trend, idx) => (
                                                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', color: 'rgba(255,255,255,0.9)' }}>
                                                    <span style={{ marginRight: '8px' }}>•</span>
                                                    <span>{trend}</span>
                                                </li>
                                            ))
                                        ) : (
                                            <li style={{ color: 'rgba(255,255,255,0.7)' }}>No trend data available</li>
                                        )}
                                    </ul>
                                </div>

                                <div>
                                    <h3 style={{ fontWeight: 'bold', opacity: 0.9, marginBottom: '8px' }}>Areas of Concern</h3>
                                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {(dashboardData.summary?.concerns || []).length > 0 ? (
                                            dashboardData.summary.concerns.map((concern, idx) => (
                                                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', color: 'rgba(255,255,255,0.9)' }}>
                                                    <span style={{ marginRight: '8px' }}>⚠️</span>
                                                    <span>{concern}</span>
                                                </li>
                                            ))
                                        ) : (
                                            <li style={{ color: 'rgba(255,255,255,0.7)' }}>No concerns identified</li>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '16px', backdropFilter: 'blur(4px)' }}>
                                <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>Overall Progression</h3>
                                <p style={{ color: 'rgba(255,255,255,0.9)' }}>{dashboardData.summary?.timeline || 'No progression data available'}</p>
                            </div>
                        </div>
                    ) : (
                        <p>Insufficient data for AI summary</p>
                    )}
                </div>

                {/* Charts Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
                    {/* Severity Trend */}
                    <div className="chart-container">
                        <h3 className="chart-header">Severity Over Time</h3>
                        <div style={{ height: '256px' }}>
                            <Line data={severityChartData} options={chartOptions} />
                        </div>
                    </div>

                    {/* Symptom Frequency */}
                    <div className="chart-container">
                        <h3 className="chart-header">Symptom Frequency</h3>
                        <div style={{ height: '256px' }}>
                            <Bar data={frequencyChartData} options={{ ...chartOptions, scales: { y: { beginAtZero: true } } }} />
                        </div>
                    </div>
                </div>

                {/* Clinical Recommendations */}
                <div className="recent-symptoms">
                    <h3 className="chart-header">📋 Recommended Next Steps</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div className="recommendation-item" style={{ borderLeftColor: '#3b82f6' }}>
                            <span className="recommendation-icon">🔬</span>
                            <div>
                                <h4 style={{ fontWeight: 'bold', color: '#1a1a1a' }}>Diagnostic Tests</h4>
                                <p className="recommendation-text">Consider ordering baseline labs and imaging based on symptom progression</p>
                            </div>
                        </div>
                        <div className="recommendation-item" style={{ borderLeftColor: '#10b981' }}>
                            <span className="recommendation-icon">💊</span>
                            <div>
                                <h4 style={{ fontWeight: 'bold', color: '#1a1a1a' }}>Treatment Adjustment</h4>
                                <p className="recommendation-text">Review current medications and consider dose adjustments</p>
                            </div>
                        </div>
                        <div className="recommendation-item" style={{ borderLeftColor: '#a855f7' }}>
                            <span className="recommendation-icon">📅</span>
                            <div>
                                <h4 style={{ fontWeight: 'bold', color: '#1a1a1a' }}>Follow-up</h4>
                                <p className="recommendation-text">Schedule follow-up appointment in 2-4 weeks to reassess</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}