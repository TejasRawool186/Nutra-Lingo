'use client';

import { useState, useCallback } from 'react';
import { analyzeMeal, localizeReport } from '@/lib/api';

/**
 * Custom hook for Gemini-powered meal/dish photo analysis.
 * Manages state through: idle → analyzing → done / error
 */
export function useMealAnalysis() {
    const [status, setStatus] = useState('idle');
    const [mealResults, setMealResults] = useState(null);
    const [localizedMealResults, setLocalizedMealResults] = useState(null);
    const [error, setError] = useState(null);

    const analyze = useCallback(async (base64Image) => {
        try {
            setError(null);
            setMealResults(null);
            setLocalizedMealResults(null);
            setStatus('analyzing');

            const result = await analyzeMeal(base64Image);
            setMealResults(result);
            setStatus('done');

            return result;
        } catch (err) {
            setError(err.message);
            setStatus('error');
            return null;
        }
    }, []);

    const localize = useCallback(async (mealReport, targetLanguage) => {
        try {
            // If English, clear localized and return
            if (targetLanguage === 'en') {
                setLocalizedMealResults(null);
                return;
            }

            setStatus('localizing');
            const result = await localizeReport(mealReport, targetLanguage, null, 'meal');
            setLocalizedMealResults(result.localizedReport);
            setStatus('done');
        } catch (err) {
            console.error('Meal localization error:', err);
            setStatus('done');
        }
    }, []);

    const reset = useCallback(() => {
        setStatus('idle');
        setMealResults(null);
        setLocalizedMealResults(null);
        setError(null);
    }, []);

    return {
        status,
        mealResults,
        localizedMealResults,
        error,
        analyze,
        localize,
        reset
    };
}
