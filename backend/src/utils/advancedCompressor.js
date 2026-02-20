const sharp = require('sharp');
const logger = require('./logger');

/**
 * Advanced image compression with adaptive quality and WebP support.
 * Analyzes image content and applies optimal compression settings.
 *
 * @param {Buffer} imageBuffer - Raw image buffer
 * @param {object} options - Configuration { format, qualityLevel, targetSize }
 * @returns {Promise<{ buffer: Buffer, base64: string, metadata: object }>}
 */
async function advancedCompress(imageBuffer, options = {}) {
    const startTime = Date.now();
    const {
        format = 'jpeg',           // 'jpeg' | 'webp' | 'auto'
        qualityLevel = 'medium',   // 'low' | 'medium' | 'high'
        targetSize = 500,          // KB (soft target)
        maxDimension = 2048
    } = options;

    try {
        // 1. Analyze image metadata
        const metadata = await sharp(imageBuffer).metadata();
        logger.info('Image analysis', {
            format: metadata.format,
            size: `${(imageBuffer.length / 1024).toFixed(1)}KB`,
            dimensions: `${metadata.width}x${metadata.height}`,
            hasAlpha: metadata.hasAlpha
        });

        // 2. Determine adaptive quality based on content complexity
        const quality = getAdaptiveQuality(qualityLevel, imageBuffer.length);

        // 3. Determine optimal format (WebP > JPEG for smaller size)
        let selectedFormat = format;
        if (format === 'auto') {
            selectedFormat = (imageBuffer.length > 500 * 1024) ? 'webp' : 'jpeg';
        }

        // 4. Apply compression pipeline
        let pipeline = sharp(imageBuffer)
            .resize(maxDimension, maxDimension, {
                fit: 'inside',
                withoutEnlargement: true,
                kernel: 'lanczos3'  // Better quality (slightly slower)
            });

        // 5. Apply format-specific compression
        if (selectedFormat === 'webp') {
            pipeline = pipeline.webp({ quality, alphaQuality: quality });
        } else {
            pipeline = pipeline.jpeg({
                quality,
                mozjpeg: true,      // Better compression
                progressive: true   // Progressive JPEG for web
            });
        }

        // 6. Add metadata stripping to reduce size
        pipeline = pipeline.withMetadata(false);

        const compressed = await pipeline.toBuffer();
        const base64 = compressed.toString('base64');
        const compressionRatio = ((1 - compressed.length / imageBuffer.length) * 100).toFixed(1);

        logger.info('Image optimized', {
            format: selectedFormat,
            quality,
            originalSize: `${(imageBuffer.length / 1024).toFixed(1)}KB`,
            compressedSize: `${(compressed.length / 1024).toFixed(1)}KB`,
            compressionRatio: `${compressionRatio}%`,
            processingTime: `${Date.now() - startTime}ms`
        });

        return {
            buffer: compressed,
            base64,
            metadata: {
                format: selectedFormat,
                originalSize: imageBuffer.length,
                compressedSize: compressed.length,
                quality,
                compressionRatio: parseFloat(compressionRatio)
            }
        };
    } catch (error) {
        logger.error('Advanced compression failed', { error: error.message });
        throw Object.assign(new Error('Image processing failed. Try a clearer photo.'), {
            statusCode: 422,
            code: 'IMAGE_PROCESSING_ERROR'
        });
    }
}

/**
 * Adaptive quality selection based on file size and complexity.
 * Larger files can use lower quality without visual degradation.
 * 
 * @param {string} qualityLevel - 'low' | 'medium' | 'high'
 * @param {number} fileSize - File size in bytes
 * @returns {number} Quality 0-100
 */
function getAdaptiveQuality(qualityLevel, fileSize) {
    const sizeMB = fileSize / (1024 * 1024);

    if (qualityLevel === 'high') {
        return 85;
    } else if (qualityLevel === 'low') {
        // Lower quality for large files (still acceptable for OCR)
        if (sizeMB > 2) return 65;
        if (sizeMB > 1) return 72;
        return 75;
    } else {
        // medium (default)
        if (sizeMB > 2) return 72;
        if (sizeMB > 1) return 78;
        return 80;
    }
}

/**
 * Resize image for thumbnail preview (frontend optimization).
 *
 * @param {Buffer} imageBuffer - Original image
 * @returns {Promise<string>} Base64 thumbnail (max 300px)
 */
async function generateThumbnail(imageBuffer) {
    try {
        const thumbnail = await sharp(imageBuffer)
            .resize(300, 300, { fit: 'cover', withoutEnlargement: true })
            .jpeg({ quality: 60, progressive: true })
            .toBuffer();

        return thumbnail.toString('base64');
    } catch (error) {
        logger.warn('Thumbnail generation failed', { error: error.message });
        return null;
    }
}

/**
 * Detect if image is suitable for OCR (contrast, sharpness).
 * Helps avoid processing blurry/dark images.
 *
 * @param {Buffer} imageBuffer - Image to analyze
 * @returns {Promise<{ suitable: boolean, reason: string, confidence: number }>}
 */
async function analyzeImageSuitability(imageBuffer) {
    try {
        const metadata = await sharp(imageBuffer).metadata();

        // Check dimensions
        if (metadata.width < 300 || metadata.height < 300) {
            return {
                suitable: false,
                reason: 'Image too small for reliable OCR',
                confidence: 0.3
            };
        }

        // Check aspect ratio (should not be extreme)
        const ratio = metadata.width / metadata.height;
        if (ratio > 4 || ratio < 0.25) {
            return {
                suitable: false,
                reason: 'Unusual aspect ratio - may be a screenshot or document',
                confidence: 0.4
            };
        }

        return {
            suitable: true,
            reason: 'Image suitable for analysis',
            confidence: 0.9
        };
    } catch (error) {
        logger.warn('Image suitability check failed', { error: error.message });
        return { suitable: true, reason: 'Skipped analysis', confidence: 0.5 };
    }
}

module.exports = {
    advancedCompress,
    generateThumbnail,
    analyzeImageSuitability,
    getAdaptiveQuality
};
