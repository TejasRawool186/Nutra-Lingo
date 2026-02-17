const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { localizeReport } = require('../services/lingoService');

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
        const { healthReport, targetLanguage, profile = {} } = req.body;

        if (!healthReport) {
            return res.status(400).json({
                error: 'MISSING_REPORT',
                message: 'Health report is required for localization.'
            });
        }

        if (!targetLanguage) {
            return res.status(400).json({
                error: 'MISSING_LANGUAGE',
                message: 'Target language is required.'
            });
        }

        const result = await localizeReport(healthReport, targetLanguage, profile);

        logger.info('Localization served', {
            language: result.language,
            languageName: result.languageName
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
