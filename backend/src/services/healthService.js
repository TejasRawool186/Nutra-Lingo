const Groq = require('groq-sdk');
const logger = require('../utils/logger');
const { HEALTH_REASONING_PROMPT } = require('../prompts/health.prompt');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Analyze health impact of extracted food label data using Groq LLM.
 *
 * Uses llama-3.3-70b-versatile for health reasoning.
 * Adapts analysis based on user health profile (diabetes, hypertension, etc.)
 *
 * @param {object} extraction - Structured extraction from visionService
 * @param {object} profile - User profile { conditions: string[] }
 * @returns {Promise<object>} Health report { score, verdict, warnings[], summary }
 */
async function analyzeHealth(extraction, profile = {}) {
    const startTime = Date.now();
    const conditions = profile.conditions || ['general'];

    logger.info('Starting Groq health analysis...', { conditions });

    const systemPrompt = HEALTH_REASONING_PROMPT;
    const userPrompt = `Analyze this food label extraction for health impact:

${JSON.stringify(extraction, null, 2)}

User health conditions: ${conditions.join(', ')}

Return a JSON health report with: score (1-10), verdict, warnings array, and summary.`;

    const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
        throw new Error('No response from Groq health analysis');
    }

    const healthReport = JSON.parse(responseText);
    const elapsed = Date.now() - startTime;

    logger.info('Groq health analysis complete', {
        elapsed: `${elapsed}ms`,
        score: healthReport.score,
        warningCount: healthReport.warnings?.length || 0
    });

    return healthReport;
}

module.exports = { analyzeHealth };
