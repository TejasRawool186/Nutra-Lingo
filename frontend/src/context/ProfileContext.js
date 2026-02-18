'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ProfileContext = createContext(null);

const DEFAULT_PROFILE = {
    conditions: ['general'],
};

/**
 * User health profile context.
 * Persists conditions (hypertension, diabetes, general) to localStorage.
 */
export function ProfileProvider({ children }) {
    const [profile, setProfile] = useState(DEFAULT_PROFILE);

    useEffect(() => {
        const saved = localStorage.getItem('nutralingo-profile');
        if (saved) {
            try {
                setProfile(JSON.parse(saved));
            } catch {
                setProfile(DEFAULT_PROFILE);
            }
        }
    }, []);

    const updateProfile = (newProfile) => {
        const merged = { ...profile, ...newProfile };
        setProfile(merged);
        localStorage.setItem('nutralingo-profile', JSON.stringify(merged));
    };

    const toggleCondition = (condition) => {
        let conditions = [...profile.conditions];

        if (condition === 'general') {
            conditions = ['general'];
        } else {
            conditions = conditions.filter(c => c !== 'general');
            if (conditions.includes(condition)) {
                conditions = conditions.filter(c => c !== condition);
            } else {
                conditions.push(condition);
            }
            if (conditions.length === 0) conditions = ['general'];
        }

        updateProfile({ conditions });
    };

    const toggleAllergen = (allergen) => {
        let allergens = [...(profile.allergens || [])];
        if (allergens.includes(allergen)) {
            allergens = allergens.filter(a => a !== allergen);
        } else {
            allergens.push(allergen);
        }
        updateProfile({ allergens });
    };

    return (
        <ProfileContext.Provider value={{ profile, updateProfile, toggleCondition, toggleAllergen }}>
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfile() {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
}

export default ProfileContext;
