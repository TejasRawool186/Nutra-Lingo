'use client';

import { useLocale } from '@/context/LocaleContext';
import { ShieldAlert, ShieldCheck, AlertCircle, AlertTriangle, Info } from 'lucide-react';

/**
 * Health warnings display with Lucide severity icons.
 *
 * @param {{ warnings: Array<{ type, ingredient, risk, severity }> }} props
 */
export default function HealthWarnings({ warnings = [] }) {
    const { t } = useLocale();

    if (warnings.length === 0) {
        return (
            <div className="warnings-section section-card">
                <h3 className="section-title">
                    <ShieldCheck size={18} color="var(--green-600)" />
                    {t('results.warnings', 'Health Warnings')}
                </h3>
                <p className="no-warnings">
                    <ShieldCheck size={16} />
                    {t('results.noWarnings', 'No health warnings found!')}
                </p>
            </div>
        );
    }

    const SeverityIcon = ({ severity }) => {
        switch (severity) {
            case 'high': return <AlertCircle size={16} color="var(--red-500)" />;
            case 'medium': return <AlertTriangle size={16} color="var(--orange-500)" />;
            case 'low': return <Info size={16} color="var(--yellow-600)" />;
            default: return <AlertTriangle size={16} />;
        }
    };

    return (
        <div className="warnings-section section-card">
            <h3 className="section-title">
                <ShieldAlert size={18} />
                {t('results.warnings', 'Health Warnings')}
            </h3>
            <div className="warnings-list">
                {warnings.map((warning, idx) => (
                    <div key={idx} className={`warning-card severity-${warning.severity}`}>
                        <div className="warning-header">
                            <span className="warning-icon">
                                <SeverityIcon severity={warning.severity} />
                            </span>
                            <span className="warning-type">
                                {warning.type.replace(/_/g, ' ')}
                            </span>
                            <span className={`severity-badge badge-${warning.severity}`}>
                                {t(`severity.${warning.severity}`, warning.severity)}
                            </span>
                        </div>
                        <div className="warning-ingredient">{warning.ingredient}</div>
                        <div className="warning-risk">{warning.risk}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
