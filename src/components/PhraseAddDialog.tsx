import { useState } from 'react';
import { phraseRepo } from '../lib/repos/phraseRepo';
import { useApp } from '../lib/store';
import { scheduleAutoAnalyze } from '../lib/persona';

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

  const settings = useApp((s) => s.settings);
  const pushToast = useApp((s) => s.pushToast);

  if (!open) return null;

  const onSave = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      pushToast('본문을 입력해주세요.', 'error');
      return;
    }
    setSaving(true);
    try {
      const tags = tagsRaw
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      await phraseRepo.add({ text: trimmed, sourceUrl: url, tags });
      pushToast('글귀를 저장했습니다.', 'success');
      scheduleAutoAnalyze(settings, (r) => {
        if (r.status === 'ok') pushToast('페르소나가 갱신되었습니다.', 'success');
      });
      setText('');
      setUrl('');
      setTagsRaw('');
      setShowExtra(false);
      onSaved();
      onClose();
    } catch (err) {
      pushToast(`저장 실패: ${(err as Error).message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm z-40 flex items-end justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Bottom sheet */}
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800/60 rounded-t-3xl shadow-glow animate-slide-up">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <h3 className="font-semibold text-zinc-100 text-base">글귀 추가</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors text-lg leading-none"
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
            placeholder="어떤 글이 마음에 들었나요?"
            className="w-full bg-zinc-950 border border-zinc-700/60 rounded-2xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 resize-none transition-colors"
          />

          {/* Extra fields toggle */}
          <button
            type="button"
            onClick={() => setShowExtra((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
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
            {showExtra ? '출처 · 태그 접기' : '출처 URL · 태그 추가 (선택)'}
          </button>

          {showExtra && (
            <div className="space-y-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="출처 URL (https://...)"
                className="w-full bg-zinc-950 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 transition-colors"
              />
              <input
                value={tagsRaw}
                onChange={(e) => setTagsRaw(e.target.value)}
                placeholder="태그 (쉼표로 구분: stoic, 글쓰기)"
                className="w-full bg-zinc-950 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 transition-colors"
              />
            </div>
          )}

          {/* Save button */}
          <button
            onClick={onSave}
            disabled={saving}
            className="w-full py-3 rounded-full bg-wordrobe-gradient text-white font-semibold text-sm shadow-glow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {saving ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
