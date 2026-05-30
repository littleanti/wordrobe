import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import PhrasesPage from './routes/PhrasesPage';
import PersonaPage from './routes/PersonaPage';
import ComposePage from './routes/ComposePage';
import OnboardingModal from './components/OnboardingModal';
import ToastContainer from './components/Toast';
import ApiKeyStatus from './components/ApiKeyStatus';
import { useApp } from './lib/store';

const tabs = [
  {
    to: '/phrases',
    label: '글귀',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    to: '/persona',
    label: '페르소나',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    to: '/compose',
    label: '변환',
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

  return (
    <div className="min-h-dvh flex flex-col bg-zinc-950">
      <header className="px-5 py-3 flex items-center justify-between gap-4 shadow-sm bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-wordrobe-gradient flex items-center justify-center shadow-glow-sm">
            <span className="text-white font-bold text-sm leading-none">W</span>
          </div>
          <span className="font-semibold tracking-tight text-zinc-100">Wordrobe</span>
        </div>
        <ApiKeyStatus />
      </header>

      <main className="flex-1 pb-20">
        <Routes>
          <Route path="/" element={<Navigate to="/phrases" replace />} />
          <Route path="/phrases" element={<PhrasesPage />} />
          <Route path="/persona" element={<PersonaPage />} />
          <Route path="/compose" element={<ComposePage />} />
        </Routes>
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-30 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800/60">
        <div className="flex items-stretch max-w-lg mx-auto">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-transparent bg-clip-text bg-wordrobe-gradient'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? '[&>svg]:stroke-pink-500' : ''}>
                    {t.icon}
                  </span>
                  <span className={isActive ? 'bg-wordrobe-gradient bg-clip-text text-transparent' : ''}>
                    {t.label}
                  </span>
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
