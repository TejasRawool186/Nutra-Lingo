'use client';

import { useRef, useEffect, useState } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { compressImage, validateImageFile } from '@/lib/imageUtils';
import { useLocale } from '@/context/LocaleContext';
import { Camera, Upload, RefreshCw, X } from 'lucide-react';

/**
 * Camera Capture + Image Upload component with Lucide icons.
 *
 * @param {{ onCapture: (base64: string) => void }} props
 */
export default function CameraCapture({ onCapture }) {
    const { videoRef, isOpen, error, openCamera, capture, closeCamera, hasCamera, supportsStream } = useCamera();
    const fileInputRef = useRef(null);
    const nativeInputRef = useRef(null);
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

        e.target.value = ''; // Allow re-selecting same file

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
                    <button onClick={handleRetake} className="btn-secondary btn-full" style={{ marginTop: 0 }}>
                        <RefreshCw size={16} />
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
                        <button onClick={closeCamera} className="btn-cancel">
                            <X size={18} />
                        </button>
                        <button onClick={handleCapture} className="btn-shutter">
                            <div className="shutter-inner" />
                        </button>
                        <div className="btn-placeholder" />
                    </div>
                </div>
            )}

            {/* Idle Mode */}
            {!isOpen && !preview && (
                <div className="capture-buttons">
                    {hasCamera && (
                        <button
                            onClick={() => supportsStream ? openCamera() : nativeInputRef.current?.click()}
                            className="btn-primary btn-large"
                        >
                            <Camera size={20} />
                            {t('scan.cameraButton', 'Open Camera')}
                        </button>
                    )}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-secondary btn-large"
                    >
                        <Upload size={20} />
                        {t('scan.uploadButton', 'Upload Image')}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <input
                        ref={nativeInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
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
