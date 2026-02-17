const sharp = require('sharp');
const logger = require('./logger');

/**
 * Compress and resize image buffer for optimal OpenAI Vision processing.
 * Target: < 1MB, max 2048px on longest side, JPEG format.
 *
 * @param {Buffer} imageBuffer - Raw image buffer
 * @returns {Promise<{ buffer: Buffer, base64: string }>}
 */
async function compressImage(imageBuffer) {
    try {
        const compressed = await sharp(imageBuffer)
            .resize(2048, 2048, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 80 })
            .toBuffer();

        const base64 = compressed.toString('base64');

        logger.info('Image compressed', {
            originalSize: `${(imageBuffer.length / 1024).toFixed(1)}KB`,
            compressedSize: `${(compressed.length / 1024).toFixed(1)}KB`
        });

        return { buffer: compressed, base64 };
    } catch (error) {
        logger.error('Image compression failed', { error: error.message });
        throw Object.assign(new Error('Failed to process image. Please try a different image.'), {
            statusCode: 422,
            code: 'IMAGE_PROCESSING_ERROR'
        });
    }
}

module.exports = { compressImage };
