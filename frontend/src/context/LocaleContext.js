'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
];

const LocaleContext = createContext(null);

/**
 * 🔹 Lingo.dev — Core Locale Provider.
 * Wraps the entire app. Manages current language and locale files.
 * Localization is a CORE layer — not an add-on.
 */
export function LocaleProvider({ children }) {
    const [locale, setLocale] = useState('en');
    const [strings, setStrings] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    // Load locale strings on language change
    useEffect(() => {
        async function loadLocale() {
            setIsLoading(true);
            try {
                const localeData = await import(`@/locales/${locale}.json`);
                setStrings(localeData.default || localeData);
            } catch {
                // Fallback to English
                const fallback = await import('@/locales/en.json');
                setStrings(fallback.default || fallback);
            }
            setIsLoading(false);
        }
        loadLocale();
    }, [locale]);

    // Persist locale to localStorage
    useEffect(() => {
        const saved = localStorage.getItem('nutralingo-locale');
        if (saved) setLocale(saved);
    }, []);

    const switchLanguage = (langCode) => {
        setLocale(langCode);
        localStorage.setItem('nutralingo-locale', langCode);
    };

    /**
     * Get a localized string by key.
     * Supports dot notation: t('results.healthScore')
     */
    const t = (key, fallback = key) => {
        const keys = key.split('.');
        let value = strings;
        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) return fallback;
        }
        return value || fallback;
    };

    return (
        <LocaleContext.Provider value={{
            locale,
            switchLanguage,
            t,
            isLoading,
            supportedLanguages: SUPPORTED_LANGUAGES
        }}>
            {children}
        </LocaleContext.Provider>
    );
}

export function useLocale() {
    const context = useContext(LocaleContext);
    if (!context) {
        throw new Error('useLocale must be used within a LocaleProvider');
    }
    return context;
}

export default LocaleContext;
