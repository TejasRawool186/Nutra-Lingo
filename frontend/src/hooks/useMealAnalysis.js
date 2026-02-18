'use client';

import { useState, useCallback } from 'react';
import { analyzeMeal } from '@/lib/api';

/**
 * Custom hook for Gemini-powered meal/dish photo analysis.
 * Manages state through: idle → analyzing → done / error
 */
export function useMealAnalysis() {
    const [status, setStatus] = useState('idle');
    const [mealResults, setMealResults] = useState(null);
    const [error, setError] = useState(null);

    const analyze = useCallback(async (base64Image) => {
        try {
            setError(null);
            setMealResults(null);
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

    const reset = useCallback(() => {
        setStatus('idle');
        setMealResults(null);
        setError(null);
    }, []);

    return {
        status,
        mealResults,
        error,
        analyze,
        reset
    };
}
