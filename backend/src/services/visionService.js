const OpenAI = require('openai');
const logger = require('../utils/logger');
const { VISION_EXTRACTION_SYSTEM_PROMPT, EXTRACTION_PROMPT } = require('../prompts/extraction.prompt');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * 🔹 OpenAI Vision — Send food label image and extract structured data.
 * Combines Vision OCR + structured extraction in a single GPT-4o call.
 *
 * @param {string} base64Image - Base64-encoded image (JPEG)
 * @returns {Promise<object>} Parsed extraction JSON
 */
async function extractFromImage(base64Image) {
    logger.info('Starting OpenAI Vision extraction...');
    const startTime = Date.now();

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: VISION_EXTRACTION_SYSTEM_PROMPT
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`,
                                detail: 'high'
                            }
                        },
                        {
                            type: 'text',
                            text: EXTRACTION_PROMPT
                        }
                    ]
                }
            ],
            max_tokens: 2000,
            temperature: 0.1 // Low temperature for consistent JSON output
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error('Empty response from OpenAI Vision');
        }

        // Parse JSON from response (handle potential markdown wrapping)
        const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(jsonStr);

        const elapsed = Date.now() - startTime;
        logger.info('Vision extraction complete', { elapsed: `${elapsed}ms` });

        return parsed;
    } catch (error) {
        logger.error('Vision extraction failed', { error: error.message });

        if (error instanceof SyntaxError) {
            throw Object.assign(new Error('Failed to parse extraction results. Please try again.'), {
                statusCode: 422,
                code: 'EXTRACTION_PARSE_ERROR'
            });
        }

        throw Object.assign(new Error('Image analysis failed. Please try a clearer image.'), {
            statusCode: 500,
            code: 'VISION_ERROR'
        });
    }
}

module.exports = { extractFromImage };
