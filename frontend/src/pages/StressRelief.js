import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './StressRelief.css';

// Breathing exercises and stress relief videos
// You can add more videos by providing YouTube video IDs
const VIDEOS = [
    {
        id: 'EzTPScxdUgc',
        title: 'DESI TINDER IN REAL LIFE (WILD & WEIRD VERSION) | LAKSHAY CHAUDHARY',
        description: 'Roasting & Comedy',
        type: 'Comedy',
        duration: '15 min'
    },
    {
        id: 'OGXxjgv2MFM',
        title: 'VADAPAV GIRL CHEATED ON HER HUSBAND ? (SECOND MARRIAGE DRAMA) | LAKSHAY CHAUDHARY',
        description: 'Roasting & Comedy',
        type: 'Comedy',
        duration: '14 min'
    },
    {
        id: '0mjtXQB31UE',
        title: 'THE 50 SHOW ROAST : 50 CONTESTANTS, 0 LOGIC | LAKSHAY CHAUDHARY',
        description: 'Laugh away your stress',
        type: 'funny',
        duration: '11 min'
    },
    {
        id: 'JITySGQgqY4',
        title: 'Golmaal | Pranit More | Stand-up Comedy | Crowd Work Special',
        description: 'Standup COmedy',
        type: 'relaxation',
        duration: '60 min'
    },
    {
        id: 'hVQP3RwDI2I',
        title: 'Ashleel Show EP8 | Pranit More | Stand-up Comedy | Crowd Work Special',
        description: 'Standup COmedy',
        type: 'funny',
        duration: '50 min'
    },
    {
        id: '0ZslnSXuYto',
        title: 'Lagnacha Shot | Pranit More | Marathi Stand-Up Comedy | Crowd Work Special',
        description: 'Standup COmedy',
        type: 'funny',
        duration: '50 min'
    }
];

const BREATHING_EXERCISES = [
    {
        name: 'Box Breathing',
        steps: [
            'Inhale for 4 counts',
            'Hold for 4 counts',
            'Exhale for 4 counts',
            'Hold for 4 counts',
            'Repeat 5 times'
        ],
        benefits: 'Calms nervous system, reduces anxiety'
    },
    {
        name: '4-7-8 Breathing',
        steps: [
            'Inhale for 4 counts',
            'Hold for 7 counts',
            'Exhale for 8 counts',
            'Repeat 4 times'
        ],
        benefits: 'Promotes deep relaxation and sleep'
    },
    {
        name: 'Deep Belly Breathing',
        steps: [
            'Sit comfortably',
            'Place hand on belly',
            'Breathe in slowly through nose',
            'Feel belly expand (not chest)',
            'Exhale slowly through mouth',
            'Repeat 5-10 times'
        ],
        benefits: 'Reduces stress and improves oxygen flow'
    }
];

