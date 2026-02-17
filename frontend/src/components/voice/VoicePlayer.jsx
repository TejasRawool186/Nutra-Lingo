'use client';

import { useState, useRef } from 'react';
import { useLocale } from '@/context/LocaleContext';

/**
 * Voice explanation player.
 * Play/replay TTS audio for health report summary.
 *
 * @param {{ audioUrl: string, onGenerate: () => void, isLoading: boolean }} props
 */
export default function VoicePlayer({ audioUrl, onGenerate, isLoading = false }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);
    const { t } = useLocale();

    const handlePlay = () => {
        if (!audioUrl) {
            onGenerate?.();
            return;
        }

        if (audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
    };

    return (
        <div className="voice-player">
            {audioUrl && (
                <audio
                    ref={audioRef}
                    src={audioUrl}
                    onEnded={handleEnded}
                    onPause={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                />
            )}
            <button
                onClick={handlePlay}
                disabled={isLoading}
                className={`btn-voice ${isPlaying ? 'playing' : ''}`}
            >
                {isLoading ? (
                    <span className="voice-loading">🔄 Generating...</span>
                ) : isPlaying ? (
                    <span>🔊 {t('results.replay', 'Playing...')}</span>
                ) : audioUrl ? (
                    <span>🔁 {t('results.replay', 'Replay')}</span>
                ) : (
                    <span>🔊 {t('results.listenExplanation', 'Listen to Explanation')}</span>
                )}
            </button>
        </div>
    );
}
