import { useState } from 'react';
import { useApp } from '../lib/store';
import { settingsRepo } from '../lib/repos/settingsRepo';

export default function ApiKeyStatus() {
  const settings = useApp((s) => s.settings);
  const setSettings = useApp((s) => s.setSettings);
  const pushToast = useApp((s) => s.pushToast);
  const [editing, setEditing] = useState(false);
  const [next, setNext] = useState('');

  if (!settings.apiKey) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-slate-400">
      <span className="hidden sm:inline">키:</span>
      {editing ? (
        <>
          <input
            type="password"
            autoFocus
            value={next}
            onChange={(e) => setNext(e.target.value)}
            placeholder="새 API 키"
            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs w-40"
          />
          <button
            onClick={() => {
              if (!next.trim()) return;
              setSettings({ apiKey: next.trim() });
              pushToast('API 키를 갱신했습니다.', 'success');
              setEditing(false);
              setNext('');
            }}
            className="text-indigo-300 hover:text-indigo-200"
          >
            저장
          </button>
          <button onClick={() => setEditing(false)} className="text-slate-500 hover:text-slate-300">
            취소
          </button>
        </>
      ) : (
        <>
          <code className="text-slate-300">{settingsRepo.maskKey(settings.apiKey)}</code>
          <button onClick={() => setEditing(true)} className="text-slate-500 hover:text-slate-300 underline">
            변경
          </button>
        </>
      )}
    </div>
  );
}
