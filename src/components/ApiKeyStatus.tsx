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
    <div className="flex items-center gap-2 text-xs text-zinc-400">
      {editing ? (
        <>
          <input
            type="password"
            autoFocus
            value={next}
            onChange={(e) => setNext(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && next.trim()) {
                setSettings({ apiKey: next.trim() });
                pushToast('API 키를 갱신했습니다.', 'success');
                setEditing(false);
                setNext('');
              }
              if (e.key === 'Escape') setEditing(false);
            }}
            placeholder="새 API 키"
            className="bg-zinc-950 border border-zinc-700/60 rounded-xl px-3 py-1.5 text-xs w-36 focus:outline-none focus:border-pink-500/60 transition-colors"
          />
          <button
            onClick={() => {
              if (!next.trim()) return;
              setSettings({ apiKey: next.trim() });
              pushToast('API 키를 갱신했습니다.', 'success');
              setEditing(false);
              setNext('');
            }}
            className="text-pink-400 hover:text-pink-300 font-medium transition-colors"
          >
            저장
          </button>
          <button onClick={() => setEditing(false)} className="text-zinc-600 hover:text-zinc-400 transition-colors">
            취소
          </button>
        </>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors group"
        >
          <span className="w-2 h-2 rounded-full bg-wordrobe-gradient shadow-glow-sm flex-shrink-0" />
          <code className="text-zinc-400 group-hover:text-zinc-200 transition-colors">{settingsRepo.maskKey(settings.apiKey)}</code>
        </button>
      )}
    </div>
  );
}
