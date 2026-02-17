'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from '@/context/LocaleContext';

/**
 * Mobile bottom navigation bar.
 * Three tabs: Scan, Results, Profile.
 */
export default function BottomNav() {
    const pathname = usePathname();
    const { t } = useLocale();

    const tabs = [
        { href: '/', label: t('nav.scan', 'Scan'), icon: '📷' },
        { href: '/results', label: t('nav.results', 'Results'), icon: '📊' },
        { href: '/profile', label: t('nav.profile', 'Profile'), icon: '👤' },
    ];

    return (
        <nav className="bottom-nav">
            {tabs.map(tab => (
                <Link
                    key={tab.href}
                    href={tab.href}
                    className={`nav-tab ${pathname === tab.href ? 'active' : ''}`}
                >
                    <span className="nav-icon">{tab.icon}</span>
                    <span className="nav-label">{tab.label}</span>
                </Link>
            ))}
        </nav>
    );
}
