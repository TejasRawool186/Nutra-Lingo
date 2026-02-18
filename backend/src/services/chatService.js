const Groq = require('groq-sdk');
const lingoService = require('./lingoService');
const logger = require('../utils/logger'); // Ensure logger exists

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * 🔹 Multilingual Chat Service for "Ask a Nutritionist"
 * 
 * Flow:
 * 1. User asks question in Native Language.
 * 2. Lingo.dev detects language.
 * 3. Lingo.dev translates question to English (if needed).
 * 4. Groq LLM answers question in English (with system context).
 * 5. Lingo.dev translates answer back to Native Language.
 * 6. Return localized answer.
 * 
 * @param {string} userQuestion - The question asked by the user
 * @param {object} contextData - Contextual data (e.g., product info)
 * @returns {Promise<object>} - { answer, language, originalQuestion }
 */
async function handleChat(userQuestion, contextData = {}) {
    // Check if userQuestion is confusingly empty
    if (!userQuestion || typeof userQuestion !== 'string') {
        throw new Error('Invalid question format');
    }

    const startTime = Date.now();
    logger.info('Starting chat request...', { questionLength: userQuestion.length });

    try {
        // Step 1: Detect Language
        const detectedLocale = await lingoService.detectLanguage(userQuestion);
        const isEnglish = detectedLocale.startsWith('en');

        // Step 2: Translate to English if needed
        let englishQuestion = userQuestion;
        if (!isEnglish) {
            // Using logic: localizeObject({text: ...}) inside lingoService.translateText
            // It expects (text, target, source)
            englishQuestion = await lingoService.translateText(userQuestion, 'en', detectedLocale);
            logger.info('Translated question to English', { englishQuestion });
        }

        // Step 3: Get Answer from Groq
        const systemPrompt = `You are a helpful, friendly nutritionist assistant for NutraLingo.
Use the provided food product context to answer the user's question.
Keep answers concise (max 2-3 sentences).
Be encouraging but realistic about health risks.

Context:
${JSON.stringify(contextData, null, 2)}`;

        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: englishQuestion }
            ],
            temperature: 0.3,
            max_tokens: 300
        });

        const englishAnswer = completion.choices[0]?.message?.content || "I couldn't generate an answer at this time.";

        // Step 4: Translate Answer back to User's Language
        let finalAnswer = englishAnswer;
        if (!isEnglish) {
            finalAnswer = await lingoService.translateText(englishAnswer, detectedLocale, 'en');
        }

        const elapsed = Date.now() - startTime;
        logger.info('Chat request complete', { elapsed: `${elapsed}ms`, locale: detectedLocale });

        return {
            answer: finalAnswer,
            language: detectedLocale,
            originalQuestion: userQuestion
        };
    } catch (error) {
        logger.error('Error in handleChat service', { error: error.message });
        throw error;
    }
}

module.exports = { handleChat };
