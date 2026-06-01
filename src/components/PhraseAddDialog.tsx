import { useRef, useState } from 'react';
import { phraseRepo } from '@/lib/repos/phraseRepo';
import { useApp } from '@/lib/store';
import { useT } from '@/lib/i18n';
import { scheduleAutoAnalyze } from '@/lib/persona';

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialText?: string;
}

export default function PhraseAddDialog({ open, onClose, onSaved, initialText }: Props) {
  const [text, setText] = useState(initialText ?? '');
  const [url, setUrl] = useState('');
  const [tagsRaw, setTagsRaw] = useState('');
  const [saving, setSaving] = useState(false);
  const [showExtra, setShowExtra] = useState(false);
  const downOnBackdrop = useRef(false);

  const settings = useApp((s) => s.settings);
  const pushToast = useApp((s) => s.pushToast);
  const t = useT();

  if (!open) return null;

  const onSave = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      pushToast(t('addDialog.enterBody'), 'error');
      return;
    }
    setSaving(true);
    try {
      const tags = tagsRaw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      await phraseRepo.add({ text: trimmed, sourceUrl: url, tags });
      pushToast(t('addDialog.savedToast'), 'success');
      scheduleAutoAnalyze(settings, (r) => {
        if (r.status === 'ok') pushToast(t('addDialog.personaUpdated'), 'success');
      });
      setText('');
      setUrl('');
      setTagsRaw('');
      setShowExtra(false);
      onSaved();
      onClose();
    } catch (err) {
      pushToast(t('addDialog.saveFailed', { msg: (err as Error).message }), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 flex items-end justify-center"
      onPointerDown={(e) => { downOnBackdrop.current = e.target === e.currentTarget; }}
      onClick={(e) => { if (e.target === e.currentTarget && downOnBackdrop.current) onClose(); }}
    >
      {/* Bottom sheet */}
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-t-3xl shadow-soft-lg animate-slide-up">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <h3 className="font-semibold text-slate-900 text-base">{t('addDialog.title')}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-5 pb-6 space-y-3">
          {/* Main textarea */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder={t('addDialog.bodyPlaceholder')}
            className="w-full bg-slate-50 border-[1.5px] border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none transition-colors"
          />

          {/* Extra fields toggle */}
          <button
            type="button"
            onClick={() => setShowExtra((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              className={`w-3.5 h-3.5 transition-transform ${showExtra ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
            {showExtra ? t('addDialog.collapseExtra') : t('addDialog.expandExtra')}
          </button>

          {showExtra && (
            <div className="space-y-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t('addDialog.urlPlaceholder')}
                className="w-full bg-slate-50 border-[1.5px] border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              />
              <input
                value={tagsRaw}
                onChange={(e) => setTagsRaw(e.target.value)}
                placeholder={t('addDialog.tagsPlaceholder')}
                className="w-full bg-slate-50 border-[1.5px] border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              />
            </div>
          )}

          {/* Save button */}
          <button
            onClick={onSave}
            disabled={saving}
            className="w-full py-3 rounded-full bg-wordrobe-gradient text-white font-semibold text-sm shadow-glow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[.98]"
          >
            {saving ? t('addDialog.saving') : t('addDialog.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
