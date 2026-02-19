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
    const [audio, setAudio] = useState(null); // For backend audio fallback

    useEffect(() => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            setIsSupported(false);
            return;
        }
        // ... (existing voice loading logic) ...
        return () => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        };
    }, [audio]);

    const handlePlay = () => {
        if (!text) return;

        if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
            return;
        }

        // Try browser TTS
        if (isSupported) {
            const voices = window.speechSynthesis.getVoices();
            let matchingVoice = voices.find(v => v.lang === locale) ||
                voices.find(v => v.lang.startsWith(locale));

            if (locale === 'hi' && !matchingVoice) matchingVoice = voices.find(v => v.lang.includes('hi'));
            if (locale === 'mr' && !matchingVoice) matchingVoice = voices.find(v => v.lang.includes('mr'));

            if (matchingVoice) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = locale;
                utterance.voice = matchingVoice;
                utterance.rate = 0.9;
                utterance.pitch = 1.0;
                utterance.onend = () => setIsPlaying(false);
                utterance.onerror = (e) => {
                    // Don't log if it was just interrupted/canceled by user
                    if (e.error === 'interrupted' || e.error === 'canceled') {
                        setIsPlaying(false);
                        return;
                    }
                    console.error('Speech synthesis error details:', e.error, e);
                    setIsPlaying(false);
                };
                window.speechSynthesis.speak(utterance);
                setIsPlaying(true);
            } else {
                console.warn(`No voice found for locale: ${locale}`);
                alert(`Sorry, your browser does not support text-to-speech for ${locale.toUpperCase()}.`);
            }
        }
    };

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
