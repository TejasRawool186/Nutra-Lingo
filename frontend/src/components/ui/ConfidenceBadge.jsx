'use client';

/**
 * Extraction confidence badge.
 * Shows how confident the OCR extraction was.
 *
 * @param {{ confidence: number }} props — 0 to 1
 */
export default function ConfidenceBadge({ confidence = 0 }) {
    const percentage = Math.round(confidence * 100);

    let color, label;
    if (percentage >= 80) {
        color = '#059669';
        label = 'High';
    } else if (percentage >= 50) {
        color = '#CA8A04';
        label = 'Medium';
    } else {
        color = '#DC2626';
        label = 'Low';
    }

    return (
        <div className="confidence-badge" style={{ borderColor: color }}>
            <span className="confidence-icon" style={{ color }}>◉</span>
            <span className="confidence-text">
                {label} Confidence ({percentage}%)
            </span>
        </div>
    );
}
