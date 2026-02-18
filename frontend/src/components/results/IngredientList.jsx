'use client';

import { useLocale } from '@/context/LocaleContext';
import { SEVERITY_COLORS } from '@/lib/constants';
import { FlaskConical, AlertTriangle } from 'lucide-react';

/**
 * Ingredient list with risk highlighting and Lucide icons.
 *
 * @param {{ ingredients: string[], warnings: object[] }} props
 */
export default function IngredientList({ ingredients = [], warnings = [] }) {
    const { t } = useLocale();

    const riskyIngredients = new Set();
    warnings.forEach(w => {
        if (w.ingredient) {
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
                <FlaskConical size={18} />
                {t('results.ingredients', 'Ingredients')}
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
                            {risky && <AlertTriangle size={12} style={{ marginRight: '2px' }} />}
                            {ingredient}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}
