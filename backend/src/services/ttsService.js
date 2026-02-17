const OpenAI = require('openai');
const logger = require('../utils/logger');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * 🔹 OpenAI TTS — Convert localized text to speech audio.
 *
 * @param {string} text - Text to convert to speech
 * @param {string} language - ISO language code (for voice selection)
 * @returns {Promise<Buffer>} Audio buffer (MP3)
 */
async function generateSpeech(text, language = 'en') {
    logger.info('Generating TTS audio...', { language, textLength: text.length });
    const startTime = Date.now();

    try {
        // Select voice based on language characteristics
        // OpenAI TTS supports multiple languages automatically
        const voice = 'nova'; // Natural, warm voice suitable for health info

        const response = await openai.audio.speech.create({
            model: 'tts-1',
            voice,
            input: text,
            response_format: 'mp3',
            speed: 0.95 // Slightly slower for clarity on medical content
        });

        const audioBuffer = Buffer.from(await response.arrayBuffer());

        const elapsed = Date.now() - startTime;
        logger.info('TTS generation complete', {
            elapsed: `${elapsed}ms`,
            audioSize: `${(audioBuffer.length / 1024).toFixed(1)}KB`
        });

        return audioBuffer;
    } catch (error) {
        logger.error('TTS generation failed', { error: error.message });
        throw Object.assign(new Error('Voice generation unavailable.'), {
            statusCode: 500,
            code: 'TTS_ERROR'
        });
    }
}

module.exports = { generateSpeech };
