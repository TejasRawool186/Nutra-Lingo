'use client';

import { LocaleProvider } from '@/context/LocaleContext';
import { ProfileProvider } from '@/context/ProfileContext';
import { useState } from 'react';
import { useAnalysis } from '@/hooks/useAnalysis';
import { useMealAnalysis } from '@/hooks/useMealAnalysis';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import CameraCapture from '@/components/camera/CameraCapture';
import HealthScoreDial from '@/components/results/HealthScoreDial';
import IngredientList from '@/components/results/IngredientList';
import NutritionTable from '@/components/results/NutritionTable';
import MealResults from '@/components/results/MealResults';
import HealthierAlternatives from '@/components/results/HealthierAlternatives';
import HealthWarnings from '@/components/results/HealthWarnings';
import VoicePlayer from '@/components/voice/VoicePlayer';
import ConfidenceBadge from '@/components/ui/ConfidenceBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ProfileForm from '@/components/profile/ProfileForm';
import { useLocale } from '@/context/LocaleContext';
import { useProfile } from '@/context/ProfileContext';
import ChatAssistant from '@/components/chat/ChatAssistant';
import {
  Sparkles, Camera, Brain, Globe, Search, CheckCircle2,
  AlertCircle, FileText, FlaskConical, ScanLine, BarChart3,
  User, Languages, UtensilsCrossed, Flame, Lightbulb
} from 'lucide-react';

