'use client';

import { useLocale } from '@/context/LocaleContext';
import { SEVERITY_COLORS } from '@/lib/constants';

/**
 * Ingredient list with risk highlighting.
 * Risky ingredients are flagged with red/emerald visual markers.
 *
 * @param {{ ingredients: string[], warnings: object[] }} props
 */
export default function IngredientList({ ingredients = [], warnings = [] }) {
    const { t } = useLocale();

    // Build a set of risky ingredients from warnings
    const riskyIngredients = new Set();
    warnings.forEach(w => {
        if (w.ingredient) {
            // Extract key terms from the warning ingredient string
            const terms = w.ingredient.toLowerCase().split(/[\s\/,]+/);
            terms.forEach(term => {
                if (term.length > 2) riskyIngredients.add(term);
            });
        }
    });

    const isRisky = (ingredient) => {
        const lower = ingredient.toLowerCase();
        for (const term of riskyIngredients) {
            if (lower.includes(term)) return true;
        }
        return false;
    };

    return (
        <div className="ingredient-list section-card">
            <h3 className="section-title">
                🧪 {t('results.ingredients', 'Ingredients')}
            </h3>
            <div className="ingredient-chips">
                {ingredients.map((ingredient, idx) => {
                    const risky = isRisky(ingredient);
                    return (
                        <span
                            key={idx}
                            className={`ingredient-chip ${risky ? 'risky' : 'safe'}`}
                            title={risky ? 'Flagged in health warnings' : ''}
                        >
                            {risky && <span className="risk-dot">⚠️</span>}
                            {ingredient}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}
