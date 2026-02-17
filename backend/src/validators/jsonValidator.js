/**
 * Validates the structured JSON output from GPT-4o extraction.
 * Ensures required fields exist and numeric values are reasonable.
 *
 * @param {object} data - Parsed extraction JSON
 * @returns {{ valid: boolean, confidence: number, errors: string[] }}
 */
function validateExtraction(data) {
    const errors = [];
    let fieldsPresent = 0;
    const totalFields = 5; // ingredients, nutrition, servingSize, additives, calories

    // Check ingredients
    if (data.ingredients && Array.isArray(data.ingredients) && data.ingredients.length > 0) {
        fieldsPresent++;
    } else {
        errors.push('Missing or empty ingredients list.');
    }

    // Check nutrition object
    if (data.nutrition && typeof data.nutrition === 'object') {
        fieldsPresent++;

        // Validate numeric fields
        const numericFields = ['calories', 'totalFat', 'sodium', 'totalSugars', 'protein'];
        for (const field of numericFields) {
            if (data.nutrition[field] !== undefined) {
                const numVal = parseFloat(String(data.nutrition[field]).replace(/[^\d.]/g, ''));
                if (isNaN(numVal) || numVal < 0) {
                    errors.push(`Invalid value for nutrition.${field}: ${data.nutrition[field]}`);
                }
            }
        }
    } else {
        errors.push('Missing nutrition data.');
    }

    // Check serving size
    if (data.nutrition?.servingSize && String(data.nutrition.servingSize).trim().length > 0) {
        fieldsPresent++;
    } else {
        errors.push('Missing serving size.');
    }

    // Check additives (optional, but counts toward confidence)
    if (data.additives && Array.isArray(data.additives)) {
        fieldsPresent++;
    }

    // Check calories specifically
    if (data.nutrition?.calories !== undefined) {
        fieldsPresent++;
    }

    const confidence = fieldsPresent / totalFields;
    const valid = confidence >= 0.4; // At least 2/5 core fields

    return { valid, confidence: Math.round(confidence * 100) / 100, errors };
}

module.exports = { validateExtraction };
