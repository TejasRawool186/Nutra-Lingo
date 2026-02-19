'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for Camera API access.
 * Supports live camera capture and file upload.
 */
export function useCamera() {
    const [stream, setStream] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState(null);
    const [hasCamera, setHasCamera] = useState(false);
    const [supportsStream, setSupportsStream] = useState(false);
    const videoRef = useRef(null);

    useEffect(() => {
        setHasCamera(true); // Always show camera button
        setSupportsStream(!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
    }, []);

    const openCamera = useCallback(async () => {
        try {
            setError(null);

            // Check for secure context requirement
            if (!navigator.mediaDevices?.getUserMedia) {
                throw new Error('Camera requires HTTPS or localhost. If testing on mobile via IP, please check Chrome flags to enable insecure origins.');
            }

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true
            });
            setStream(mediaStream);
            setIsOpen(true);
        } catch (err) {
            console.error('Camera Error:', err);
            setError(err.message || 'Camera access denied. Please allow permissions.');
            setIsOpen(false);
        }
    }, []);

    // Ensure video stream is attached when stream becomes available
    useEffect(() => {
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream, isOpen]);

    const capture = useCallback(() => {
        if (!videoRef.current) return null;

        const canvas = document.createElement('canvas');
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        const base64 = canvas.toDataURL('image/jpeg', 0.85);
        return base64;
    }, []);

    const closeCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        setStream(null);
        setIsOpen(false);
    }, [stream]);

    return {
        videoRef,
        isOpen,
        error,
        openCamera,
        capture,
        closeCamera,
        hasCamera,
        supportsStream
    };
}