function ScanPage() {
  const { t, locale } = useLocale();
  const { profile } = useProfile();
  const { status, results, localizedResults, error, analyze, localize, speak, reset } = useAnalysis();
  const { status: mealStatus, mealResults, localizedMealResults, error: mealError, analyze: analyzeMealPhoto, localize: localizeMeal, reset: resetMeal } = useMealAnalysis();
  const [view, setView] = useState('scan'); // scan | results | profile | meal

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

  const handleMealCapture = async (base64Image) => {
    const result = await analyzeMealPhoto(base64Image);
    if (result) {
      setView('meal-results');
      // Auto-localize if non-English
      if (locale !== 'en') {
        await localizeMeal(result, locale);
      }
    }
  };

  const handleNewMeal = () => {
    resetMeal();
    setView('meal');
  };

  const activeReport = localizedResults?.localizedReport || results?.healthReport;

  return (
    <div className="app-container">
      {/* Floating decorative food icons */}
      <div className="floating-decorations">
        <span className="float-icon">🍎</span>
        <span className="float-icon">🥕</span>
        <span className="float-icon">🥬</span>
        <span className="float-icon">🍋</span>
        <span className="float-icon">🫐</span>
        <span className="float-icon">🥑</span>
        <span className="float-icon">🍇</span>
        <span className="float-icon">🥦</span>
        <span className="float-icon">🍊</span>
        <span className="float-icon">🌽</span>
        <span className="float-icon">🥤</span>
        <span className="float-icon">🥗</span>
        <span className="float-icon">🍔</span>
        <span className="float-icon">🍗</span>
        <span className="float-icon">🍟</span>
        <span className="float-icon">🥓</span>
        <span className="float-icon">🍧</span>
        <span className="float-icon">🍨</span>
        <span className="float-icon">🧁</span>
        <span className="float-icon">🥞</span>
        <span className="float-icon">🧋</span>
        <span className="float-icon">🥖</span>
        <span className="float-icon">🍞</span>
        <span className="float-icon">🥐</span>
        <span className="float-icon">🥨</span>
        <span className="float-icon">🥪</span>
        <span className="float-icon">🥯</span>
      </div>
      {/* Blur orbs for depth */}
      <div className="blur-orb blur-orb-1" />
      <div className="blur-orb blur-orb-2" />

      <Header />

      <main className="main-content">
        {/* --- SCAN VIEW --- */}
        {view === 'scan' && (
          <div className="scan-view">
            <div className="scan-hero">
              <div className="hero-badge">
                <Sparkles size={14} />
                AI-Powered Analysis
              </div>
              <h2 className="page-title">{t('scan.title', 'Scan Food Label')}</h2>
              <p className="page-subtitle">{t('scan.subtitle', 'Take a photo or upload an image of any food label')}</p>
            </div>

            {status !== 'idle' && status !== 'done' && status !== 'error' && (
              <div className="analysis-stages">
                <LoadingSpinner
                  message={
                    status === 'extracting' ? 'Extracting ingredients from label...'
                      : status === 'reasoning' ? 'Analyzing health impact...'
                        : status === 'localizing' ? 'Translating to your language...'
                          : 'Processing image...'
                  }
                />
                <div className="stage-pills">
                  <span className={`stage-pill ${['extracting', 'reasoning', 'localizing', 'done'].includes(status) ? 'active' : ''}`}>
                    <Camera size={12} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />Extract
                  </span>
                  <span className="stage-arrow">→</span>
                  <span className={`stage-pill ${['reasoning', 'localizing', 'done'].includes(status) ? 'active' : ''}`}>
                    <Brain size={12} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />Analyze
                  </span>
                  <span className="stage-arrow">→</span>
                  <span className={`stage-pill ${['localizing', 'done'].includes(status) ? 'active' : ''}`}>
                    <Globe size={12} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />Translate
                  </span>
                  <span className="stage-arrow">→</span>
                  <span className={`stage-pill ${status === 'done' ? 'active' : ''}`}>
                    <CheckCircle2 size={12} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />Done
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="error-card">
                <p><AlertCircle size={16} style={{ display: 'inline', verticalAlign: '-3px', marginRight: '6px' }} />{error}</p>
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

            {/* Detected label language */}
            {results.detectedLanguage && results.detectedLanguage !== 'unknown' && (
              <div className="detected-lang-pill">
                <Globe size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
                Label detected in: <strong>{results.detectedLanguage.toUpperCase()}</strong>
              </div>
            )}

            {/* Localize button if non-English and not yet localized */}
            {locale !== 'en' && !localizedResults && status !== 'localizing' && (
              <button
                onClick={() => localize(results.healthReport, locale, profile)}
                className="btn-secondary btn-full"
                style={{ marginBottom: '16px' }}
              >
                <Languages size={16} />
                {t('results.translate', `Translate to ${locale.toUpperCase()}`)}
              </button>
            )}
            {status === 'localizing' && (
              <LoadingSpinner message="Translating report..." />
            )}

            <HealthScoreDial
              score={activeReport?.score || 0}
              verdict={activeReport?.verdict || ''}
            />

            {activeReport?.summary && (
              <div className="summary-card section-card">
                <h3 className="section-title">
                  <FileText size={18} />
                  {t('results.summary', 'Summary')}
                </h3>
                <p className="summary-text">{activeReport.summary}</p>

                {activeReport.cultural_analogy && (
                  <div className="cultural-analogy mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 rounded-r-md">
                    <div className="flex items-center gap-2 mb-1 text-amber-700 dark:text-amber-400 font-semibold text-sm">
                      <Lightbulb size={16} />
                      <span>{t('results.analogy', 'Perspective')}</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                      "{activeReport.cultural_analogy}"
                    </p>
                  </div>
                )}
              </div>
            )}

            <VoicePlayer
              text={activeReport?.voice_script || activeReport?.summary || ''}
            />

            <HealthWarnings warnings={activeReport?.warnings || []} />

            <IngredientList
              ingredients={results.extraction?.ingredients || []}
              warnings={activeReport?.warnings || []}
            />

            <NutritionTable nutrition={results.extraction?.nutrition || {}} />

            {results.extraction?.additives?.length > 0 && (
              <div className="additives-section section-card">
                <h3 className="section-title">
                  <FlaskConical size={18} />
                  {t('results.additives', 'Additives')}
                </h3>
                <ul className="additive-list">
                  {results.extraction.additives.map((additive, idx) => (
                    <li key={idx} className="additive-item">{additive}</li>
                  ))}
                </ul>
              </div>
            )}

            <HealthierAlternatives extraction={results.extraction} />

            <button onClick={handleNewScan} className="btn-primary btn-large btn-full">
              <ScanLine size={20} />
              Scan Another
            </button>
          </div>
        )}

        {/* --- MEAL VIEW (capture) --- */}
        {view === 'meal' && (
          <div className="scan-view">
            <div className="scan-hero">
              <div className="hero-badge">
                <Flame size={14} />
                Gemini AI Analysis
              </div>
              <h2 className="page-title">{t('meal.title', 'Analyze Your Meal')}</h2>
              <p className="page-subtitle">{t('meal.subtitle', 'Take a photo of any dish to get instant nutritional breakdown')}</p>
            </div>

            {mealStatus === 'analyzing' && (
              <div className="analysis-stages">
                <LoadingSpinner message={t('meal.analyzing', 'Analyzing your meal with Gemini AI...')} />
              </div>
            )}

            {mealError && (
              <div className="error-card">
                <p><AlertCircle size={16} style={{ display: 'inline', verticalAlign: '-3px', marginRight: '6px' }} />{mealError}</p>
                <button onClick={handleNewMeal} className="btn-primary">
                  {t('common.retry', 'Try Again')}
                </button>
              </div>
            )}

            {mealStatus === 'idle' && <CameraCapture onCapture={handleMealCapture} />}
          </div>
        )}

        {/* --- MEAL RESULTS VIEW --- */}
        {view === 'meal-results' && mealResults && (
          <div className="results-view">
            <div className="results-header">
              <h2 className="page-title">{t('meal.resultsTitle', 'Meal Analysis')}</h2>
            </div>

            {/* Localize button for Meal */}
            {locale !== 'en' && !localizedMealResults && mealStatus !== 'localizing' && (
              <button
                onClick={() => localizeMeal(mealResults, locale)}
                className="btn-secondary btn-full"
                style={{ marginBottom: '16px' }}
              >
                <Languages size={16} />
                {t('results.translate', `Translate to ${locale.toUpperCase()}`)}
              </button>
            )}
            {mealStatus === 'localizing' && (
              <LoadingSpinner message="Translating meal info..." />
            )}

            <MealResults meal={localizedMealResults || mealResults} />

            <VoicePlayer
              text={(localizedMealResults || mealResults).mealSummary || (localizedMealResults || mealResults).foodItems?.map(item => `${item.name}: ${Math.round(item.calories)} calories`).join('. ') || ''}
            />

            <button onClick={handleNewMeal} className="btn-primary btn-large btn-full">
              <UtensilsCrossed size={20} />
              {t('meal.analyzeAnother', 'Analyze Another Meal')}
            </button>
          </div>
        )}

        {/* --- PROFILE VIEW --- */}
        {view === 'profile' && (
          <div className="profile-view">
            <ProfileForm />
          </div>
        )}

        {/* Chat Assistant - Always available if we have context */}
        {(results || mealResults) && (
          <ChatAssistant contextData={results?.healthReport || mealResults} />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button
          onClick={() => { handleNewScan(); setView('scan'); }}
          className={`nav-tab ${view === 'scan' ? 'active' : ''}`}
        >
          <span className="nav-icon"><ScanLine size={22} /></span>
          <span className="nav-label">{t('nav.scan', 'Scan')}</span>
        </button>
        <button
          onClick={() => results && setView('results')}
          className={`nav-tab ${view === 'results' ? 'active' : ''} ${!results ? 'disabled' : ''}`}
          disabled={!results}
        >
          <span className="nav-icon"><BarChart3 size={22} /></span>
          <span className="nav-label">{t('nav.results', 'Results')}</span>
        </button>
        <button
          onClick={() => { if (mealStatus !== 'analyzing') { resetMeal(); setView('meal'); } }}
          className={`nav-tab ${view === 'meal' || view === 'meal-results' ? 'active' : ''}`}
        >
          <span className="nav-icon"><UtensilsCrossed size={22} /></span>
          <span className="nav-label">{t('nav.meal', 'Meal')}</span>
        </button>
        <button
          onClick={() => setView('profile')}
          className={`nav-tab ${view === 'profile' ? 'active' : ''}`}
        >
          <span className="nav-icon"><User size={22} /></span>
          <span className="nav-label">{t('nav.profile', 'Profile')}</span>
        </button>
      </nav>
    </div>
  );
}

/**
 * Root page — wrapped in Lingo.dev LocaleProvider (CORE layer)
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
