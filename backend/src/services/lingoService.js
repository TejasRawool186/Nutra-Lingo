const { LingoDotDevEngine } = require('lingo.dev/sdk');
const logger = require('../utils/logger');

// 🔹 Lingo.dev SDK — Initialize the localization engine
const lingoDotDev = new LingoDotDevEngine({
    apiKey: process.env.LINGO_API_KEY,
});

const LANGUAGE_NAMES = {
    en: 'English',
    hi: 'Hindi',
    es: 'Spanish',
    mr: 'Marathi',
    ta: 'Tamil',
    te: 'Telugu',
    bn: 'Bengali',
    fr: 'French',
    de: 'German',
    ja: 'Japanese',
    zh: 'Chinese',
    ar: 'Arabic',
    ko: 'Korean',
};

/**
 * 🔹 Lingo.dev Localization Service.
 * 
 * Uses Lingo.dev SDK to localize health report content at runtime.
 * Preserves medical tone, cultural context, and literacy adaptation
 * through Lingo.dev's AI-powered localization engine.
 *
 * @param {object} healthReport - Health report { score, verdict, warnings[], summary }
 * @param {string} targetLanguage - ISO language code (e.g., "hi", "es")
 * @param {object} profile - User profile for context
 * @returns {Promise<object>} Localized health report
 */
async function localizeReport(healthReport, targetLanguage, profile = {}) {
    logger.info('Starting Lingo.dev localization...', { targetLanguage });
    const startTime = Date.now();

    // If target is English, return as-is
    if (targetLanguage === 'en') {
        return {
            localizedReport: healthReport,
            language: 'en',
            languageName: 'English',
        };
    }

    try {
        // Build the object to localize — only user-facing text fields
        const contentToLocalize = {
            verdict: healthReport.verdict,
            summary: healthReport.summary,
        };

        // Add warning texts
        if (healthReport.warnings && healthReport.warnings.length > 0) {
            contentToLocalize.warnings = {};
            healthReport.warnings.forEach((w, i) => {
                contentToLocalize.warnings[`w${i}_ingredient`] = w.ingredient;
                contentToLocalize.warnings[`w${i}_risk`] = w.risk;
            });
        }

        // 🔹 Lingo.dev SDK — localizeObject preserves structure and keys,
        //    translates only the values with medical/health context awareness
        const translated = await lingoDotDev.localizeObject(contentToLocalize, {
            sourceLocale: 'en',
            targetLocale: targetLanguage,
        });

        // Reconstruct the localized report
        const localizedReport = {
            score: healthReport.score,
            verdict: translated.verdict || healthReport.verdict,
            summary: translated.summary || healthReport.summary,
            warnings: healthReport.warnings.map((w, i) => ({
                type: w.type,
                ingredient: translated.warnings?.[`w${i}_ingredient`] || w.ingredient,
                risk: translated.warnings?.[`w${i}_risk`] || w.risk,
                severity: w.severity,
            })),
        };

        const elapsed = Date.now() - startTime;
        logger.info('Lingo.dev localization complete', {
            elapsed: `${elapsed}ms`,
            targetLanguage,
        });

        return {
            localizedReport,
            language: targetLanguage,
            languageName: LANGUAGE_NAMES[targetLanguage] || targetLanguage,
        };
    } catch (error) {
        logger.error('Lingo.dev localization failed', {
            error: error.message,
            targetLanguage,
        });

        // Fallback: return English report if localization fails
        return {
            localizedReport: healthReport,
            language: targetLanguage,
            languageName: LANGUAGE_NAMES[targetLanguage] || targetLanguage,
            fallback: true,
            error: 'Translation service temporarily unavailable. Showing English.',
        };
    }
}

/**
 * 🔹 Lingo.dev SDK — Detect the language of input text.
 * Useful for identifying the language of a food label.
 *
 * @param {string} text - Text to recognize
 * @returns {Promise<string>} ISO language code
 */
async function detectLanguage(text) {
    try {
        const locale = await lingoDotDev.recognizeLocale(text);
        logger.info('Language detected', { locale });
        return locale;
    } catch (error) {
        logger.warn('Language detection failed', { error: error.message });
        return 'unknown';
    }
}

module.exports = { localizeReport, detectLanguage };
