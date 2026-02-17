const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { generateSpeech } = require('../services/ttsService');

/**
 * POST /api/tts
 *
 * 🔹 OpenAI TTS
 *
 * Converts localized text to speech audio (MP3).
 *
 * Body: { text: string, language: string }
 * Response: audio/mpeg binary stream
 */
router.post('/', async (req, res, next) => {
    try {
        const { text, language = 'en' } = req.body;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                error: 'MISSING_TEXT',
                message: 'Text is required for voice generation.'
            });
        }

        if (text.length > 4000) {
            return res.status(400).json({
                error: 'TEXT_TOO_LONG',
                message: 'Text must be under 4000 characters.'
            });
        }

        const audioBuffer = await generateSpeech(text, language);

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.length,
            'Cache-Control': 'no-store'
        });

        res.send(audioBuffer);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
