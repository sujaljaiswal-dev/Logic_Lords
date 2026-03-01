import React, { useEffect, useRef, useState } from 'react';
import './BreathingCircle.css';

const PHASES = {
    'Box Breathing': [
        { label: 'Inhale', duration: 4, color: '#06b6d4' },
        { label: 'Hold', duration: 4, color: '#7c3aed' },
        { label: 'Exhale', duration: 4, color: '#10b981' },
        { label: 'Hold', duration: 4, color: '#f59e0b' },
    ],
    '4-7-8 Breathing': [
        { label: 'Inhale', duration: 4, color: '#06b6d4' },
        { label: 'Hold', duration: 7, color: '#7c3aed' },
        { label: 'Exhale', duration: 8, color: '#10b981' },
    ],
    'Deep Belly Breathing': [
        { label: 'Inhale', duration: 5, color: '#06b6d4' },
        { label: 'Exhale', duration: 6, color: '#10b981' },
    ],
};

export default function BreathingCircle({ exerciseName, isActive }) {
    const phases = PHASES[exerciseName] || PHASES['Box Breathing'];
    const [phaseIdx, setPhaseIdx] = useState(0);
    const [tick, setTick] = useState(0);
    const intervalRef = useRef(null);
    const tickRef = useRef(0);
    const phaseIdxRef = useRef(0);

    const currentPhase = phases[phaseIdx];
    const progress = Math.min(tick / currentPhase.duration, 1);

    // Scale: inhale → 1, hold → stays, exhale → 0
    const isExpand = currentPhase.label === 'Inhale';
    const isShrink = currentPhase.label === 'Exhale';
    const circleScale = isExpand ? 0.55 + progress * 0.45
        : isShrink ? 1 - progress * 0.45
            : /* hold */  currentPhase.label === 'Hold' && phaseIdx > 0
                ? (phases[phaseIdx - 1]?.label === 'Inhale' ? 1 : 0.55)
                : 0.55;

    useEffect(() => {
        if (!isActive) {
            clearInterval(intervalRef.current);
            tickRef.current = 0;
            phaseIdxRef.current = 0;
            setTick(0);
            setPhaseIdx(0);
            return;
        }

        intervalRef.current = setInterval(() => {
            tickRef.current += 1;
            const ph = phases[phaseIdxRef.current];
            if (tickRef.current >= ph.duration) {
                tickRef.current = 0;
                phaseIdxRef.current = (phaseIdxRef.current + 1) % phases.length;
                setPhaseIdx(phaseIdxRef.current);
            }
            setTick(tickRef.current);
        }, 1000);

        return () => clearInterval(intervalRef.current);
    }, [isActive, exerciseName]);

    const SIZE = 220;
    const R = 90;
    const CX = SIZE / 2;
    const CY = SIZE / 2;
    const circumference = 2 * Math.PI * R;
    const dashOffset = circumference * (1 - progress);

    return (
        <div className="breathing-circle-wrap">
            <div className="breathing-circle-container">
                {/* SVG arc progress ring */}
                <svg width={SIZE} height={SIZE} className="breathing-svg">
                    {/* Background ring */}
                    <circle cx={CX} cy={CY} r={R} fill="none"
                        stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                    {/* Progress ring */}
                    <circle cx={CX} cy={CY} r={R} fill="none"
                        stroke={currentPhase.color}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        style={{
                            transform: 'rotate(-90deg)',
                            transformOrigin: 'center',
                            transition: 'stroke-dashoffset 0.9s linear, stroke 0.6s ease',
                        }}
                    />
                </svg>

                {/* Expanding / contracting disc */}
                <div
                    className="breathing-disc"
                    style={{
                        transform: `scale(${circleScale})`,
                        background: `radial-gradient(circle, ${currentPhase.color}55 0%, ${currentPhase.color}22 60%, transparent 100%)`,
                        boxShadow: `0 0 ${30 + circleScale * 40}px ${currentPhase.color}55, inset 0 0 20px ${currentPhase.color}22`,
                        borderColor: `${currentPhase.color}66`,
                        transition: isActive
                            ? `transform ${currentPhase.duration * 0.95}s ease-in-out, background 0.6s ease, box-shadow 0.6s ease`
                            : 'none',
                    }}
                />

                {/* Center text */}
                <div className="breathing-text">
                    <span className="breathing-phase" style={{ color: currentPhase.color }}>
                        {isActive ? currentPhase.label : 'Ready'}
                    </span>
                    <span className="breathing-count">
                        {isActive ? `${Math.floor(currentPhase.duration - tick)}s` : ''}
                    </span>
                </div>
            </div>

            {/* Phase indicators */}
            <div className="breathing-phases-row">
                {phases.map((ph, i) => (
                    <div key={i} className={`phase-pip ${i === phaseIdx && isActive ? 'active' : ''}`}
                        style={{ '--pip-color': ph.color }}>
                        <span>{ph.label}</span>
                        <span className="phase-dur">{ph.duration}s</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