export default function StressRelief() {
    const { isIncognito } = useAuth();
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [activeTab, setActiveTab] = useState('videos'); // 'videos' or 'exercises'
    const [selectedExercise, setSelectedExercise] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const [timerCount, setTimerCount] = useState(0);

    // Timer effect for breathing exercises
    React.useEffect(() => {
        if (!timerActive) return;

        const interval = setInterval(() => {
            setTimerCount(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timerActive]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getVideoTypeIcon = (type) => {
        switch (type) {
            case 'breathing': return '🫁';
            case 'meditation': return '🧘';
            case 'funny': return '😂';
            case 'relaxation': return '🌸';
            default: return '▶️';
        }
    };

    const getVideoTypeColor = (type) => {
        switch (type) {
            case 'breathing': return '#4CAF50';
            case 'meditation': return '#2196F3';
            case 'funny': return '#FF9800';
            case 'relaxation': return '#9C27B0';
            default: return '#666';
        }
    };

    return (
        <div className={`stress-relief-page ${isIncognito ? 'incognito' : ''}`}>
            <div className="stress-relief-header">
                <h1>🧘 Stress Relief & Breathing Exercises</h1>
                <p>Take a break, breathe, laugh, and relax. You deserve it! 💚</p>
            </div>

            {isIncognito && (
                <div className="incognito-notice">
                    🕵️ <span>You're in Incognito Mode</span>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="tab-navigation">
                <button
                    className={`tab-btn ${activeTab === 'videos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('videos')}
                >
                    ▶️ Videos
                </button>
                <button
                    className={`tab-btn ${activeTab === 'exercises' ? 'active' : ''}`}
                    onClick={() => setActiveTab('exercises')}
                >
                    🫁 Breathing Exercises
                </button>
            </div>

            {/* Videos Tab */}
            {activeTab === 'videos' && (
                <div className="videos-container">
                    {selectedVideo ? (
                        <div className="video-player-container">
                            <button className="back-btn" onClick={() => setSelectedVideo(null)}>
                                ← Back to Videos
                            </button>
                            <div className="video-player">
                                <iframe
                                    width="100%"
                                    height="500"
                                    src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                                    title={selectedVideo.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                            <div className="video-info">
                                <h2>{selectedVideo.title}</h2>
                                <p>{selectedVideo.description}</p>
                                <div className="video-details">
                                    <span className="tag" style={{ background: getVideoTypeColor(selectedVideo.type) }}>
                                        {getVideoTypeIcon(selectedVideo.type)} {selectedVideo.type}
                                    </span>
                                    <span className="duration">⏱️ {selectedVideo.duration}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="videos-grid">
                            {VIDEOS.map((video, idx) => (
                                <div
                                    key={idx}
                                    className="video-card"
                                    onClick={() => setSelectedVideo(video)}
                                >
                                    <div className="video-thumbnail">
                                        <img
                                            src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                                            alt={video.title}
                                        />
                                        <div className="play-overlay">
                                            <div className="play-button">▶</div>
                                        </div>
                                    </div>
                                    <div className="video-card-info">
                                        <h3>{video.title}</h3>
                                        <p>{video.description}</p>
                                        <div className="card-footer">
                                            <span className="tag" style={{ background: getVideoTypeColor(video.type) }}>
                                                {getVideoTypeIcon(video.type)} {video.type}
                                            </span>
                                            <span className="duration">{video.duration}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Breathing Exercises Tab */}
            {activeTab === 'exercises' && (
                <div className="exercises-container">
                    <div className="exercises-grid">
                        {/* Left: Exercise Selector */}
                        <div className="exercise-selector">
                            <h3>Choose an Exercise</h3>
                            {BREATHING_EXERCISES.map((exercise, idx) => (
                                <button
                                    key={idx}
                                    className={`exercise-btn ${selectedExercise === idx ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedExercise(idx);
                                        setTimerActive(false);
                                        setTimerCount(0);
                                    }}
                                >
                                    <span className="exercise-name">{exercise.name}</span>
                                    <span className="exercise-arrow">→</span>
                                </button>
                            ))}
                        </div>

                        {/* Right: Exercise Details & Timer */}
                        <div className="exercise-details">
                            <div className="exercise-card">
                                <h2>🫁 {BREATHING_EXERCISES[selectedExercise].name}</h2>

                                <div className="steps-section">
                                    <h4>Steps:</h4>
                                    <ol className="steps-list">
                                        {BREATHING_EXERCISES[selectedExercise].steps.map((step, idx) => (
                                            <li key={idx}>{step}</li>
                                        ))}
                                    </ol>
                                </div>

                                <div className="benefits-section">
                                    <h4>Benefits:</h4>
                                    <p className="benefits-text">
                                        ✨ {BREATHING_EXERCISES[selectedExercise].benefits}
                                    </p>
                                </div>

                                <div className="timer-section">
                                    <h4>Timer</h4>
                                    <div className="timer-display">
                                        <span className="time">{formatTime(timerCount)}</span>
                                    </div>
                                    <div className="timer-controls">
                                        <button
                                            className={`timer-btn ${timerActive ? 'active' : ''}`}
                                            onClick={() => setTimerActive(!timerActive)}
                                        >
                                            {timerActive ? '⏸️ Pause' : '▶️ Start'}
                                        </button>
                                        <button
                                            className="timer-btn reset"
                                            onClick={() => {
                                                setTimerActive(false);
                                                setTimerCount(0);
                                            }}
                                        >
                                            🔄 Reset
                                        </button>
                                    </div>
                                </div>

                                <div className="tips-section">
                                    <h4>💡 Tips:</h4>
                                    <ul className="tips-list">
                                        <li>Find a quiet, comfortable place to sit</li>
                                        <li>Close your eyes if it helps you focus</li>
                                        <li>Don't force it - breathe naturally</li>
                                        <li>Practice daily for best results</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Tips */}
            <div className="quick-tips-section">
                <h3>💚 Quick Stress Relief Tips</h3>
                <div className="tips-row">
                    <div className="tip-card">
                        <span className="tip-icon">💧</span>
                        <h4>Drink Water</h4>
                        <p>Stay hydrated to reduce anxiety</p>
                    </div>
                    <div className="tip-card">
                        <span className="tip-icon">🚶</span>
                        <h4>Take a Walk</h4>
                        <p>Fresh air and movement help</p>
                    </div>
                    <div className="tip-card">
                        <span className="tip-icon">🎵</span>
                        <h4>Listen to Music</h4>
                        <p>Calming music reduces stress</p>
                    </div>
                    <div className="tip-card">
                        <span className="tip-icon">😴</span>
                        <h4>Rest</h4>
                        <p>Give yourself permission to relax</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
