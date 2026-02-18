const Tesseract = require('tesseract.js');
const Groq = require('groq-sdk');
const { GoogleGenAI } = require('@google/genai');
const logger = require('../utils/logger');
const { EXTRACTION_PROMPT, VISION_EXTRACTION_SYSTEM_PROMPT } = require('../prompts/extraction.prompt');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ─── JSON extraction schema (same structure for both pipelines) ───
const GEMINI_LABEL_PROMPT = `${VISION_EXTRACTION_SYSTEM_PROMPT}

You MUST respond with ONLY valid JSON in this exact schema:

{
  "ingredients": ["ingredient1", "ingredient2", ...],
  "nutrition": {
    "servingSize": "30g",
    "calories": 140,
    "totalFat": "5g",
    "saturatedFat": "2g",
    "transFat": "0g",
    "cholesterol": "0mg",
    "sodium": "480mg",
    "totalCarbohydrates": "20g",
    "dietaryFiber": "1g",
    "totalSugars": "8g",
    "protein": "2g"
  },
  "additives": ["E621 (Monosodium glutamate)", "E330 (Citric acid)"]
}

If a field cannot be determined, set it to null. Do NOT add any text outside the JSON.`;

// ═════════════════════════════════════════════════════════════════
//  PRIMARY: Gemini 2.5 Flash — Direct image → structured JSON
// ═════════════════════════════════════════════════════════════════

async function extractWithGemini(base64Image) {
    logger.info('🔹 Gemini: Starting label extraction (primary)...');
    const startTime = Date.now();

    // Strip data URI prefix if present
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            {
                role: 'user',
                parts: [
                    { text: GEMINI_LABEL_PROMPT },
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

    const extraction = JSON.parse(cleanJson);
    const elapsed = Date.now() - startTime;

    logger.info('🔹 Gemini: Extraction complete', {
        elapsed: `${elapsed}ms`,
        ingredients: extraction.ingredients?.length || 0
    });

    // Set high confidence for Gemini (vision model reads directly)
    extraction._ocrConfidence = 0.92;
    extraction._extractedBy = 'gemini';

    return extraction;
}

// ═════════════════════════════════════════════════════════════════
//  FALLBACK: Tesseract OCR → Groq LLM (original pipeline)
// ═════════════════════════════════════════════════════════════════

async function runTesseractOCR(base64Image) {
    logger.info('Starting Tesseract OCR...');

    const imageData = base64Image.startsWith('data:')
        ? base64Image
        : `data:image/jpeg;base64,${base64Image}`;

    const { data } = await Tesseract.recognize(imageData, 'eng', {
        logger: () => { }
    });

    logger.info('Tesseract OCR complete', {
        textLength: data.text.length,
        confidence: Math.round(data.confidence)
    });

    return {
        text: data.text,
        confidence: data.confidence / 100
    };
}

async function extractWithTesseractGroq(base64Image) {
    logger.info('⚙️ Fallback: Tesseract + Groq pipeline...');
    const startTime = Date.now();

    // Step 1: OCR
    const ocrResult = await runTesseractOCR(base64Image);

    if (!ocrResult.text || ocrResult.text.trim().length < 5) {
        throw new Error('Could not extract text from image. Please retake with better lighting.');
    }

    // Step 2: Groq LLM parse
    logger.info('Sending OCR text to Groq for structured extraction...');

    const userPrompt = `Here is raw text extracted from a food label via OCR. Parse it into the required JSON structure.

Raw OCR text:
"""
${ocrResult.text}
"""

Important:
- The text may contain OCR errors — use your knowledge to correct obvious misspellings of common ingredients.
- Extract ALL ingredients, nutrition values, allergens, and additives you can identify.
- If nutrition values have units, include them (e.g., "12g", "150mg").
- Return valid JSON only.`;

    const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
            { role: 'system', content: EXTRACTION_PROMPT },
            { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
        throw new Error('No response from Groq LLM');
    }

    const extraction = JSON.parse(responseText);
    const elapsed = Date.now() - startTime;

    logger.info('⚙️ Fallback: Extraction complete', {
        elapsed: `${elapsed}ms`,
        ingredients: extraction.ingredients?.length || 0
    });

    extraction._ocrConfidence = ocrResult.confidence;
    extraction._extractedBy = 'tesseract-groq';

    return extraction;
}

// ═════════════════════════════════════════════════════════════════
//  MAIN: Try Gemini first, fall back to Tesseract + Groq
// ═════════════════════════════════════════════════════════════════

async function extractFromImage(base64Image) {
    try {
        return await extractWithGemini(base64Image);
    } catch (geminiError) {
        logger.warn('Gemini extraction failed, falling back to Tesseract + Groq', {
            error: geminiError.message
        });
        return await extractWithTesseractGroq(base64Image);
    }
}

module.exports = { extractFromImage };
