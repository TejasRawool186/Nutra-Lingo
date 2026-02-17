'use client';

import { useLocale } from '@/context/LocaleContext';

/**
 * Parsed nutrition facts table.
 * Clean, mobile-friendly display of nutrition values.
 *
 * @param {{ nutrition: object }} props
 */
export default function NutritionTable({ nutrition = {} }) {
    const { t } = useLocale();

    const rows = [
        { key: 'servingSize', label: t('results.servingSize', 'Serving Size'), bold: true },
        { key: 'calories', label: t('results.calories', 'Calories'), bold: true },
        { key: 'totalFat', label: t('results.totalFat', 'Total Fat') },
        { key: 'saturatedFat', label: t('results.saturatedFat', 'Saturated Fat'), indent: true },
        { key: 'transFat', label: t('results.transFat', 'Trans Fat'), indent: true },
        { key: 'sodium', label: t('results.sodium', 'Sodium') },
        { key: 'totalCarbohydrates', label: 'Total Carbs' },
        { key: 'dietaryFiber', label: 'Dietary Fiber', indent: true },
        { key: 'totalSugars', label: t('results.totalSugars', 'Total Sugars'), indent: true },
        { key: 'protein', label: t('results.protein', 'Protein') },
    ];

    return (
        <div className="nutrition-table section-card">
            <h3 className="section-title">
                📊 {t('results.nutrition', 'Nutrition Facts')}
            </h3>
            <table className="nt-table">
                <tbody>
                    {rows.map(({ key, label, bold, indent }) => {
                        const value = nutrition[key];
                        if (value === undefined || value === null) return null;
                        return (
                            <tr key={key} className={`nt-row ${bold ? 'nt-bold' : ''}`}>
                                <td className={`nt-label ${indent ? 'nt-indent' : ''}`}>
                                    {label}
                                </td>
                                <td className="nt-value">
                                    {typeof value === 'number' ? value : String(value)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
