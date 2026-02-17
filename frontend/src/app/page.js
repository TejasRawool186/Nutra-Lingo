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
              <LoadingSpinner
                message={t(`scan.${status === 'extracting' ? 'extracting' : status === 'reasoning' ? 'reasoning' : 'analyzing'}`, 'Analyzing...')}
              />
            )}

            {error && (
              <div className="error-card">
                <p>{error}</p>
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
