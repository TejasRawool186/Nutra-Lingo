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
            cultural_analogy: healthReport.cultural_analogy,
            voice_script: healthReport.voice_script,
        };

        // Add warning texts (ingredient, risk, and type)
        if (healthReport.warnings && healthReport.warnings.length > 0) {
            contentToLocalize.warnings = {};
            healthReport.warnings.forEach((w, i) => {
                contentToLocalize.warnings[`w${i}_ingredient`] = w.ingredient;
                contentToLocalize.warnings[`w${i}_risk`] = w.risk;
                contentToLocalize.warnings[`w${i}_type`] = w.type; // Translate type (e.g. HIGH SODIUM)
            });
        }

        // Add ingredients list
        if (healthReport.ingredients && Array.isArray(healthReport.ingredients)) {
            contentToLocalize.ingredients = {};
            healthReport.ingredients.forEach((ing, i) => {
                contentToLocalize.ingredients[`ing_${i}`] = ing;
            });
        }

        // Add additives list
        if (healthReport.additives && Array.isArray(healthReport.additives)) {
            contentToLocalize.additives = {};
            healthReport.additives.forEach((add, i) => {
                contentToLocalize.additives[`add_${i}`] = add;
            });
        }

        // 🔹 Lingo.dev SDK — localizeObject preserves structure and keys
        const translated = await lingoDotDev.localizeObject(contentToLocalize, {
            sourceLocale: 'en',
            targetLocale: targetLanguage,
        });

        // Reconstruct the localized report
        const localizedReport = {
            score: healthReport.score,
            verdict: translated.verdict || healthReport.verdict,
            summary: translated.summary || healthReport.summary,
            cultural_analogy: translated.cultural_analogy || healthReport.cultural_analogy,
            voice_script: translated.voice_script || healthReport.voice_script,
            warnings: healthReport.warnings.map((w, i) => ({
                type: translated.warnings?.[`w${i}_type`] || w.type,
                ingredient: translated.warnings?.[`w${i}_ingredient`] || w.ingredient,
                risk: translated.warnings?.[`w${i}_risk`] || w.risk,
                severity: w.severity,
            })),
            ingredients: healthReport.ingredients?.map((ing, i) =>
                translated.ingredients?.[`ing_${i}`] || ing
            ),
            additives: healthReport.additives?.map((add, i) =>
                translated.additives?.[`add_${i}`] || add
            ),
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

/**
 * 🔹 Lingo.dev SDK — Translate a single text string.
 * Useful for chat and dynamic UI elements.
 */
async function translateText(text, targetLanguage, sourceLanguage = 'auto') {
    if (!text) return '';
    try {
        // localizedObject wrapper for single string to use same reliable endpoint
        const wrapped = { text };
        const translated = await lingoDotDev.localizeObject(wrapped, {
            sourceLocale: sourceLanguage === 'auto' ? undefined : sourceLanguage,
            targetLocale: targetLanguage,
        });
        return translated.text || text;
    } catch (error) {
        logger.error('Lingo.dev text translation failed', { error: error.message });
        return text; // Fallback to original
    }
}

/**
 * 🔹 Lingo.dev Localization for Meal Analysis.
 * Localizes meal summary and food item names.
 */
async function localizeMealReport(mealReport, targetLanguage) {
    logger.info('Starting Lingo.dev meal localization...', { targetLanguage });
    const startTime = Date.now();

    if (targetLanguage === 'en') {
        return { localizedReport: mealReport, language: 'en' };
    }

    try {
        // Prepare content for Lingo.dev
        // We map food items to keys like "item_0_name" to preserve structure
        const contentToLocalize = {
            mealSummary: mealReport.mealSummary,
        };

        mealReport.foodItems.forEach((item, index) => {
            contentToLocalize[`item_${index}_name`] = item.name;
        });

        const translated = await lingoDotDev.localizeObject(contentToLocalize, {
            sourceLocale: 'en',
            targetLocale: targetLanguage,
        });

        // Reconstruct meal report
        const localizedReport = {
            ...mealReport,
            mealSummary: translated.mealSummary || mealReport.mealSummary,
            foodItems: mealReport.foodItems.map((item, index) => ({
                ...item,
                name: translated[`item_${index}_name`] || item.name,
            })),
        };

        const elapsed = Date.now() - startTime;
        logger.info('Meal localization complete', { elapsed: `${elapsed}ms` });

        return {
            localizedReport,
            language: targetLanguage,
            languageName: LANGUAGE_NAMES[targetLanguage] || targetLanguage,
        };

    } catch (error) {
        logger.error('Meal localization failed', { error: error.message });
        return {
            localizedReport: mealReport,
            language: targetLanguage,
            fallback: true,
            error: 'Translation failed',
        };
    }
}

module.exports = { localizeReport, detectLanguage, translateText, localizeMealReport };
