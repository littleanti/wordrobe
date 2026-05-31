import { GeminiClient } from './gemini';
import {
  buildPersonaAnalysisUserPrompt,
  renderPersonaMarkdown,
} from './prompts';
import { personaRepo } from './repos/personaRepo';
import { phraseRepo } from './repos/phraseRepo';
import { tStatic } from './i18n';
import type { PersonaAnalysisJson, PersonaMemory, Settings } from './types';

export interface AnalyzeResult {
  status: 'ok' | 'skipped';
  reason?: string;
  memory?: PersonaMemory;
}

export async function analyzeAndUpdatePersona(settings: Settings): Promise<AnalyzeResult> {
  const phrases = await phraseRepo.list();
  if (phrases.length < settings.minPhrasesForAnalysis) {
    return {
      status: 'skipped',
      reason: tStatic('persona.skipTooFew', { min: settings.minPhrasesForAnalysis, n: phrases.length }),
    };
  }
  if (!settings.apiKey) {
    return { status: 'skipped', reason: tStatic('persona.skipNoKey') };
  }

  const client = new GeminiClient({ apiKey: settings.apiKey });
  const prompt = buildPersonaAnalysisUserPrompt(phrases);
  const analysis = await client.generateJson<PersonaAnalysisJson>(prompt);

  const previous = await personaRepo.getLatest();
  const memory: PersonaMemory = {
    version: (previous?.version ?? 0) + 1,
    updatedAt: Date.now(),
    toneKeywords: analysis.toneKeywords ?? [],
    signaturePhrases: analysis.signaturePhrases ?? [],
    avoidPatterns: analysis.avoidPatterns ?? [],
    backgroundTopics: analysis.backgroundTopics ?? [],
    rawMarkdown: renderPersonaMarkdown(analysis, phrases.length),
    sourcePhraseIds: phrases.map((p) => p.id),
  };

  await personaRepo.save(memory);
  return { status: 'ok', memory };
}

let pending: ReturnType<typeof setTimeout> | null = null;

export function scheduleAutoAnalyze(settings: Settings, onUpdate?: (r: AnalyzeResult) => void): void {
  if (!settings.autoAnalyze) return;
  if (pending) clearTimeout(pending);
  pending = setTimeout(async () => {
    pending = null;
    try {
      const r = await analyzeAndUpdatePersona(settings);
      onUpdate?.(r);
    } catch (err) {
      onUpdate?.({ status: 'skipped', reason: (err as Error).message });
    }
  }, 30_000);
}
