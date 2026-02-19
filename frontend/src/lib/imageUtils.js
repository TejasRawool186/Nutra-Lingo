/**
 * Client-side image compression using canvas.
 * Resizes and compresses to JPEG before sending to backend.
 *
 * @param {File} file - Image file from camera or upload
 * @param {number} maxSize - Max dimension in pixels (default 2048)
 * @param {number} quality - JPEG quality 0–1 (default 0.8)
 * @returns {Promise<string>} Base64-encoded JPEG string
 */
export async function compressImage(file, maxSize = 2048, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;

                // Scale down if needed
                if (width > maxSize || height > maxSize) {
                    if (width > height) {
                        height = (height / width) * maxSize;
                        width = maxSize;
                    } else {
                        width = (width / height) * maxSize;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const base64 = canvas.toDataURL('image/jpeg', quality);
                resolve(base64);
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

/**
 * Validate image file before processing.
 */
export function validateImageFile(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!validTypes.includes(file.type)) {
        return { valid: false, error: 'Please upload a JPEG, PNG, or WebP image.' };
    }

    if (file.size > maxSize) {
        return { valid: false, error: 'Image is too large. Maximum size is 50MB.' };
    }

    return { valid: true };
}
