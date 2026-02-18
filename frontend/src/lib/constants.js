/** Supported languages — 🔹 Lingo.dev manages translations for these */
export const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
    { code: 'th', name: 'Thai', nativeName: 'ไทย' },
];


/** Extraction confidence threshold — below this triggers rescan prompt */
export const CONFIDENCE_THRESHOLD = 0.5;

/** Health score verdict mapping */
export const SCORE_VERDICTS = {
    VERY_POOR: { min: 0, max: 2, label: 'Very Poor', color: '#DC2626' },
    POOR: { min: 2, max: 4, label: 'Poor', color: '#EA580C' },
    MODERATE: { min: 4, max: 6, label: 'Moderate', color: '#CA8A04' },
    GOOD: { min: 6, max: 8, label: 'Good', color: '#16A34A' },
    EXCELLENT: { min: 8, max: 10, label: 'Excellent', color: '#059669' },
};

/** Health conditions for user profile */
export const HEALTH_CONDITIONS = [
    { id: 'general', label: 'General / Preventive', icon: '🛡️' },
    { id: 'hypertension', label: 'Hypertension', icon: '❤️‍🩹' },
    { id: 'diabetes', label: 'Diabetes', icon: '🩸' },
];

/** Warning severity colors */
export const SEVERITY_COLORS = {
    high: { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' },
    medium: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
    low: { bg: '#D1FAE5', text: '#065F46', border: '#A7F3D0' },
};
