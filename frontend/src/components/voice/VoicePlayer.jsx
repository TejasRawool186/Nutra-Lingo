'use client';

import { useState, useEffect } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { Volume2, Square } from 'lucide-react';

/**
 * Voice explanation player — uses browser-native SpeechSynthesis.
 * Lucide icons for play/stop states.
 */
export default function VoicePlayer({ text, onSpeak }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const { t, locale } = useLocale();

    useEffect(() => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            setIsSupported(false);
        }

        return () => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const handlePlay = () => {
        if (!text) return;

        if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = locale;
        utterance.rate = 0.9;
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const matchingVoice = voices.find(v => v.lang.startsWith(locale));
        if (matchingVoice) {
            utterance.voice = matchingVoice;
        }

        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);

        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
    };

    if (!isSupported) return null;

    return (
        <div className="voice-player">
            <button
                onClick={handlePlay}
                disabled={!text}
                className={`btn-voice ${isPlaying ? 'playing' : ''}`}
            >
                {isPlaying ? (
                    <>
                        <Square size={16} />
                        {t('results.stopSpeaking', 'Stop')}
                    </>
                ) : (
                    <>
                        <Volume2 size={16} />
                        {t('results.listenExplanation', 'Listen to Explanation')}
                    </>
                )}
            </button>
        </div>
    );
}
