'use client';

/**
 * Loading spinner with optional stage message.
 *
 * @param {{ message: string }} props
 */
export default function LoadingSpinner({ message = 'Loading...' }) {
    return (
        <div className="loading-container">
            <div className="spinner">
                <div className="spinner-ring" />
            </div>
            <p className="loading-message">{message}</p>
        </div>
    );
}
