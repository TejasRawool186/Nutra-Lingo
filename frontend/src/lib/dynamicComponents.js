import dynamic from 'next/dynamic';

/**
 * Lazy-loaded component imports for code splitting.
 * Components are loaded only when needed, reducing initial bundle size.
 */

// Results Components (loaded when viewing scan results)
export const HealthScoreDial = dynamic(
    () => import('@/components/results/HealthScoreDial'),
    { loading: () => <LoadingSpinner /> }
);

export const IngredientList = dynamic(
    () => import('@/components/results/IngredientList'),
    { loading: () => <LoadingSpinner /> }
);

export const MacroChart = dynamic(
    () => import('@/components/results/MacroChart'),
    { loading: () => <LoadingSpinner /> }
);

export const NutritionTable = dynamic(
    () => import('@/components/results/NutritionTable'),
    { loading: () => <LoadingSpinner /> }
);

export const HealthWarnings = dynamic(
    () => import('@/components/results/HealthWarnings'),
    { loading: () => <LoadingSpinner /> }
);

export const HealthierAlternatives = dynamic(
    () => import('@/components/results/HealthierAlternatives'),
    { loading: () => <LoadingSpinner /> }
);

export const MealResults = dynamic(
    () => import('@/components/results/MealResults'),
    { loading: () => <LoadingSpinner /> }
);

// Profile Components (loaded when accessing profile view)
export const ProfileForm = dynamic(
    () => import('@/components/profile/ProfileForm'),
    { loading: () => <LoadingSpinner /> }
);

// Chat Components (loaded when opening chat)
export const ChatAssistant = dynamic(
    () => import('@/components/chat/ChatAssistant'),
    { loading: () => <LoadingSpinner /> }
);

// Camera Components (loaded when accessing camera)
export const CameraCapture = dynamic(
    () => import('@/components/camera/CameraCapture'),
    { loading: () => <LoadingSpinner /> }
);

// UI Components (small, always load)
// These are used frequently, so we import them normally
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const dynamicComponents = {
    HealthScoreDial,
    IngredientList,
    MacroChart,
    NutritionTable,
    HealthWarnings,
    HealthierAlternatives,
    MealResults,
    ProfileForm,
    ChatAssistant,
    CameraCapture
};
