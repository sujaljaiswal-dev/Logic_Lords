import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import BreathingCircle from '../components/BreathingCircle/BreathingCircle';
import './StressRelief.css';

const VIDEOS = [
    { id: 'EzTPScxdUgc', title: 'DESI TINDER IN REAL LIFE | LAKSHAY CHAUDHARY', description: 'Roasting & Comedy', type: 'Comedy', duration: '15 min' },
    { id: 'OGXxjgv2MFM', title: 'VADAPAV GIRL CHEATED ON HER HUSBAND? | LAKSHAY CHAUDHARY', description: 'Roasting & Comedy', type: 'Comedy', duration: '14 min' },
    { id: '0mjtXQB31UE', title: 'THE 50 SHOW ROAST : 50 CONTESTANTS, 0 LOGIC | LAKSHAY', description: 'Laugh away your stress', type: 'funny', duration: '11 min' },
    { id: 'JITySGQgqY4', title: 'Golmaal | Pranit More | Stand-up Comedy', description: 'Standup Comedy', type: 'relaxation', duration: '60 min' },
    { id: 'hVQP3RwDI2I', title: 'Ashleel Show EP8 | Pranit More | Stand-up Comedy', description: 'Standup Comedy', type: 'funny', duration: '50 min' },
    { id: '0ZslnSXuYto', title: 'Lagnacha Shot | Pranit More | Marathi Stand-Up Comedy', description: 'Standup Comedy', type: 'funny', duration: '50 min' },
];

const EXERCISES = [
    { name: 'Box Breathing', steps: ['Inhale for 4 counts', 'Hold for 4 counts', 'Exhale for 4 counts', 'Hold for 4 counts', 'Repeat 5 times'], benefits: 'Calms nervous system, reduces anxiety' },
    { name: '4-7-8 Breathing', steps: ['Inhale for 4 counts', 'Hold for 7 counts', 'Exhale for 8 counts', 'Repeat 4 times'], benefits: 'Promotes deep relaxation and sleep' },
    { name: 'Deep Belly Breathing', steps: ['Sit comfortably', 'Place hand on belly', 'Breathe in slowly through nose', 'Feel belly expand (not chest)', 'Exhale slowly through mouth', 'Repeat 5–10 times'], benefits: 'Reduces stress and improves oxygen flow' },
];

const TYPE_COLOR = { breathing: '#4CAF50', meditation: '#2196F3', funny: '#FF9800', relaxation: '#9C27B0', Comedy: '#e91e63', default: '#666' };
const TYPE_ICON = { breathing: '🫁', meditation: '🧘', funny: '😂', relaxation: '🌸', Comedy: '🎭' };

