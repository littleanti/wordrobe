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

function extractToneKeywords(markdown: string): string[] {
  const lines = markdown.split('\n');
  const keywords: string[] = [];
  for (const line of lines) {
    const match = line.match(/[-*]\s*\*{0,2}([^:*\n]+?)\*{0,2}(?::|$)/);
    if (match) {
      const word = match[1].trim().split(/\s+/)[0];
      if (word && word.length <= 8) keywords.push(word);
    }
  }
  return [...new Set(keywords)].slice(0, 8);
}

function getInitial(markdown: string): string {
  const tones = extractToneKeywords(markdown);
  if (tones.length > 0) return tones[0].charAt(0);
  return 'W';
}

export default function PersonaPage() {
  const [persona, setPersona] = useState<PersonaMemory | null | undefined>(undefined);
  const [phraseCount, setPhraseCount] = useState<number>(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [fullscreen, setFullscreen] = useState(false);

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
    setFullscreen(false);
    pushToast('수동 수정 사항을 저장했습니다.', 'success');
  };

  const toneKeywords = persona ? extractToneKeywords(persona.rawMarkdown) : [];
  const initial = persona ? getInitial(persona.rawMarkdown) : 'W';

  return (
    <section className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Profile hero row */}
      <div className="flex items-start gap-4">
        {/* Avatar */}
        {persona ? (
          <div className="w-20 h-20 rounded-full bg-wordrobe-gradient flex items-center justify-center shadow-glow flex-shrink-0">
            <span className="text-white font-bold text-2xl leading-none">{initial}</span>
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center flex-shrink-0">
            <span className="text-zinc-600 text-2xl font-bold">W</span>
          </div>
        )}

        {/* Meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-zinc-100">내 페르소나</h2>
            <button
              onClick={onAnalyze}
              disabled={analyzing}
              className="flex items-center gap-1 text-sm font-medium bg-clip-text text-transparent bg-wordrobe-gradient disabled:opacity-50"
            >
              {analyzing ? (
                <span className="text-zinc-400 text-xs">분석 중...</span>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="url(#grad1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <defs>
                      <linearGradient id="grad1" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="50%" stopColor="#f43f5e" />
                        <stop offset="100%" stopColor="#fb923c" />
                      </linearGradient>
                    </defs>
                    <path d="M23 4v6h-6" />
                    <path d="M1 20v-6h6" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                  <span>{persona ? '재분석' : '분석'}</span>
                </>
              )}
            </button>
          </div>

          {persona ? (
            <p className="text-xs text-zinc-500 mt-1">
              v{persona.version} · 갱신 {formatTime(persona.updatedAt)} · 글귀 {persona.sourcePhraseIds.length}개
            </p>
          ) : (
            <p className="text-xs text-zinc-500 mt-1">
              현재 글귀 {phraseCount}개 (분석은 {settings.minPhrasesForAnalysis}개 이상부터)
            </p>
          )}
        </div>
      </div>

      {/* Story highlights (tone keywords) */}
      {toneKeywords.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
          {toneKeywords.map((kw, i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="w-14 h-14 rounded-full p-[2px] bg-wordrobe-gradient">
                <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center">
                  <span className="text-xs font-medium text-zinc-200 text-center leading-tight px-1">{kw}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading */}
      {persona === undefined && (
        <p className="text-zinc-500 text-sm text-center py-8">불러오는 중...</p>
      )}

      {/* Empty state */}
      {persona === null && (
        <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-10 text-center space-y-2">
          <p className="text-zinc-400 text-sm font-medium">글귀를 모으면 페르소나가 만들어집니다</p>
          <p className="text-zinc-600 text-xs">현재 글귀 {phraseCount}개</p>
        </div>
      )}

      {/* Persona card - view mode */}
      {persona && !editing && (
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/60 overflow-hidden">
          <div className="px-5 py-4">
            <div className="prose prose-invert prose-sm max-w-none">
              {persona.rawMarkdown.split('\n').map((line, i) => {
                if (line.startsWith('## ')) {
                  return (
                    <div key={i}>
                      {i > 0 && <div className="border-t border-zinc-800/60 my-3" />}
                      <h3 className="text-sm font-semibold text-zinc-300 mt-0 mb-2">{line.replace(/^##\s*/, '')}</h3>
                    </div>
                  );
                }
                if (line.startsWith('# ')) {
                  return <h2 key={i} className="text-base font-bold text-zinc-200 mt-0 mb-2">{line.replace(/^#\s*/, '')}</h2>;
                }
                if (line.startsWith('- ') || line.startsWith('* ')) {
                  return <p key={i} className="text-sm text-zinc-300 leading-relaxed ml-2">• {line.replace(/^[-*]\s*/, '')}</p>;
                }
                if (line.trim() === '') return <div key={i} className="h-1" />;
                return <p key={i} className="text-sm text-zinc-300 leading-relaxed">{line}</p>;
              })}
            </div>
          </div>
          <div className="px-5 py-3 border-t border-zinc-800/60 flex justify-end">
            <button
              onClick={() => { setDraft(persona.rawMarkdown); setEditing(true); }}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              편집
            </button>
          </div>
        </div>
      )}

      {/* Persona card - edit mode (inline) */}
      {persona && editing && !fullscreen && (
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/60 overflow-hidden">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={16}
            className="w-full bg-transparent px-5 py-4 text-sm text-zinc-100 font-mono leading-relaxed focus:outline-none resize-none"
          />
          <div className="px-5 py-3 border-t border-zinc-800/60 flex justify-between items-center">
            <button
              onClick={() => setFullscreen(true)}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              전체화면
            </button>
            <div className="flex gap-3">
              <button onClick={() => setEditing(false)} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                취소
              </button>
              <button onClick={onSaveEdit} className="text-xs bg-clip-text text-transparent bg-wordrobe-gradient font-medium hover:opacity-80 transition-opacity">
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen edit modal */}
      {persona && editing && fullscreen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60">
            <span className="text-sm font-medium text-zinc-300">페르소나 편집</span>
            <div className="flex gap-3">
              <button onClick={() => setFullscreen(false)} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                축소
              </button>
              <button onClick={() => { setEditing(false); setFullscreen(false); }} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                취소
              </button>
              <button onClick={onSaveEdit} className="text-xs bg-clip-text text-transparent bg-wordrobe-gradient font-medium hover:opacity-80 transition-opacity">
                저장
              </button>
            </div>
          </div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="flex-1 w-full bg-transparent px-5 py-4 text-sm text-zinc-100 font-mono leading-relaxed focus:outline-none resize-none"
            autoFocus
          />
        </div>
      )}
    </section>
  );
}
