const express = require('express');
const router = express.Router();
const chatService = require('../services/chatService');
const logger = require('../utils/logger'); // Ensure logger exists

/**
 * POST /api/chat
 * Body: { question: string, context: object }
 */
router.post('/', async (req, res) => {
    try {
        const { question, context } = req.body;

        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        const result = await chatService.handleChat(question, context);
        res.json(result);

    } catch (error) {
        logger.error('Chat API Error', { error: error.message });
        res.status(500).json({ error: 'Failed to process chat request' });
    }
});

module.exports = router;
