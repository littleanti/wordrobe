import { useEffect, useState } from 'react';
import { personaRepo } from '../lib/repos/personaRepo';
import { GeminiClient } from '../lib/gemini';
import { buildComposePrompt, parseComposeVariants } from '../lib/prompts';
import { useApp } from '../lib/store';
import { useT, resolveContentLocale } from '../lib/i18n';
import type { PersonaMemory } from '../lib/types';

export default function ComposePage() {
  const settings = useApp((s) => s.settings);
  const pushToast = useApp((s) => s.pushToast);
  const t = useT();

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
      pushToast(t('compose.enterText'), 'error');
      return;
    }
    setSubmittedInput(trimmed);
    setRawOutput('');
    setStreaming(true);
    try {
      const client = new GeminiClient({ apiKey: settings.apiKey });
      const prompt = buildComposePrompt(persona, trimmed, variantCount, resolveContentLocale(settings));
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
      pushToast(t('compose.copiedToast'), 'success');
    } catch {
      pushToast(t('compose.copyFailed'), 'error');
    }
  };

  const indexChips = ['①', '②', '③', '④', '⑤'];

  return (
    <section className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* No persona notice */}
      {!persona && (
        <div className="rounded-2xl px-4 py-3 bg-amber-50 border border-amber-200">
          <p className="text-xs text-amber-700">
            {t('compose.noPersona1')}{' '}
            <span className="text-amber-600 font-medium">{t('compose.noPersona2')}</span>
          </p>
        </div>
      )}

      {/* Input area */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-soft-sm">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={5}
          placeholder={t('compose.inputPlaceholder')}
          className="w-full bg-transparent px-5 pt-4 pb-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onCompose();
          }}
        />

        {/* Controls row */}
        <div className="px-4 pb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <label className="flex items-center gap-1.5">
              {t('compose.count')}
              <select
                value={variantCount}
                onChange={(e) => setVariantCount(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
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
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-wordrobe-gradient shadow-glow-sm disabled:opacity-40 disabled:shadow-none transition-all hover:opacity-90 active:scale-[.98]"
          >
            {streaming ? t('compose.transforming') : t('compose.submit')}
          </button>
        </div>
      </div>

      {/* Chat thread results */}
      {(variants.length > 0 || streaming || submittedInput) && (
        <div className="space-y-3">
          {/* User bubble (original input) */}
          {submittedInput && (
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-slate-100 px-4 py-3">
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{submittedInput}</p>
              </div>
            </div>
          )}

          {/* Streaming waiting state */}
          {streaming && variants.length === 0 && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-tl-sm border border-slate-200 px-4 py-3 bg-white shadow-soft-sm">
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse [animation-delay:300ms]" />
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
                  <div className="absolute inset-0 bg-wordrobe-gradient opacity-40 rounded-2xl rounded-tl-sm" />
                  <div className="relative bg-white m-[1.5px] rounded-2xl rounded-tl-sm px-4 py-3">
                    {/* Index chip */}
                    <span className="inline-block text-xs font-bold text-indigo-600 mb-2">
                      {indexChips[v.index - 1] ?? v.index}
                    </span>
                    <p className="text-sm text-slate-900 leading-relaxed whitespace-pre-wrap">{v.text}</p>
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => onCopy(v.text)}
                        className="text-xs text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        {t('common.copy')}
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
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white border border-slate-200 px-4 py-3 shadow-soft-sm">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{rawOutput}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
