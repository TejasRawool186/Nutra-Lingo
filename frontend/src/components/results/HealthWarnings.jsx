'use client';

import { useLocale } from '@/context/LocaleContext';

/**
 * Health warnings display.
 * Shows colored warning cards based on severity (high/medium/low).
 *
 * @param {{ warnings: Array<{ type, ingredient, risk, severity }> }} props
 */
export default function HealthWarnings({ warnings = [] }) {
    const { t } = useLocale();

    if (warnings.length === 0) {
        return (
            <div className="warnings-section section-card">
                <h3 className="section-title">✅ {t('results.warnings', 'Health Warnings')}</h3>
                <p className="no-warnings">{t('results.noWarnings', 'No health warnings found!')}</p>
            </div>
        );
    }

    const severityIcon = {
        high: '🔴',
        medium: '🟡',
        low: '🟢'
    };

    return (
        <div className="warnings-section section-card">
            <h3 className="section-title">
                ⚠️ {t('results.warnings', 'Health Warnings')}
            </h3>
            <div className="warnings-list">
                {warnings.map((warning, idx) => (
                    <div key={idx} className={`warning-card severity-${warning.severity}`}>
                        <div className="warning-header">
                            <span className="warning-icon">
                                {severityIcon[warning.severity] || '⚠️'}
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
