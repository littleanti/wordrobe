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
      onSaved();
      onClose();
    } catch (err) {
      pushToast(`저장 실패: ${(err as Error).message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-30 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">글귀 추가</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xl leading-none">
            ×
          </button>
        </div>

        <label className="block text-xs text-slate-400 mb-1">본문</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="멋지다고 느낀 글귀를 붙여넣거나 입력하세요."
          className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-400 resize-y"
        />

        <label className="block text-xs text-slate-400 mb-1 mt-3">출처 URL (선택)</label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-400"
        />

        <label className="block text-xs text-slate-400 mb-1 mt-3">태그 (쉼표로 구분, 선택)</label>
        <input
          value={tagsRaw}
          onChange={(e) => setTagsRaw(e.target.value)}
          placeholder="stoic, 글쓰기"
          className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-400"
        />

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-300 hover:text-slate-100"
            disabled={saving}
          >
            취소
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-700 text-white text-sm rounded-md"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
