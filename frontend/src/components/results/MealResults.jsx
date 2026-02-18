'use client';

import { useLocale } from '@/context/LocaleContext';
import { Check, Flame, Beef, Wheat, Droplets } from 'lucide-react';

/**
 * Meal analysis results display.
 * Shows total nutrition breakdown + individual food items.
 */
export default function MealResults({ meal }) {
    const { t } = useLocale();

    if (!meal || !meal.foodItems) return null;

    const getNutrientPercentage = (value, factor) => {
        if (meal.totalCalories === 0) return 0;
        return Math.round((value * factor / meal.totalCalories) * 100);
    };

    const proteinPercent = getNutrientPercentage(meal.totalProtein, 4);
    const carbsPercent = getNutrientPercentage(meal.totalCarbs, 4);
    const fatPercent = getNutrientPercentage(meal.totalFat, 9);

    return (
        <div className="meal-results">
            {/* Total Nutrition Card */}
            <div className="section-card meal-totals-card">
                <h3 className="section-title">
                    <Flame size={18} />
                    {t('meal.totalNutrition', 'Total Nutrition')}
                </h3>

                <div className="meal-calories-hero">
                    <span className="meal-calories-number">{Math.round(meal.totalCalories)}</span>
                    <span className="meal-calories-unit">kcal</span>
                </div>

                <div className="meal-macros">
                    {/* Protein */}
                    <div className="meal-macro-row">
                        <div className="meal-macro-label">
                            <Beef size={14} className="macro-icon protein" />
                            <span>{t('meal.protein', 'Protein')}</span>
                        </div>
                        <span className="meal-macro-value">{meal.totalProtein?.toFixed(1)}g ({proteinPercent}%)</span>
                        <div className="meal-macro-bar">
                            <div
                                className="meal-macro-fill protein"
                                style={{ width: `${Math.min(proteinPercent, 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Carbs */}
                    <div className="meal-macro-row">
                        <div className="meal-macro-label">
                            <Wheat size={14} className="macro-icon carbs" />
                            <span>{t('meal.carbs', 'Carbs')}</span>
                        </div>
                        <span className="meal-macro-value">{meal.totalCarbs?.toFixed(1)}g ({carbsPercent}%)</span>
                        <div className="meal-macro-bar">
                            <div
                                className="meal-macro-fill carbs"
                                style={{ width: `${Math.min(carbsPercent, 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Fat */}
                    <div className="meal-macro-row">
                        <div className="meal-macro-label">
                            <Droplets size={14} className="macro-icon fat" />
                            <span>{t('meal.fat', 'Fat')}</span>
                        </div>
                        <span className="meal-macro-value">{meal.totalFat?.toFixed(1)}g ({fatPercent}%)</span>
                        <div className="meal-macro-bar">
                            <div
                                className="meal-macro-fill fat"
                                style={{ width: `${Math.min(fatPercent, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Meal Summary */}
            {meal.mealSummary && (
                <div className="section-card">
                    <p className="meal-summary-text">{meal.mealSummary}</p>
                </div>
            )}

            {/* Food Items Detected */}
            <div className="section-card">
                <h3 className="section-title">
                    <Check size={18} />
                    {t('meal.foodItems', 'Food Items Detected')}
                </h3>

                <div className="meal-food-list">
                    {meal.foodItems.map((item, index) => (
                        <div key={index} className="meal-food-item">
                            <div className="meal-food-header">
                                <div className="meal-food-info">
                                    <div className="meal-food-badge">{index + 1}</div>
                                    <div>
                                        <h4 className="meal-food-name">{item.name}</h4>
                                        <p className="meal-food-qty">{item.quantity}</p>
                                    </div>
                                </div>
                                <div className="meal-food-cal">
                                    <span className="meal-food-cal-num">{Math.round(item.calories)}</span>
                                    <span className="meal-food-cal-unit">kcal</span>
                                </div>
                            </div>

                            <div className="meal-food-macros">
                                <div className="meal-food-macro protein-bg">
                                    <span className="meal-food-macro-label">{t('meal.protein', 'Protein')}</span>
                                    <span className="meal-food-macro-value">{item.protein}g</span>
                                </div>
                                <div className="meal-food-macro carbs-bg">
                                    <span className="meal-food-macro-label">{t('meal.carbs', 'Carbs')}</span>
                                    <span className="meal-food-macro-value">{item.carbs}g</span>
                                </div>
                                <div className="meal-food-macro fat-bg">
                                    <span className="meal-food-macro-label">{t('meal.fat', 'Fat')}</span>
                                    <span className="meal-food-macro-value">{item.fat}g</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Analyzed timestamp */}
            {meal.analyzedAt && (
                <p className="meal-timestamp">
                    {t('meal.analyzedAt', 'Analyzed on')} {new Date(meal.analyzedAt).toLocaleString()}
                </p>
            )}
        </div>
    );
}
