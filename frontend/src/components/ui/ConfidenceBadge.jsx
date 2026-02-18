'use client';

import { CircleDot } from 'lucide-react';

/**
 * Extraction confidence badge with Lucide icon.
 *
 * @param {{ confidence: number }} props — 0 to 1
 */
export default function ConfidenceBadge({ confidence = 0 }) {
    const percentage = Math.round(confidence * 100);

    let color, label;
    if (percentage >= 80) {
        color = 'var(--green-600)';
        label = 'High';
    } else if (percentage >= 50) {
        color = 'var(--yellow-600)';
        label = 'Medium';
    } else {
        color = 'var(--red-600)';
        label = 'Low';
    }

    return (
        <div className="confidence-badge" style={{ borderColor: color }}>
            <CircleDot size={12} color={color} />
            <span className="confidence-text">
                {label} Confidence ({percentage}%)
            </span>
        </div>
    );
}
