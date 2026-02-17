'use client';

import { useState, useCallback } from 'react';
import { analyzeImage, localizeReport, generateVoice } from '@/lib/api';

/**
 * Custom hook for the full analysis pipeline.
 * Manages state through: idle → analyzing → results / error
 */
export function useAnalysis() {
    const [status, setStatus] = useState('idle'); // idle | extracting | reasoning | translating | done | error
    const [results, setResults] = useState(null);
    const [localizedResults, setLocalizedResults] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [error, setError] = useState(null);

    const analyze = useCallback(async (base64Image, profile) => {
        try {
            setError(null);
            setResults(null);
            setLocalizedResults(null);
            setAudioUrl(null);

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
            setStatus('translating');
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

    const speak = useCallback(async (text, language) => {
        try {
            const url = await generateVoice(text, language);
            setAudioUrl(url);
            return url;
        } catch (err) {
            setError('Voice generation failed');
            return null;
        }
    }, []);

    const reset = useCallback(() => {
        setStatus('idle');
        setResults(null);
        setLocalizedResults(null);
        setAudioUrl(null);
        setError(null);
    }, []);

    return {
        status,
        results,
        localizedResults,
        audioUrl,
        error,
        analyze,
        localize,
        speak,
        reset
    };
}
