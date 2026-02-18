const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const logger = require('../utils/logger');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const ALTERNATIVES_PROMPT = `You are a nutrition expert. Based on the food product details provided below, suggest 2-3 healthier alternatives that are commonly available in stores/markets.

For each alternative, provide:
- name: product name (be specific, e.g. "Whole wheat multigrain bread" not just "bread")
- reason: a short 1-sentence reason why it's healthier
- keyBenefit: the main health advantage (e.g. "Lower sodium", "No added sugar", "Higher fiber")

Return ONLY valid JSON in this exact format:
{
  "alternatives": [
    {
      "name": "string",
      "reason": "string",
      "keyBenefit": "string"
    }
  ],
  "tip": "A brief 1-sentence general health tip related to this food category"
}

Do NOT add any text outside the JSON. No markdown, no code fences.`;

/**
 * POST /api/alternatives
 *
 * Accepts product extraction data and returns healthier alternatives via Gemini.
 *
 * Body: { extraction: { ingredients, nutrition, additives } }
 */
router.post('/', async (req, res, next) => {
    try {
        const { extraction } = req.body;

        if (!extraction) {
            return res.status(422).json({
                error: 'MISSING_DATA',
                message: 'Product extraction data is required'
            });
        }

        const productSummary = `
Product ingredients: ${(extraction.ingredients || []).join(', ')}
Nutrition per serving: Calories: ${extraction.nutrition?.calories || 'N/A'}, Fat: ${extraction.nutrition?.totalFat || 'N/A'}, Sodium: ${extraction.nutrition?.sodium || 'N/A'}, Sugars: ${extraction.nutrition?.totalSugars || 'N/A'}, Protein: ${extraction.nutrition?.protein || 'N/A'}
Additives: ${(extraction.additives || []).join(', ') || 'None'}`;

        logger.info('Requesting healthier alternatives from Gemini...');

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: `${ALTERNATIVES_PROMPT}\n\nHere is the scanned product:\n${productSummary}` }
                    ]
                }
            ]
        });

        const responseText = response.text;
        if (!responseText) {
            throw new Error('No response from Gemini');
        }

        const cleanJson = responseText
            .replace(/```json\s*/gi, '')
            .replace(/```\s*/g, '')
            .trim();

        const data = JSON.parse(cleanJson);

        logger.info('Healthier alternatives generated', {
            count: data.alternatives?.length || 0
        });

        res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