export default function StressRelief() {
    const { isIncognito } = useAuth();
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [activeTab, setActiveTab] = useState('videos');
    const [selectedEx, setSelectedEx] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const [timerCount, setTimerCount] = useState(0);
    const timerRef = React.useRef(null);

    React.useEffect(() => {
        if (timerActive) {
            timerRef.current = setInterval(() => setTimerCount(c => c + 1), 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [timerActive]);

    const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    const handleExSelect = (i) => {
        setSelectedEx(i);
        setTimerActive(false);
        setTimerCount(0);
    };

    return (
        <div className={`stress-relief-page ${isIncognito ? 'incognito' : ''}`}>
            <div className="stress-relief-header">
                <h1>🧘 Stress Relief</h1>
                <p>Take a break, breathe, laugh, and relax. You deserve it 💚</p>
            </div>

            {isIncognito && <div className="incognito-notice">🕵️ <span>You're in Incognito Mode</span></div>}

            {/* Tabs */}
            <div className="tab-navigation">
                <button className={`tab-btn ${activeTab === 'videos' ? 'active' : ''}`} onClick={() => setActiveTab('videos')}>
                    ▶️ Videos
                </button>
                <button className={`tab-btn ${activeTab === 'exercises' ? 'active' : ''}`} onClick={() => setActiveTab('exercises')}>
                    🫁 Breathing Exercises
                </button>
            </div>

            {/* Videos tab */}
            {activeTab === 'videos' && (
                <div className="videos-container">
                    {selectedVideo ? (
                        <div className="video-player-container">
                            <button className="back-btn" onClick={() => setSelectedVideo(null)}>← Back to Videos</button>
                            <div className="video-player">
                                <iframe width="100%" height="480"
                                    src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                                    title={selectedVideo.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen />
                            </div>
                            <div className="video-info">
                                <h2>{selectedVideo.title}</h2>
                                <p>{selectedVideo.description}</p>
                                <div className="video-details">
                                    <span className="tag" style={{ background: TYPE_COLOR[selectedVideo.type] || TYPE_COLOR.default }}>
                                        {TYPE_ICON[selectedVideo.type] || '▶️'} {selectedVideo.type}
                                    </span>
                                    <span className="duration">⏱️ {selectedVideo.duration}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="videos-grid">
                            {VIDEOS.map((v, i) => (
                                <div key={i} className="video-card" onClick={() => setSelectedVideo(v)}>
                                    <div className="video-thumbnail">
                                        <img src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`} alt={v.title} loading="lazy" />
                                        <div className="play-overlay">
                                            <div className="play-button">▶</div>
                                        </div>
                                    </div>
                                    <div className="video-card-info">
                                        <h3>{v.title}</h3>
                                        <p>{v.description}</p>
                                        <div className="card-footer">
                                            <span className="tag" style={{ background: TYPE_COLOR[v.type] || TYPE_COLOR.default }}>
                                                {TYPE_ICON[v.type] || '▶️'} {v.type}
                                            </span>
                                            <span className="duration">{v.duration}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Breathing exercises tab */}
            {activeTab === 'exercises' && (
                <div className="exercises-container">
                    <div className="exercises-grid">
                        {/* Selector */}
                        <div className="exercise-selector">
                            <h3>Choose Exercise</h3>
                            {EXERCISES.map((ex, i) => (
                                <button key={i}
                                    className={`exercise-btn ${selectedEx === i ? 'active' : ''}`}
                                    onClick={() => handleExSelect(i)}>
                                    <span className="exercise-name">{ex.name}</span>
                                    <span className="exercise-arrow">→</span>
                                </button>
                            ))}
                        </div>

                        {/* Detail + animated breathing circle */}
                        <div className="exercise-details">
                            <div className="exercise-card">
                                <h2>🫁 {EXERCISES[selectedEx].name}</h2>

                                {/* ANIMATED BREATHING CIRCLE */}
                                <div className="breathing-guide-section">
                                    <BreathingCircle
                                        exerciseName={EXERCISES[selectedEx].name}
                                        isActive={timerActive}
                                    />
                                </div>

                                <div className="exercise-controls">
                                    <div className="timer-display">
                                        <span className="time">{formatTime(timerCount)}</span>
                                    </div>
                                    <div className="timer-controls">
                                        <button className={`timer-btn ${timerActive ? 'active' : ''}`}
                                            onClick={() => setTimerActive(t => !t)}>
                                            {timerActive ? '⏸️ Pause' : '▶️ Start'}
                                        </button>
                                        <button className="timer-btn reset" onClick={() => { setTimerActive(false); setTimerCount(0); }}>
                                            🔄 Reset
                                        </button>
                                    </div>
                                </div>

                                <div className="steps-section">
                                    <h4>Steps:</h4>
                                    <ol className="steps-list">
                                        {EXERCISES[selectedEx].steps.map((s, i) => <li key={i}>{s}</li>)}
                                    </ol>
                                </div>

                                <div className="benefits-section">
                                    <h4>Benefits:</h4>
                                    <p className="benefits-text">✨ {EXERCISES[selectedEx].benefits}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick tips */}
            <div className="quick-tips-section">
                <h3>💚 Quick Stress Relief Tips</h3>
                <div className="tips-row">
                    {[['💧', 'Drink Water', 'Stay hydrated to reduce anxiety'],
                    ['🚶', 'Take a Walk', 'Fresh air and movement help'],
                    ['🎵', 'Listen to Music', 'Calming music reduces stress'],
                    ['😴', 'Rest', 'Give yourself permission to relax']].map(([icon, title, desc], i) => (
                        <div key={i} className="tip-card" style={{ animationDelay: `${i * 0.08}s` }}>
                            <span className="tip-icon">{icon}</span>
                            <h4>{title}</h4>
                            <p>{desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
