'use client';

import { useProfile } from '@/context/ProfileContext';
import { useLocale } from '@/context/LocaleContext';
import { HEALTH_CONDITIONS } from '@/lib/constants';

/**
 * User health profile form.
 * Toggle conditions for personalized analysis.
 */
export default function ProfileForm() {
    const { profile, toggleCondition } = useProfile();
    const { t } = useLocale();

    return (
        <div className="profile-form section-card">
            <h3 className="section-title">
                {t('profile.title', 'Health Profile')}
            </h3>
            <p className="section-subtitle">
                {t('profile.subtitle', 'Select your health conditions for personalized analysis')}
            </p>
            <div className="condition-options">
                {HEALTH_CONDITIONS.map(condition => (
                    <button
                        key={condition.id}
                        onClick={() => toggleCondition(condition.id)}
                        className={`condition-btn ${profile.conditions.includes(condition.id) ? 'selected' : ''
                            }`}
                    >
                        <span className="condition-icon">{condition.icon}</span>
                        <span className="condition-label">
                            {t(`profile.${condition.id}`, condition.label)}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
