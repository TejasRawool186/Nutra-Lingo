const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { validateImage } = require('../validators/imageValidator');
const { validateExtraction } = require('../validators/jsonValidator');
const { compressImage } = require('../utils/imageCompressor');
const { extractFromImage } = require('../services/visionService');
const { analyzeHealth } = require('../services/healthService');
const { detectLanguage } = require('../services/lingoService');

/**
 * POST /api/analyze
 *
 * 🔹 OpenAI Vision + GPT-4o + 🔹 Lingo.dev (language detection)
 *
 * Accepts a food label image + user profile,
 * returns structured extraction + health analysis + detected label language.
 *
 * Body: { image: string (base64), profile: { conditions: string[], language: string } }
 */
router.post('/', async (req, res, next) => {
    try {
        const { image, profile = {} } = req.body;

        // --- 1. Validate image ---
        const imageResult = validateImage(image);
        if (!imageResult.valid) {
            return res.status(422).json({
                error: 'INVALID_IMAGE',
                message: imageResult.error
            });
        }

        // --- 2. Compress image ---
        const { base64 } = await compressImage(imageResult.buffer);

        // --- 3. Extract structured data via OpenAI Vision ---
        const extraction = await extractFromImage(base64);

        // --- 4. Validate extraction ---
        const validation = validateExtraction(extraction);
        if (!validation.valid) {
            return res.status(422).json({
                error: 'LOW_CONFIDENCE',
                message: 'Could not reliably extract label. Please retake photo with better lighting.',
                confidence: validation.confidence,
                validationErrors: validation.errors
            });
        }

        // --- 5. 🔹 Lingo.dev — Detect original label language ---
        let detectedLanguage = 'unknown';
        try {
            const ingredientText = extraction.ingredients?.join(', ') || '';
            if (ingredientText.length > 5) {
                detectedLanguage = await detectLanguage(ingredientText);
            }
        } catch (langError) {
            logger.warn('Language detection skipped', { error: langError.message });
        }

        // --- 6. Health reasoning ---
        const conditions = profile.conditions || ['general'];
        const healthReport = await analyzeHealth(extraction, { conditions });

        // --- 7. Return results ---
        logger.info('Analysis complete', {
            confidence: validation.confidence,
            healthScore: healthReport.score,
            detectedLanguage
        });

        res.json({
            confidence: validation.confidence,
            detectedLanguage,
            extraction,
            healthReport
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
