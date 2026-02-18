const { GoogleGenAI } = require('@google/genai');
const logger = require('../utils/logger');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MEAL_ANALYSIS_PROMPT = `You are a professional nutritionist AI. Analyze this photo of a meal/dish.

Identify every distinct food item visible in the image. For each item, estimate:
- name: the food item name
- quantity: estimated portion (e.g., "1 cup", "2 pieces", "150g")
- calories: estimated calories (number)
- protein: estimated protein in grams (number)
- carbs: estimated carbs in grams (number)
- fat: estimated fat in grams (number)

Return a valid JSON object with this exact structure:
{
  "foodItems": [
    {
      "name": "string",
      "quantity": "string",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number
    }
  ],
  "totalCalories": number,
  "totalProtein": number,
  "totalCarbs": number,
  "totalFat": number,
  "mealSummary": "A brief 1-2 sentence summary of the meal and its nutritional profile"
}

Guidelines:
- Be as accurate as possible with portion estimates based on visual cues
- Use standard nutritional databases as reference (USDA, etc.)
- If you cannot identify a food item clearly, make your best estimate and note it
- Always return valid JSON only, no markdown, no code fences
- The totals must equal the sum of individual items`;

/**
 * Analyze a dish/meal photo using Gemini Vision.
 *
 * @param {string} base64Image - Base64-encoded image (without data URI prefix)
 * @returns {Promise<object>} Structured meal analysis
 */
async function analyzeMealImage(base64Image) {
    const startTime = Date.now();
    logger.info('Starting Gemini meal analysis...');

    // Strip data URI prefix if present
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            {
                role: 'user',
                parts: [
                    { text: MEAL_ANALYSIS_PROMPT },
                    {
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: cleanBase64
                        }
                    }
                ]
            }
        ]
    });

    const responseText = response.text;
    if (!responseText) {
        throw new Error('No response from Gemini');
    }

    // Clean response — strip markdown fences if present
    const cleanJson = responseText
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();

    const mealData = JSON.parse(cleanJson);
    const elapsed = Date.now() - startTime;

    logger.info('Gemini meal analysis complete', {
        elapsed: `${elapsed}ms`,
        foodItems: mealData.foodItems?.length || 0,
        totalCalories: mealData.totalCalories
    });

    return mealData;
}

module.exports = { analyzeMealImage };
