'use client';

import LanguageSelector from '@/components/ui/LanguageSelector';
import { useLocale } from '@/context/LocaleContext';

/**
 * App header with logo and language selector.
 */
export default function Header() {
    const { t } = useLocale();

    return (
        <header className="app-header">
            <div className="header-content">
                <div className="header-logo">
                    <span className="logo-icon">🥗</span>
                    <h1 className="logo-text">{t('app.name', 'NutraLingo')}</h1>
                </div>
                <LanguageSelector />
            </div>
        </header>
    );
}
