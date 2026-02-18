'use client';

import { useEffect, useState } from 'react';

/**
 * Animated Health Score Dial (0–10).
 * Premium glassmorphic card with glow ring and animated fill.
 *
 * @param {{ score: number, verdict: string }} props
 */
export default function HealthScoreDial({ score = 0, verdict = '' }) {
    const [animatedScore, setAnimatedScore] = useState(0);

    // Animate score on mount/change
    useEffect(() => {
        const duration = 1500;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * score;
            setAnimatedScore(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [score]);

    // Determine color based on score
    const getColor = (s) => {
        if (s <= 2) return '#EF4444';      // Red — Very Poor
        if (s <= 4) return '#F97316';      // Orange — Poor
        if (s <= 6) return '#F59E0B';      // Amber — Moderate
        if (s <= 8) return '#10B981';      // Green — Good
        return '#059669';                  // Emerald — Excellent
    };

    const color = getColor(animatedScore);
    const percentage = (animatedScore / 10) * 100;
    const circumference = 2 * Math.PI * 54;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="health-dial-card">
            <div className="health-dial">
                {/* Glow ring behind dial */}
                <div
                    className="dial-glow"
                    style={{ background: color }}
                />
                <svg viewBox="0 0 120 120" className="dial-svg">
                    {/* Background circle */}
                    <circle
                        cx="60" cy="60" r="54"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="8"
                    />
                    {/* Animated foreground arc */}
                    <circle
                        cx="60" cy="60" r="54"
                        fill="none"
                        stroke={color}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        transform="rotate(-90 60 60)"
                        style={{ transition: 'stroke 0.5s ease' }}
                    />
                </svg>
                <div className="dial-content">
                    <span className="dial-score" style={{ color }}>
                        {animatedScore.toFixed(1)}
                    </span>
                    <span className="dial-max">/10</span>
                    <span className="dial-verdict" style={{ color }}>
                        {verdict}
                    </span>
                </div>
            </div>
        </div>
    );
}
