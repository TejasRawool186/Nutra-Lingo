'use client';

import LanguageSelector from '@/components/ui/LanguageSelector';
import { useLocale } from '@/context/LocaleContext';
import { Leaf } from 'lucide-react';

/**
 * Glassmorphic sticky header with Lucide logo icon.
 */
export default function Header() {
    const { t } = useLocale();

    return (
        <header className="app-header">
            <div className="header-content">
                <div className="header-logo">
                    <div className="logo-icon">
                        <Leaf size={20} color="white" />
                    </div>
                    <h1 className="logo-text">{t('app.name', 'NutraLingo')}</h1>
                </div>
                <LanguageSelector />
            </div>
        </header>
    );
}
