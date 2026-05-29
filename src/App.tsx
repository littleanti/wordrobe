import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import PhrasesPage from './routes/PhrasesPage';
import PersonaPage from './routes/PersonaPage';
import ComposePage from './routes/ComposePage';
import OnboardingModal from './components/OnboardingModal';
import ToastContainer from './components/Toast';
import ApiKeyStatus from './components/ApiKeyStatus';
import { useApp } from './lib/store';

const tabs = [
  { to: '/phrases', label: '글귀' },
  { to: '/persona', label: '페르소나' },
  { to: '/compose', label: '변환' },
];

export default function App() {
  const hasKey = useApp((s) => s.settings.apiKey.length > 0);

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">👔</span>
          <h1 className="font-semibold tracking-tight">Wordrobe</h1>
        </div>
        <ApiKeyStatus />
      </header>

      <nav className="flex border-b border-slate-800">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `flex-1 text-center py-3 text-sm transition-colors ${
                isActive
                  ? 'text-slate-100 border-b-2 border-indigo-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </nav>

      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<Navigate to="/phrases" replace />} />
          <Route path="/phrases" element={<PhrasesPage />} />
          <Route path="/persona" element={<PersonaPage />} />
          <Route path="/compose" element={<ComposePage />} />
        </Routes>
      </main>

      <footer className="px-6 py-3 text-xs text-slate-500 border-t border-slate-800">
        모든 데이터는 이 기기에만 저장됩니다. LLM 호출은 브라우저 → Google AI Studio 직통.
      </footer>

      {!hasKey && <OnboardingModal />}
      <ToastContainer />
    </div>
  );
}
