import { useEffect, useState } from 'react';
import { personaRepo } from '../lib/repos/personaRepo';
import { GeminiClient } from '../lib/gemini';
import { buildComposePrompt, parseComposeVariants } from '../lib/prompts';
import { useApp } from '../lib/store';
import type { GeminiModel, PersonaMemory } from '../lib/types';

export default function ComposePage() {
  const settings = useApp((s) => s.settings);
  const setSettings = useApp((s) => s.setSettings);
  const pushToast = useApp((s) => s.pushToast);

  const [input, setInput] = useState('');
  const [variantCount, setVariantCount] = useState(2);
  const [streaming, setStreaming] = useState(false);
  const [rawOutput, setRawOutput] = useState('');
  const [persona, setPersona] = useState<PersonaMemory | null>(null);
  const [submittedInput, setSubmittedInput] = useState('');

  useEffect(() => {
    personaRepo.getLatest().then((p) => setPersona(p ?? null));
  }, []);

  const variants = parseComposeVariants(rawOutput);

  const onCompose = async () => {
    const trimmed = input.trim();
    if (!trimmed) {
      pushToast('변환할 문장을 입력하세요.', 'error');
      return;
    }
    setSubmittedInput(trimmed);
    setRawOutput('');
    setStreaming(true);
    try {
      const client = new GeminiClient({ apiKey: settings.apiKey, model: settings.model });
      const prompt = buildComposePrompt(persona, trimmed, variantCount);
      let acc = '';
      for await (const chunk of client.stream(prompt)) {
        acc += chunk;
        setRawOutput(acc);
      }
    } catch (err) {
      pushToast((err as Error).message, 'error');
    } finally {
      setStreaming(false);
    }
  };

  const onCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      pushToast('클립보드에 복사했습니다.', 'success');
    } catch {
      pushToast('복사에 실패했습니다.', 'error');
    }
  };

  const indexChips = ['①', '②', '③', '④', '⑤'];

  return (
    <section className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* No persona notice */}
      {!persona && (
        <div className="rounded-2xl px-4 py-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
          <p className="text-xs text-amber-400/90">
            페르소나가 아직 없습니다. 결과는 일반 톤으로 나옵니다.{' '}
            <span className="text-amber-300">글귀 탭에서 글귀를 모은 뒤 페르소나 탭에서 분석해보세요.</span>
          </p>
        </div>
      )}

      {/* Input area */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/60 overflow-hidden">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={5}
          placeholder="자유롭게 쓰세요…"
          className="w-full bg-transparent px-5 pt-4 pb-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none resize-none leading-relaxed"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onCompose();
          }}
        />

        {/* Controls row */}
        <div className="px-4 pb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <label className="flex items-center gap-1.5">
              모델
              <select
                value={settings.model}
                onChange={(e) => setSettings({ model: e.target.value as GeminiModel })}
                className="bg-zinc-800 border border-zinc-700/60 rounded-lg px-2 py-1 text-xs text-zinc-300 focus:outline-none"
              >
                <option value="gemini-2.5-flash">Flash</option>
                <option value="gemini-2.5-pro">Pro</option>
              </select>
            </label>
            <label className="flex items-center gap-1.5">
              안 수
              <select
                value={variantCount}
                onChange={(e) => setVariantCount(Number(e.target.value))}
                className="bg-zinc-800 border border-zinc-700/60 rounded-lg px-2 py-1 text-xs text-zinc-300 focus:outline-none"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </label>
          </div>

          <button
            onClick={onCompose}
            disabled={streaming || !settings.apiKey}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-wordrobe-gradient shadow-glow-sm disabled:opacity-40 disabled:shadow-none transition-opacity hover:opacity-90 active:opacity-80"
          >
            {streaming ? '변환 중…' : '✨ 멋지게'}
          </button>
        </div>
      </div>

      {/* Chat thread results */}
      {(variants.length > 0 || streaming || submittedInput) && (
        <div className="space-y-3">
          {/* User bubble (original input) */}
          {submittedInput && (
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-zinc-800/80 px-4 py-3">
                <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">{submittedInput}</p>
              </div>
            </div>
          )}

          {/* Streaming waiting state */}
          {streaming && variants.length === 0 && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-tl-sm border border-zinc-700/60 px-4 py-3 bg-zinc-900/60">
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          {/* Variant bubbles */}
          {variants.map((v, idx) => {
            const isLast = idx === variants.length - 1;
            const isPulsing = streaming && isLast;
            return (
              <div key={v.index} className="flex justify-start">
                <div className={`max-w-[85%] relative rounded-2xl rounded-tl-sm overflow-hidden ${isPulsing ? 'animate-pulse' : ''}`}>
                  {/* Gradient border */}
                  <div className="absolute inset-0 bg-wordrobe-gradient opacity-30 rounded-2xl rounded-tl-sm" />
                  <div className="relative bg-zinc-900/90 m-[1px] rounded-2xl rounded-tl-sm px-4 py-3">
                    {/* Index chip */}
                    <span className="inline-block text-xs font-bold bg-clip-text text-transparent bg-wordrobe-gradient mb-2">
                      {indexChips[v.index - 1] ?? v.index}
                    </span>
                    <p className="text-sm text-zinc-100 leading-relaxed whitespace-pre-wrap">{v.text}</p>
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => onCopy(v.text)}
                        className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        복사
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Fallback raw output */}
          {!streaming && rawOutput && variants.length === 0 && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-zinc-900/60 border border-zinc-800/60 px-4 py-3">
                <pre className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">{rawOutput}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
