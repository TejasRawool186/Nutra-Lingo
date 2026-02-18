const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * POST /api/analyze — Send image + profile for analysis.
 * 🔹 Triggers PaddleOCR + Groq LLM on backend.
 */
export async function analyzeImage(base64Image, profile) {
    const res = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            image: base64Image,
            profile
        })
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Analysis failed' }));
        throw new Error(error.message || `Analysis failed (${res.status})`);
    }

    return res.json();
}

/**
 * POST /api/localize — Localize health report.
 * 🔹 Triggers Lingo.dev SDK on backend.
 */
export async function localizeReport(healthReport, targetLanguage, profile) {
    const res = await fetch(`${API_BASE}/api/localize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            healthReport,
            targetLanguage,
            profile
        })
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Localization failed' }));
        throw new Error(error.message || `Localization failed (${res.status})`);
    }

    return res.json();
}

/**
 * POST /api/meal — Send dish photo for Gemini meal analysis.
 * 🔹 Triggers Gemini 2.5 Flash on backend.
 */
export async function analyzeMeal(base64Image) {
    const res = await fetch(`${API_BASE}/api/meal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Meal analysis failed' }));
        throw new Error(error.message || `Meal analysis failed (${res.status})`);
    }

    return res.json();
}

/**
 * POST /api/alternatives — Get healthier alternatives for a scanned product.
 * 🔹 Triggers Gemini 2.5 Flash on backend.
 */
export async function getAlternatives(extraction) {
    const res = await fetch(`${API_BASE}/api/alternatives`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extraction })
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Failed to get alternatives' }));
        throw new Error(error.message || `Alternatives failed (${res.status})`);
    }

    return res.json();
}

// TTS is now handled by browser-native SpeechSynthesis API
// No API call needed — see VoicePlayer component
