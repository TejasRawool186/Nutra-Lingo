const logger = require('../utils/logger');

/**
 * 🔹 Lingo.dev Localization Service.
 * Localizes health report content preserving medical tone,
 * cultural context, and literacy adaptation.
 *
 * Uses Lingo.dev API to translate structured health data
 * into the user's native language.
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
            languageName: 'English'
        };
    }

    try {
        // Prepare content for Lingo.dev translation
        // We translate the user-facing text fields while preserving structure
        const textsToTranslate = {
            verdict: healthReport.verdict,
            summary: healthReport.summary,
            warnings: healthReport.warnings.map(w => ({
                ingredient: w.ingredient,
                risk: w.risk
            }))
        };

        // --- Lingo.dev API Integration ---
        // TODO: Replace with actual Lingo.dev SDK call when API key is configured
        // For now, using a placeholder that shows the integration point
        //
        // Expected Lingo.dev usage:
        // const { LingoDev } = require('lingo.dev');
        // const lingo = new LingoDev({ apiKey: process.env.LINGO_API_KEY });
        // const translated = await lingo.translate({
        //   content: textsToTranslate,
        //   from: 'en',
        //   to: targetLanguage,
        //   context: 'medical nutrition analysis',
        //   preserveTerms: ['mg', 'g', 'kcal', 'DV', '%'],
        //   tone: 'informative',
        //   literacyLevel: 'general'
        // });

        // Placeholder: actual Lingo.dev integration will be implemented on Day 4
        const localizedReport = {
            score: healthReport.score,
            verdict: `[${targetLanguage}] ${healthReport.verdict}`,
            warnings: healthReport.warnings.map(w => ({
                ...w,
                ingredient: `[${targetLanguage}] ${w.ingredient}`,
                risk: `[${targetLanguage}] ${w.risk}`
            })),
            summary: `[${targetLanguage}] ${healthReport.summary}`
        };

        const languageNames = {
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
            ko: 'Korean'
        };

        const elapsed = Date.now() - startTime;
        logger.info('Localization complete', { elapsed: `${elapsed}ms`, targetLanguage });

        return {
            localizedReport,
            language: targetLanguage,
            languageName: languageNames[targetLanguage] || targetLanguage
        };
    } catch (error) {
        logger.error('Localization failed', { error: error.message, targetLanguage });
        throw Object.assign(new Error('Translation service unavailable. Showing results in English.'), {
            statusCode: 500,
            code: 'LOCALIZATION_ERROR'
        });
    }
}

module.exports = { localizeReport };
