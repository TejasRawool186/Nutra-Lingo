'use client';

import { useState } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { getAlternatives } from '@/lib/api';
import { Sparkles, Leaf, ArrowRight, Loader2 } from 'lucide-react';

/**
 * Healthier alternatives section — powered by Gemini.
 * Shows 2-3 alternatives + a health tip after product scan.
 */
export default function HealthierAlternatives({ extraction }) {
    const { t } = useLocale();
    const [alternatives, setAlternatives] = useState(null);
    const [tip, setTip] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fetched, setFetched] = useState(false);

    const handleFetch = async () => {
        if (fetched) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getAlternatives(extraction);
            setAlternatives(data.alternatives || []);
            setTip(data.tip || '');
            setFetched(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="section-card alternatives-section">
            <h3 className="section-title">
                <Sparkles size={18} />
                {t('alternatives.title', 'Healthier Alternatives')}
            </h3>

            {!fetched && !loading && (
                <button onClick={handleFetch} className="btn-alternatives">
                    <Leaf size={16} />
                    {t('alternatives.find', 'Find Healthier Options')}
                    <ArrowRight size={14} />
                </button>
            )}

            {loading && (
                <div className="alternatives-loading">
                    <Loader2 size={20} className="spin" />
                    <span>{t('alternatives.loading', 'Finding healthier options...')}</span>
                </div>
            )}

            {error && (
                <p className="alternatives-error">{error}</p>
            )}

            {fetched && alternatives && (
                <>
                    <div className="alternatives-list">
                        {alternatives.map((alt, idx) => (
                            <div key={idx} className="alternative-card">
                                <div className="alt-header">
                                    <div className="alt-badge">{idx + 1}</div>
                                    <h4 className="alt-name">{alt.name}</h4>
                                </div>
                                <p className="alt-reason">{alt.reason}</p>
                                <span className="alt-benefit-chip">
                                    <Leaf size={12} />
                                    {alt.keyBenefit}
                                </span>
                            </div>
                        ))}
                    </div>

                    {tip && (
                        <div className="alt-tip">
                            <span className="alt-tip-icon">💡</span>
                            <p>{tip}</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
