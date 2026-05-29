import { useEffect, useState } from 'react';
import { personaRepo } from '../lib/repos/personaRepo';
import { phraseRepo } from '../lib/repos/phraseRepo';
import { analyzeAndUpdatePersona } from '../lib/persona';
import { useApp } from '../lib/store';
import type { PersonaMemory } from '../lib/types';

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function PersonaPage() {
  const [persona, setPersona] = useState<PersonaMemory | null | undefined>(undefined);
  const [phraseCount, setPhraseCount] = useState<number>(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const settings = useApp((s) => s.settings);
  const pushToast = useApp((s) => s.pushToast);

  const load = async () => {
    const [p, count] = await Promise.all([personaRepo.getLatest(), phraseRepo.count()]);
    setPersona(p ?? null);
    setPhraseCount(count);
    if (p) setDraft(p.rawMarkdown);
  };

  useEffect(() => {
    load();
  }, []);

  const onAnalyze = async () => {
    setAnalyzing(true);
    try {
      const r = await analyzeAndUpdatePersona(settings);
      if (r.status === 'skipped') {
        pushToast(r.reason ?? '분석을 건너뛰었습니다.', 'info');
      } else {
        pushToast('페르소나를 갱신했습니다.', 'success');
        await load();
      }
    } catch (err) {
      pushToast((err as Error).message, 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const onSaveEdit = async () => {
    if (!persona) return;
    const next: PersonaMemory = { ...persona, rawMarkdown: draft, updatedAt: Date.now() };
    await personaRepo.save(next);
    setPersona(next);
    setEditing(false);
    pushToast('수동 수정 사항을 저장했습니다.', 'success');
  };

  return (
    <section className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-medium">내 페르소나</h2>
          {persona && (
            <p className="text-xs text-slate-500 mt-1">
              v{persona.version} · 갱신 {formatTime(persona.updatedAt)} · 글귀 {persona.sourcePhraseIds.length}개
            </p>
          )}
          {!persona && (
            <p className="text-xs text-slate-500 mt-1">
              현재 글귀 수: {phraseCount}개 (분석은 {settings.minPhrasesForAnalysis}개 이상부터)
            </p>
          )}
        </div>
        <button
          onClick={onAnalyze}
          disabled={analyzing}
          className="px-3 py-2 text-sm bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-700 text-white rounded-md"
        >
          {analyzing ? '분석 중...' : persona ? '재분석' : '분석'}
        </button>
      </div>

      {persona === undefined && <p className="text-slate-500 text-sm">불러오는 중...</p>}

      {persona === null && (
        <div className="border border-dashed border-slate-800 rounded-lg p-8 text-center text-sm text-slate-400">
          아직 페르소나가 없습니다. 글귀를 모은 뒤 "분석"을 눌러주세요.
        </div>
      )}

      {persona && !editing && (
        <>
          <pre className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-sm text-slate-200 whitespace-pre-wrap font-mono leading-relaxed">
            {persona.rawMarkdown}
          </pre>
          <div className="flex justify-end gap-2 mt-3 text-xs">
            <button
              onClick={() => {
                setDraft(persona.rawMarkdown);
                setEditing(true);
              }}
              className="text-slate-400 hover:text-slate-200"
            >
              편집
            </button>
          </div>
        </>
      )}

      {persona && editing && (
        <>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={20}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm text-slate-100 font-mono leading-relaxed focus:outline-none focus:border-indigo-400"
          />
          <div className="flex justify-end gap-2 mt-3 text-xs">
            <button onClick={() => setEditing(false)} className="text-slate-400 hover:text-slate-200">
              취소
            </button>
            <button onClick={onSaveEdit} className="text-indigo-300 hover:text-indigo-200">
              저장
            </button>
          </div>
        </>
      )}
    </section>
  );
}
