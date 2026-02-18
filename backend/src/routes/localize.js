const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { localizeReport, localizeMealReport } = require('../services/lingoService');

/**
 * POST /api/localize
 *
 * 🔹 Lingo.dev API
 *
 * Localizes a health report into the user's language.
 * Preserves medical tone, cultural context, and literacy level.
 *
 * Body: { healthReport: object, targetLanguage: string, profile?: object }
 */
router.post('/', async (req, res, next) => {
    try {
        const { healthReport, mealReport, targetLanguage, profile = {}, type = 'health' } = req.body;

        if (!targetLanguage) {
            return res.status(400).json({
                error: 'MISSING_LANGUAGE',
                message: 'Target language is required.'
            });
        }

        let result;

        if (type === 'meal') {
            if (!mealReport) {
                return res.status(400).json({ error: 'MISSING_MEAL_REPORT', message: 'Meal report is required.' });
            }
            result = await localizeMealReport(mealReport, targetLanguage);
        } else {
            // Default to health report
            if (!healthReport) {
                return res.status(400).json({ error: 'MISSING_REPORT', message: 'Health report is required.' });
            }
            result = await localizeReport(healthReport, targetLanguage, profile);
        }

        logger.info('Localization served', {
            language: result.language,
            languageName: result.languageName,
            type
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
