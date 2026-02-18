const logger = require('../utils/logger');

/**
 * TTS Service — DEPRECATED on backend.
 * 
 * Text-to-speech is now handled on the frontend using the browser's
 * native SpeechSynthesis API (Web Speech API). This is free and requires
 * no API key.
 *
 * This stub remains for API compatibility but returns a message
 * directing clients to use browser-native TTS.
 */
async function generateSpeech(text, language = 'en') {
    logger.info('TTS backend stub called — use browser SpeechSynthesis instead', {
        language,
        textLength: text.length
    });

    return {
        deprecated: true,
        message: 'TTS has moved to the frontend. Use browser SpeechSynthesis API.',
        text,
        language
    };
}

module.exports = { generateSpeech };
