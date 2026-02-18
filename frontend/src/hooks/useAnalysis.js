'use client';

import { useState, useCallback } from 'react';
import { analyzeImage, localizeReport } from '@/lib/api';

/**
 * Custom hook for the full analysis pipeline.
 * Manages state through: idle → extracting → reasoning → translating → done / error
 *
 * TTS now uses browser-native SpeechSynthesis (no API call needed).
 */
export function useAnalysis() {
    const [status, setStatus] = useState('idle');
    const [results, setResults] = useState(null);
    const [localizedResults, setLocalizedResults] = useState(null);
    const [error, setError] = useState(null);

    const analyze = useCallback(async (base64Image, profile) => {
        try {
            setError(null);
            setResults(null);
            setLocalizedResults(null);

            // Stage 1: Extract + Health Analysis
            setStatus('extracting');
            const analysisResult = await analyzeImage(base64Image, profile);
            setResults(analysisResult);
            setStatus('done');

            return analysisResult;
        } catch (err) {
            setError(err.message);
            setStatus('error');
            return null;
        }
    }, []);

    const localize = useCallback(async (healthReport, targetLanguage, profile) => {
        try {
            setStatus('localizing');
            const localized = await localizeReport(healthReport, targetLanguage, profile);
            setLocalizedResults(localized);
            setStatus('done');
            return localized;
        } catch (err) {
            setError(err.message);
            setStatus('error');
            return null;
        }
    }, []);

    /**
     * Browser-native TTS using Web Speech API.
     * No API key required — runs entirely in-browser.
     */
    const speak = useCallback((text, language = 'en') => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            setError('Speech synthesis not supported in this browser.');
            return;
        }

        // Cancel any in-progress speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        utterance.rate = 0.9;
        utterance.pitch = 1.0;

        // Try to find a matching voice
        const voices = window.speechSynthesis.getVoices();
        const matchingVoice = voices.find(v => v.lang.startsWith(language));
        if (matchingVoice) {
            utterance.voice = matchingVoice;
        }

        window.speechSynthesis.speak(utterance);
        return utterance;
    }, []);

    const reset = useCallback(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setStatus('idle');
        setResults(null);
        setLocalizedResults(null);
        setError(null);
    }, []);

    return {
        status,
        results,
        localizedResults,
        error,
        analyze,
        localize,
        speak,
        reset
    };
}
