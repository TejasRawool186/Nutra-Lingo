const OpenAI = require('openai');
const logger = require('../utils/logger');
const { HEALTH_REASONING_PROMPT } = require('../prompts/health.prompt');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * 🔹 GPT-4o Health Reasoning Engine.
 * Analyzes extracted nutrition data against user health profile.
 *
 * @param {object} extraction - Structured nutrition data from visionService
 * @param {object} profile - User profile { conditions: string[] }
 * @returns {Promise<object>} Health report { score, verdict, warnings[], summary }
 */
async function analyzeHealth(extraction, profile) {
    logger.info('Starting health analysis...', { conditions: profile.conditions });
    const startTime = Date.now();

    const userMessage = `
EXTRACTED NUTRITION DATA:
${JSON.stringify(extraction, null, 2)}

USER HEALTH PROFILE:
- Conditions: ${profile.conditions.join(', ')}

Analyze this product and generate a health report.`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: HEALTH_REASONING_PROMPT },
                { role: 'user', content: userMessage }
            ],
            max_tokens: 1500,
            temperature: 0.2
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error('Empty response from health reasoning engine');
        }

        const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const healthReport = JSON.parse(jsonStr);

        // Ensure score is within bounds
        healthReport.score = Math.max(0, Math.min(10, healthReport.score));

        const elapsed = Date.now() - startTime;
        logger.info('Health analysis complete', {
            elapsed: `${elapsed}ms`,
            score: healthReport.score,
            warningCount: healthReport.warnings?.length || 0
        });

        return healthReport;
    } catch (error) {
        logger.error('Health analysis failed', { error: error.message });

        if (error instanceof SyntaxError) {
            throw Object.assign(new Error('Failed to generate health report. Please retry.'), {
                statusCode: 422,
                code: 'HEALTH_PARSE_ERROR'
            });
        }

        throw Object.assign(new Error('Health analysis service unavailable.'), {
            statusCode: 500,
            code: 'HEALTH_ERROR'
        });
    }
}

module.exports = { analyzeHealth };
