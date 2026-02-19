const logger = require('../utils/logger');

/**
 * TTS Service — Backend Stub
 * 
 * Text-to-speech is handled on the frontend using the browser's
 * native SpeechSynthesis API. 
 *
 * This stub remains for API compatibility but returns an error
 * directing clients to use browser-native TTS.
 */
async function generateSpeech(text, language = 'en') {
    logger.info('TTS backend stub called', { language });

    // Throw error to signal frontend to handle it (or use a free fallback if implemented)
    throw new Error('BACKEND_TTS_NOT_CONFIGURED');
}

module.exports = { generateSpeech };
