const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { validateImage } = require('../validators/imageValidator');
const { compressImage } = require('../utils/imageCompressor');
const { analyzeMealImage } = require('../services/geminiService');

/**
 * POST /api/meal
 *
 * 🔹 Gemini 2.5 Flash — Meal/Dish Photo Analysis
 *
 * Accepts a photo of a meal/dish,
 * returns identified food items with nutritional breakdown.
 *
 * Body: { image: string (base64) }
 */
router.post('/', async (req, res, next) => {
    try {
        const { image } = req.body;

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

        // --- 3. Analyze meal via Gemini ---
        logger.info('Analyzing meal photo via Gemini...');
        const mealAnalysis = await analyzeMealImage(base64);

        // --- 4. Return results ---
        logger.info('Meal analysis complete', {
            foodItems: mealAnalysis.foodItems?.length || 0,
            totalCalories: mealAnalysis.totalCalories
        });

        res.json({
            success: true,
            analyzedAt: new Date().toISOString(),
            ...mealAnalysis
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
