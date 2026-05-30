import { useState } from 'react';
import { useApp } from '../lib/store';

export default function OnboardingModal() {
  const settings = useApp((s) => s.settings);
  const setSettings = useApp((s) => s.setSettings);
  const pushToast = useApp((s) => s.pushToast);

  const [key, setKey] = useState('');
  const [agreed, setAgreed] = useState(false);

  if (settings.apiKey) return null;

  const onSubmit = () => {
    const trimmed = key.trim();
    if (!trimmed) {
      pushToast('API 키를 입력해주세요.', 'error');
      return;
    }
    if (!agreed) {
      pushToast('프라이버시 안내를 확인해주세요.', 'error');
      return;
    }
    setSettings({ apiKey: trimmed });
    pushToast('Wordrobe에 오신 걸 환영합니다.', 'success');
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-6 bg-zinc-950/95 backdrop-blur-sm">
      {/* gradient mesh background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-pink-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-amber-400/8 blur-3xl" />
      </div>

      <div className="relative max-w-md w-full bg-zinc-900/80 backdrop-blur-md border border-zinc-800/60 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-wordrobe-gradient shadow-glow mb-4">
            <span className="text-white font-bold text-2xl leading-none">W</span>
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-1">Wordrobe에 오신 걸 환영합니다</h2>
          <p className="text-sm text-zinc-400">내가 닮고 싶은 말의 옷장.</p>
        </div>

        <p className="text-sm text-zinc-300 mb-6 leading-relaxed">
          변환은 Google AI Studio (Gemini) 를 사용합니다. 본인 API 키를 입력해주세요.
        </p>

        <div className="mb-3">
          <label className="block text-xs font-medium text-zinc-400 mb-2">Gemini API Key</label>
          <input
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder="AIza..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
            className="w-full bg-zinc-950/80 border border-zinc-700/60 rounded-2xl px-5 py-3.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-pink-500/60 focus:ring-1 focus:ring-pink-500/30 transition-all"
          />
        </div>

        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full mt-2 mb-6 py-3 rounded-xl border border-zinc-700/60 text-sm text-zinc-300 hover:text-zinc-100 hover:border-zinc-600 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          AI Studio에서 키 발급받기
        </a>

        <label className="flex items-start gap-3 mb-6 text-xs text-zinc-400 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 accent-pink-500"
          />
          <span className="leading-relaxed">
            본 기기에만 저장되며, 외부 서버로 전송되지 않음을 이해했습니다. (LLM 호출은 브라우저 → Google 직통)
          </span>
        </label>

        <button
          onClick={onSubmit}
          className="w-full py-3.5 rounded-2xl bg-wordrobe-gradient text-white font-semibold text-sm shadow-glow hover:opacity-90 active:opacity-80 transition-opacity"
        >
          시작하기
        </button>
      </div>
    </div>
  );
}
