import { personaRepo } from './repos/personaRepo';
import { phraseRepo } from './repos/phraseRepo';
import type { ExportPayload, Phrase, PersonaMemory } from './types';

export async function exportAll(): Promise<ExportPayload> {
  const [phrases, persona] = await Promise.all([phraseRepo.list(), personaRepo.getLatest()]);
  return {
    schema: 'wordrobe-v1',
    exportedAt: Date.now(),
    phrases,
    persona: persona ?? null,
  };
}

export async function importAll(payload: ExportPayload, opts: { replace: boolean }): Promise<void> {
  if (payload.schema !== 'wordrobe-v1') {
    throw new Error(`지원하지 않는 스키마: ${payload.schema}`);
  }
  if (opts.replace) {
    await phraseRepo.clear();
    await personaRepo.clear();
  }
  await phraseRepo.bulkPut(payload.phrases as Phrase[]);
  if (payload.persona) {
    await personaRepo.save(payload.persona as PersonaMemory);
  }
}

export function downloadJson(filename: string, payload: unknown): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function readJsonFile(file: File): Promise<unknown> {
  const text = await file.text();
  return JSON.parse(text);
}
