const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { validateImage } = require('../validators/imageValidator');
const { validateExtraction } = require('../validators/jsonValidator');
const { advancedCompress, analyzeImageSuitability } = require('../utils/advancedCompressor');
const { extractFromImage } = require('../services/visionService');
const { analyzeHealth } = require('../services/healthService');
const { detectLanguage } = require('../services/lingoService');
const { performanceMonitor } = require('../utils/performanceMonitor');
const { llmCache } = require('../utils/llmResponseCache');

/**
 * POST /api/analyze
 *
 * 🔹 OpenAI Vision + GPT-4o + 🔹 Lingo.dev (language detection)
 *
 * Accepts a food label image + user profile,
 * returns structured extraction + health analysis + detected label language.
 *
 * Body: { image: string (base64), profile: { conditions: string[], language: string } }
 *
 * 🚀 Performance Optimizations:
 * - Advanced image compression (WebP/JPEG adaptive quality)
 * - LLM response caching for similar nutrition profiles
 * - Image suitability analysis (skip OCR on blurry images early)
 * - Performance metrics tracking
 */
router.post('/', async (req, res, next) => {
    const totalTimer = performanceMonitor.startTimer('api:analyze');
    
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

        // --- 2. Advanced image compression (adaptive quality) ---
        const compressionTimer = performanceMonitor.startTimer('compress:advanced');
        const { base64, metadata: compressionMetadata } = await advancedCompress(
            imageResult.buffer,
            { format: 'auto', qualityLevel: 'medium' }
        );
        compressionTimer();

        // --- 3. Analyze image suitability (early exit for blurry images) ---
        const suitabilityTimer = performanceMonitor.startTimer('image:suitability-check');
        const suitability = await analyzeImageSuitability(imageResult.buffer);
        suitabilityTimer();

        if (!suitability.suitable) {
            logger.warn('Image unsuitable for OCR', suitability);
            return res.status(422).json({
                error: 'IMAGE_QUALITY',
                message: suitability.reason,
                confidence: suitability.confidence
            });
        }

        // --- 4. Extract structured data via OpenAI Vision ---
        const extractionTimer = performanceMonitor.startTimer('vision:extraction');
        const extraction = await extractFromImage(base64);
        extractionTimer();

        // --- 5. Validate extraction ---
        const validation = validateExtraction(extraction);
        if (!validation.valid) {
            return res.status(422).json({
                error: 'LOW_CONFIDENCE',
                message: 'Could not reliably extract label. Please retake photo with better lighting.',
                confidence: validation.confidence,
                validationErrors: validation.errors
            });
        }

        // --- 6. Try to get cached health analysis (similarity-based) ---
        const cacheCheckTimer = performanceMonitor.startTimer('llm:cache-lookup');
        let healthReport = llmCache.getHealthAnalysis(extraction, 0.85);
        const cacheHit = !!healthReport;
        cacheCheckTimer({ cacheHit });

        // --- 7. If not cached, perform fresh health analysis ---
        if (!healthReport) {
            const conditions = profile.conditions || ['general'];
            const healthTimer = performanceMonitor.startTimer('groq:health-analysis');
            healthReport = await analyzeHealth(extraction, { conditions });
            healthTimer();

            // Cache the new result
            llmCache.setHealthAnalysis(extraction, healthReport);
        }

        // --- 8. 🔹 Lingo.dev — Detect original label language ---
        let detectedLanguage = 'unknown';
        try {
            const languageTimer = performanceMonitor.startTimer('lingo:language-detection');
            const ingredientText = extraction.ingredients?.join(', ') || '';
            if (ingredientText.length > 5) {
                detectedLanguage = await detectLanguage(ingredientText);
            }
            languageTimer();
        } catch (langError) {
            logger.warn('Language detection skipped', { error: langError.message });
        }

        // --- 9. Record analytics ---
        const totalDuration = totalTimer();
        performanceMonitor.recordApiCall({
            endpoint: '/api/analyze',
            method: 'POST',
            statusCode: 200,
            duration: totalDuration,
            size: Buffer.byteLength(JSON.stringify({ extraction, healthReport }))
        });

        logger.info('Analysis complete', {
            confidence: validation.confidence,
            healthScore: healthReport.score,
            detectedLanguage,
            cached: cacheHit,
            imageSuitability: suitability.confidence,
            compressionRatio: `${compressionMetadata.compressionRatio}%`,
            totalDurationMs: totalDuration
        });

        // --- 10. Return results ---
        res.set('X-LLM-Cache-Hit', cacheHit ? 'true' : 'false');
        res.set('X-Image-Compression-Ratio', `${compressionMetadata.compressionRatio}%`);
        
        res.json({
            confidence: validation.confidence,
            detectedLanguage,
            extraction,
            healthReport,
            performance: {
                totalMs: totalDuration,
                cached: cacheHit,
                imageSuitability: suitability.confidence
            }
        });
    } catch (error) {
        performanceMonitor.recordApiCall({
            endpoint: '/api/analyze',
            method: 'POST',
            statusCode: 500,
            duration: totalTimer(),
            size: 0
        });
        next(error);
    }
});

module.exports = router;
