'use client';

import { useProfile } from '@/context/ProfileContext';
import { useLocale } from '@/context/LocaleContext';
import { HEALTH_CONDITIONS, ALLERGENS } from '@/lib/constants';
import { Shield, HeartPulse, Droplets } from 'lucide-react';

const CONDITION_ICONS = {
    general: Shield,
    hypertension: HeartPulse,
    diabetes: Droplets,
};

/**
 * User health profile form with Lucide icons.
 */
export default function ProfileForm() {
    const { profile, toggleCondition, toggleAllergen } = useProfile();
    const { t } = useLocale();

    return (
        <div className="profile-form section-card">
            <h3 className="section-title">
                <Shield size={18} />
                {t('profile.title', 'Health Profile')}
            </h3>
            <p className="section-subtitle">
                {t('profile.subtitle', 'Select your health conditions for personalized analysis')}
            </p>
            <div className="condition-options">
                {HEALTH_CONDITIONS.map(condition => {
                    const IconComponent = CONDITION_ICONS[condition.id] || Shield;
                    const isSelected = profile.conditions.includes(condition.id);
                    return (
                        <button
                            key={condition.id}
                            onClick={() => toggleCondition(condition.id)}
                            className={`condition-btn ${isSelected ? 'selected' : ''}`}
                        >
                            <span className="condition-icon">
                                <IconComponent size={22} />
                            </span>
                            <span className="condition-label">
                                {t(`profile.${condition.id}`, condition.label)}
                            </span>
                        </button>
                    );
                })}
            </div>

            <h3 className="section-title mt-6">
                <Shield size={18} />
                {t('profile.allergies', 'Allergies')}
            </h3>
            <p className="section-subtitle">
                {t('profile.allergiesSubtitle', 'Select ingredients you are allergic to')}
            </p>
            <div className="condition-options">
                {ALLERGENS.map(allergen => {
                    const isSelected = (profile.allergens || []).includes(allergen.id);
                    return (
                        <button
                            key={allergen.id}
                            onClick={() => toggleAllergen(allergen.id)}
                            className={`condition-btn ${isSelected ? 'selected' : ''}`}
                        >
                            <span className="condition-icon">
                                {allergen.icon}
                            </span>
                            <span className="condition-label">
                                {t(`profile.${allergen.id}`, allergen.label)}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
