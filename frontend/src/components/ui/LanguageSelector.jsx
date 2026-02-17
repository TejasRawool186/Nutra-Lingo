'use client';

import { useLocale } from '@/context/LocaleContext';

/**
 * 🔹 Lingo.dev — Dynamic Language Selector.
 * Allows users to switch UI and report language at any time.
 */
export default function LanguageSelector() {
    const { locale, switchLanguage, supportedLanguages } = useLocale();

    return (
        <div className="language-selector">
            <label htmlFor="lang-select" className="lang-label">🌐</label>
            <select
                id="lang-select"
                value={locale}
                onChange={(e) => switchLanguage(e.target.value)}
                className="lang-dropdown"
            >
                {supportedLanguages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                        {lang.nativeName}
                    </option>
                ))}
            </select>
        </div>
    );
}
