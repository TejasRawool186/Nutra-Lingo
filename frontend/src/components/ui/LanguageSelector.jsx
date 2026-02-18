'use client';

import { useLocale } from '@/context/LocaleContext';
import { Globe } from 'lucide-react';

/**
 * Lingo.dev — Dynamic Language Selector with Lucide globe icon.
 */
export default function LanguageSelector() {
    const { locale, switchLanguage, supportedLanguages } = useLocale();

    return (
        <div className="language-selector">
            <label htmlFor="lang-select" className="lang-label">
                <Globe size={18} color="var(--green-600)" />
            </label>
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
