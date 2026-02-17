'use client';

import { useRef, useEffect, useState } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { compressImage, validateImageFile } from '@/lib/imageUtils';
import { useLocale } from '@/context/LocaleContext';

/**
 * Camera Capture + Image Upload component.
 * Mobile-first UI for capturing food label images.
 *
 * @param {{ onCapture: (base64: string) => void }} props
 */
export default function CameraCapture({ onCapture }) {
    const { videoRef, isOpen, error, openCamera, capture, closeCamera, hasCamera } = useCamera();
    const fileInputRef = useRef(null);
    const { t } = useLocale();
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        return () => closeCamera();
    }, [closeCamera]);

    const handleCapture = () => {
        const base64 = capture();
        if (base64) {
            setPreview(base64);
            closeCamera();
            onCapture(base64);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validation = validateImageFile(file);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        try {
            const base64 = await compressImage(file);
            setPreview(base64);
            onCapture(base64);
        } catch {
            alert('Failed to process image. Please try again.');
        }
    };

    const handleRetake = () => {
        setPreview(null);
    };

    return (
        <div className="camera-container">
            {/* Preview Mode */}
            {preview && (
                <div className="preview-wrapper">
                    <img src={preview} alt="Captured food label" className="preview-image" />
                    <button onClick={handleRetake} className="btn-secondary">
                        {t('common.retry', 'Retake')}
                    </button>
                </div>
            )}

            {/* Camera Mode */}
            {isOpen && !preview && (
                <div className="camera-viewfinder">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="camera-video"
                    />
                    <div className="camera-overlay">
                        <div className="scan-frame" />
                    </div>
                    <div className="camera-controls">
                        <button onClick={closeCamera} className="btn-cancel">✕</button>
                        <button onClick={handleCapture} className="btn-shutter">
                            <div className="shutter-inner" />
                        </button>
                        <div className="btn-placeholder" />
                    </div>
                </div>
            )}

            {/* Idle Mode — Show buttons */}
            {!isOpen && !preview && (
                <div className="capture-buttons">
                    {hasCamera && (
                        <button onClick={openCamera} className="btn-primary btn-large">
                            <span className="btn-icon">📸</span>
                            {t('scan.cameraButton', 'Open Camera')}
                        </button>
                    )}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-secondary btn-large"
                    >
                        <span className="btn-icon">🖼️</span>
                        {t('scan.uploadButton', 'Upload Image')}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="camera-error">
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
}
