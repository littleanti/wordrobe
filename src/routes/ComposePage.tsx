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

  return (
    <section className="max-w-2xl mx-auto">
      <label className="block text-xs text-slate-400 mb-1">대충 쓴 문장</label>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={4}
        placeholder="여기에 자유롭게 쓰세요. 페르소나 톤으로 다듬어드립니다."
        className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-400 resize-y"
      />

      <div className="flex items-center justify-between mt-3 mb-3">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <label className="flex items-center gap-2">
            모델
            <select
              value={settings.model}
              onChange={(e) => setSettings({ model: e.target.value as GeminiModel })}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs"
            >
              <option value="gemini-2.5-flash">Flash</option>
              <option value="gemini-2.5-pro">Pro</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            안 수
            <select
              value={variantCount}
              onChange={(e) => setVariantCount(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs"
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
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-700 text-white text-sm rounded-md"
        >
          {streaming ? '변환 중...' : '✨ 멋지게'}
        </button>
      </div>

      {!persona && (
        <p className="text-xs text-amber-400 mb-3">
          페르소나가 아직 없습니다. 결과는 일반 톤으로 나옵니다. 글귀 탭에서 글귀를 모은 뒤 페르소나 탭에서 분석해보세요.
        </p>
      )}

      {streaming && variants.length === 0 && (
        <p className="text-slate-500 text-sm">스트리밍 시작 대기 중...</p>
      )}

      {variants.length > 0 && (
        <div className="space-y-3">
          {variants.map((v) => (
            <article key={v.index} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-slate-100 whitespace-pre-wrap leading-relaxed flex-1">
                  <span className="text-indigo-300 mr-2">{['①', '②', '③', '④', '⑤'][v.index - 1]}</span>
                  {v.text}
                </p>
                <button
                  onClick={() => onCopy(v.text)}
                  className="text-xs text-slate-400 hover:text-indigo-300 whitespace-nowrap"
                >
                  복사
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {!streaming && rawOutput && variants.length === 0 && (
        <pre className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
          {rawOutput}
        </pre>
      )}
    </section>
  );
}
