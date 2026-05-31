import { useState } from 'react';
import { useApp } from '../lib/store';
import { useT } from '../lib/i18n';

export default function ApiKeyStatus() {
  const settings = useApp((s) => s.settings);
  const setSettings = useApp((s) => s.setSettings);
  const pushToast = useApp((s) => s.pushToast);
  const t = useT();
  const [editing, setEditing] = useState(false);
  const [next, setNext] = useState('');

  if (!settings.apiKey) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-slate-500">
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
                pushToast(t('toast.apiKeyUpdated'), 'success');
                setEditing(false);
                setNext('');
              }
              if (e.key === 'Escape') setEditing(false);
            }}
            placeholder={t('apiStatus.newKeyPlaceholder')}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs w-36 text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            onClick={() => {
              if (!next.trim()) return;
              setSettings({ apiKey: next.trim() });
              pushToast(t('toast.apiKeyUpdated'), 'success');
              setEditing(false);
              setNext('');
            }}
            className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors"
          >
            {t('common.save')}
          </button>
          <button onClick={() => setEditing(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
            {t('common.cancel')}
          </button>
        </>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 hover:text-slate-700 transition-colors group"
          title={t('apiStatus.changeKey')}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
          <span className="text-slate-500 group-hover:text-slate-700 transition-colors font-medium">{t('apiStatus.ready')}</span>
        </button>
      )}
    </div>
  );
}
