'use client';

import { useState, useRef, useCallback } from 'react';

/**
 * Custom hook for Camera API access.
 * Supports live camera capture and file upload.
 */
export function useCamera() {
    const [stream, setStream] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState(null);
    const videoRef = useRef(null);

    const openCamera = useCallback(async () => {
        try {
            setError(null);
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Back camera for food labels
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });
            setStream(mediaStream);
            setIsOpen(true);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            setError('Camera access denied. Please allow camera permissions or use image upload.');
            setIsOpen(false);
        }
    }, []);

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
        hasCamera: typeof navigator !== 'undefined' && !!navigator.mediaDevices
    };
}
