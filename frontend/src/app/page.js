'use client';

import { LocaleProvider } from '@/context/LocaleContext';
import { ProfileProvider } from '@/context/ProfileContext';
import { useState } from 'react';
import { useAnalysis } from '@/hooks/useAnalysis';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import CameraCapture from '@/components/camera/CameraCapture';
import HealthScoreDial from '@/components/results/HealthScoreDial';
import IngredientList from '@/components/results/IngredientList';
import NutritionTable from '@/components/results/NutritionTable';
import HealthWarnings from '@/components/results/HealthWarnings';
import VoicePlayer from '@/components/voice/VoicePlayer';
import ConfidenceBadge from '@/components/ui/ConfidenceBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ProfileForm from '@/components/profile/ProfileForm';
import { useLocale } from '@/context/LocaleContext';
import { useProfile } from '@/context/ProfileContext';

function ScanPage() {
  const { t, locale } = useLocale();
  const { profile } = useProfile();
  const { status, results, localizedResults, audioUrl, error, analyze, localize, speak, reset } = useAnalysis();
  const [view, setView] = useState('scan'); // scan | results | profile

  const handleCapture = async (base64Image) => {
    const result = await analyze(base64Image, profile);
    if (result) {
      setView('results');
      // Auto-localize if non-English
      if (locale !== 'en') {
        await localize(result.healthReport, locale, profile);
      }
    }
  };

  const handleVoice = async () => {
    const report = localizedResults?.localizedReport || results?.healthReport;
    if (report?.summary) {
      await speak(report.summary, locale);
    }
  };

  const handleNewScan = () => {
    reset();
    setView('scan');
  };

  const activeReport = localizedResults?.localizedReport || results?.healthReport;

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        {/* --- SCAN VIEW --- */}
        {view === 'scan' && (
          <div className="scan-view">
            <div className="scan-hero">
              <h2 className="page-title">{t('scan.title', 'Scan Food Label')}</h2>
              <p className="page-subtitle">{t('scan.subtitle', 'Take a photo or upload an image of any food label')}</p>
            </div>

            {status !== 'idle' && status !== 'done' && status !== 'error' && (
              <div className="analysis-stages">
                <LoadingSpinner
                  message={
                    status === 'extracting' ? '📸 Extracting ingredients from label...'
                      : status === 'reasoning' ? '🧠 Analyzing health impact...'
                        : status === 'localizing' ? '🌐 Translating to your language...'
                          : '🔍 Processing image...'
                  }
                />
                <div className="stage-pills">
                  <span className={`stage-pill ${['extracting', 'reasoning', 'localizing', 'done'].includes(status) ? 'active' : ''}`}>📸 Extract</span>
                  <span className="stage-arrow">→</span>
                  <span className={`stage-pill ${['reasoning', 'localizing', 'done'].includes(status) ? 'active' : ''}`}>🧠 Analyze</span>
                  <span className="stage-arrow">→</span>
                  <span className={`stage-pill ${['localizing', 'done'].includes(status) ? 'active' : ''}`}>🌐 Translate</span>
                  <span className="stage-arrow">→</span>
                  <span className={`stage-pill ${status === 'done' ? 'active' : ''}`}>✅ Done</span>
                </div>
              </div>
            )}

            {error && (
              <div className="error-card">
                <p>❌ {error}</p>
                <button onClick={handleNewScan} className="btn-primary">
                  {t('common.retry', 'Try Again')}
                </button>
              </div>
            )}

            {status === 'idle' && <CameraCapture onCapture={handleCapture} />}
          </div>
        )}

        {/* --- RESULTS VIEW --- */}
        {view === 'results' && results && (
          <div className="results-view">
            <div className="results-header">
              <h2 className="page-title">{t('results.title', 'Analysis Results')}</h2>
              <ConfidenceBadge confidence={results.confidence} />
            </div>

            {/* 🔹 Lingo.dev — Show detected label language */}
            {results.detectedLanguage && results.detectedLanguage !== 'unknown' && (
              <div className="detected-lang-pill">
                🌐 Label detected in: <strong>{results.detectedLanguage.toUpperCase()}</strong>
              </div>
            )}

            {/* 🔹 Lingo.dev — Localize button if non-English and not yet localized */}
            {locale !== 'en' && !localizedResults && status !== 'localizing' && (
              <button
                onClick={() => localize(results.healthReport, locale, profile)}
                className="btn-secondary btn-full"
                style={{ marginBottom: '16px' }}
              >
                🌐 {t('results.translate', `Translate to ${locale.toUpperCase()}`)}
              </button>
            )}
            {status === 'localizing' && (
              <LoadingSpinner message="🌐 Translating report..." />
            )}

            <HealthScoreDial
              score={activeReport?.score || 0}
              verdict={activeReport?.verdict || ''}
            />

            {activeReport?.summary && (
              <div className="summary-card section-card">
                <h3 className="section-title">📝 {t('results.summary', 'Summary')}</h3>
                <p className="summary-text">{activeReport.summary}</p>
              </div>
            )}

            <VoicePlayer
              audioUrl={audioUrl}
              onGenerate={handleVoice}
              isLoading={status === 'translating'}
            />

            <HealthWarnings warnings={activeReport?.warnings || []} />

            <IngredientList
              ingredients={results.extraction?.ingredients || []}
              warnings={activeReport?.warnings || []}
            />

            <NutritionTable nutrition={results.extraction?.nutrition || {}} />

            {results.extraction?.additives?.length > 0 && (
              <div className="additives-section section-card">
                <h3 className="section-title">⚗️ {t('results.additives', 'Additives')}</h3>
                <ul className="additive-list">
                  {results.extraction.additives.map((additive, idx) => (
                    <li key={idx} className="additive-item">{additive}</li>
                  ))}
                </ul>
              </div>
            )}

            <button onClick={handleNewScan} className="btn-primary btn-large btn-full">
              📷 Scan Another
            </button>
          </div>
        )}

        {/* --- PROFILE VIEW --- */}
        {view === 'profile' && (
          <div className="profile-view">
            <ProfileForm />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button
          onClick={() => { handleNewScan(); setView('scan'); }}
          className={`nav-tab ${view === 'scan' ? 'active' : ''}`}
        >
          <span className="nav-icon">📷</span>
          <span className="nav-label">{t('nav.scan', 'Scan')}</span>
        </button>
        <button
          onClick={() => results && setView('results')}
          className={`nav-tab ${view === 'results' ? 'active' : ''} ${!results ? 'disabled' : ''}`}
          disabled={!results}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-label">{t('nav.results', 'Results')}</span>
        </button>
        <button
          onClick={() => setView('profile')}
          className={`nav-tab ${view === 'profile' ? 'active' : ''}`}
        >
          <span className="nav-icon">👤</span>
          <span className="nav-label">{t('nav.profile', 'Profile')}</span>
        </button>
      </nav>
    </div>
  );
}

/**
 * Root page — wrapped in 🔹 Lingo.dev LocaleProvider (CORE layer)
 */
export default function Home() {
  return (
    <LocaleProvider>
      <ProfileProvider>
        <ScanPage />
      </ProfileProvider>
    </LocaleProvider>
  );
}
