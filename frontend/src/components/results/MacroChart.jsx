'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useLocale } from '@/context/LocaleContext';
import { Loader2 } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b']; // Green (Carbs), Blue (Protein), Orange (Fat)

export default function MacroChart({ nutrition }) {
    const { t } = useLocale();

    const data = useMemo(() => {
        if (!nutrition) return [];

        // Helper to parse numbers safely (handles strings like "10g")
        const parseValue = (val) => {
            if (typeof val === 'number') return val;
            if (typeof val === 'string') return parseFloat(val) || 0;
            return 0;
        };

        const carbs = parseValue(nutrition.totalCarbohydrates);
        const protein = parseValue(nutrition.protein);
        const fat = parseValue(nutrition.totalFat);

        // If all are zero/missing, return empty
        if (carbs === 0 && protein === 0 && fat === 0) return [];

        return [
            { name: t('results.carbs', 'Carbs'), value: carbs },
            { name: t('results.protein', 'Protein'), value: protein },
            { name: t('results.fat', 'Fat'), value: fat },
        ];
    }, [nutrition, t]);

    if (!nutrition) return null;

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-48 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-slate-400 text-sm">No macro data available for chart</span>
            </div>
        );
    }

    return (
        <div className="w-full h-64 mt-4 mb-6">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value) => `${value}g`}
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '8px',
                            border: 'none',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
