const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { validateImage } = require('../validators/imageValidator');
const { validateExtraction } = require('../validators/jsonValidator');
const { compressImage } = require('../utils/imageCompressor');
const { extractFromImage } = require('../services/visionService');
const { analyzeHealth } = require('../services/healthService');

/**
 * POST /api/analyze
 *
 * 🔹 OpenAI Vision + GPT-4o
 *
 * Accepts a food label image + user profile,
 * returns structured extraction + health analysis.
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

        // --- 5. Health reasoning ---
        const conditions = profile.conditions || ['general'];
        const healthReport = await analyzeHealth(extraction, { conditions });

        // --- 6. Return results ---
        logger.info('Analysis complete', {
            confidence: validation.confidence,
            healthScore: healthReport.score
        });

        res.json({
            confidence: validation.confidence,
            extraction,
            healthReport
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
