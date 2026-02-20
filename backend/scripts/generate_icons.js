const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../../frontend/public/nutra.png');
const outputDir = path.join(__dirname, '../../frontend/public/icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
    try {
        console.log('Generating icons from:', inputPath);

        // Generate 192x192
        await sharp(inputPath)
            .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .toFile(path.join(outputDir, 'icon-192.png'));
        console.log('Created icon-192.png');

        // Generate 512x512
        await sharp(inputPath)
            .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .toFile(path.join(outputDir, 'icon-512.png'));
        console.log('Created icon-512.png');

    } catch (error) {
        console.error('Error generating icons:', error);
    }
}

generateIcons();
