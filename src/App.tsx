import { useEffect } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import PhrasesPage from './routes/PhrasesPage';
import PersonaPage from './routes/PersonaPage';
import ComposePage from './routes/ComposePage';
import OnboardingModal from './components/OnboardingModal';
import ToastContainer from './components/Toast';
import ApiKeyStatus from './components/ApiKeyStatus';
import LanguageToggle from './components/LanguageToggle';
import { useApp } from './lib/store';
import { useT } from './lib/i18n';
import { APP_LOGO_SRC } from '@/lib/assets';

const tabs = [
  {
    to: '/phrases',
    labelKey: 'nav.phrases',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    to: '/persona',
    labelKey: 'nav.persona',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    to: '/compose',
    labelKey: 'nav.compose',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    ),
  },
];

export default function App() {
  const hasKey = useApp((s) => s.settings.apiKey.length > 0);
  const t = useT();

  useEffect(() => {
    document.title = t('app.docTitle');
  }, [t]);

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50 text-slate-900">
      <header className="px-5 py-3 flex items-center justify-between gap-4 bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200">
        <div className="flex items-center gap-2 min-w-0">
          <img src={APP_LOGO_SRC} alt="" className="h-8 w-8 object-cover rounded-lg flex-shrink-0" />
          <span className="font-semibold tracking-tight text-slate-900 truncate">{t('app.title')}</span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <ApiKeyStatus />
          <LanguageToggle />
        </div>
      </header>

      <main className="flex-1 pb-20">
        <Routes>
          <Route path="/" element={<Navigate to="/phrases" replace />} />
          <Route path="/phrases" element={<PhrasesPage />} />
          <Route path="/persona" element={<PersonaPage />} />
          <Route path="/compose" element={<ComposePage />} />
        </Routes>
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,.06)]">
        <div className="flex items-stretch max-w-lg mx-auto">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-all ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? 'scale-110 transition-transform' : 'transition-transform'}>
                    {tab.icon}
                  </span>
                  <span>{t(tab.labelKey)}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {!hasKey && <OnboardingModal />}
      <ToastContainer />
    </div>
  );
}
