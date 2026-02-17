const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Validate incoming image data.
 * Accepts either base64 string or buffer from multer.
 *
 * @param {string|Buffer} image - Base64 string or image buffer
 * @returns {{ valid: boolean, buffer?: Buffer, error?: string }}
 */
function validateImage(image) {
    if (!image) {
        return { valid: false, error: 'No image provided.' };
    }

    let buffer;

    if (typeof image === 'string') {
        // Handle base64 input
        const base64Regex = /^data:image\/(jpeg|png|webp);base64,/;
        const cleanBase64 = image.replace(base64Regex, '');

        try {
            buffer = Buffer.from(cleanBase64, 'base64');
        } catch {
            return { valid: false, error: 'Invalid base64 image data.' };
        }
    } else if (Buffer.isBuffer(image)) {
        buffer = image;
    } else {
        return { valid: false, error: 'Image must be a base64 string or buffer.' };
    }

    if (buffer.length === 0) {
        return { valid: false, error: 'Empty image data.' };
    }

    if (buffer.length > MAX_SIZE_BYTES) {
        return { valid: false, error: `Image too large. Maximum size is ${MAX_SIZE_BYTES / (1024 * 1024)}MB.` };
    }

    return { valid: true, buffer };
}

module.exports = { validateImage, ALLOWED_MIME_TYPES, MAX_SIZE_BYTES };
