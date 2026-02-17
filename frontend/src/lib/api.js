const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * POST /api/analyze — Send image + profile for analysis.
 * 🔹 Triggers OpenAI Vision + GPT-4o on backend.
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
 * 🔹 Triggers Lingo.dev on backend.
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
 * POST /api/tts — Generate voice explanation.
 * 🔹 Triggers OpenAI TTS on backend.
 * Returns audio blob URL.
 */
export async function generateVoice(text, language) {
    const res = await fetch(`${API_BASE}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language })
    });

    if (!res.ok) {
        throw new Error('Voice generation failed');
    }

    const blob = await res.blob();
    return URL.createObjectURL(blob);
}
