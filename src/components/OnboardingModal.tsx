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
    <div className="fixed inset-0 bg-slate-950/95 z-40 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
        <div className="text-center mb-5">
          <div className="text-4xl mb-2">👔</div>
          <h2 className="text-lg font-semibold">Wordrobe에 오신 걸 환영합니다</h2>
          <p className="text-xs text-slate-400 mt-1">내가 닮고 싶은 말의 옷장.</p>
        </div>

        <p className="text-sm text-slate-300 mb-3">
          변환은 Google AI Studio (Gemini) 를 사용합니다. 본인 API 키를 입력해주세요.
        </p>

        <label className="block text-xs text-slate-400 mb-1">Gemini API Key</label>
        <input
          type="password"
          autoComplete="off"
          spellCheck={false}
          placeholder="AIza..."
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-400"
        />

        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noreferrer"
          className="inline-block text-xs text-indigo-300 hover:text-indigo-200 mt-2"
        >
          AI Studio에서 키 발급받기 ↗
        </a>

        <label className="flex items-start gap-2 mt-4 text-xs text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            본 기기에만 저장되며, 외부 서버로 전송되지 않음을 이해했습니다. (LLM 호출은 브라우저 → Google 직통)
          </span>
        </label>

        <button
          onClick={onSubmit}
          className="w-full mt-5 bg-indigo-500 hover:bg-indigo-400 text-white font-medium py-2 rounded-md transition-colors"
        >
          시작하기
        </button>
      </div>
    </div>
  );
}
