import { ulid } from 'ulid';
import { db } from '../db';
import type { Phrase } from '../types';

export const phraseRepo = {
  async add(input: Omit<Phrase, 'id' | 'capturedAt'> & { capturedAt?: number }): Promise<Phrase> {
    const phrase: Phrase = {
      id: ulid(),
      capturedAt: input.capturedAt ?? Date.now(),
      text: input.text.trim(),
      sourceUrl: input.sourceUrl?.trim() || undefined,
      sourceTitle: input.sourceTitle?.trim() || undefined,
      tags: input.tags?.filter(Boolean),
      note: input.note?.trim() || undefined,
    };
    await db.phrases.add(phrase);
    return phrase;
  },

  async update(id: string, patch: Partial<Omit<Phrase, 'id'>>): Promise<void> {
    await db.phrases.update(id, patch);
  },

  async remove(id: string): Promise<void> {
    await db.phrases.delete(id);
  },

  async list(): Promise<Phrase[]> {
    return db.phrases.orderBy('capturedAt').reverse().toArray();
  },

  async count(): Promise<number> {
    return db.phrases.count();
  },

  async search(query: string): Promise<Phrase[]> {
    const q = query.trim().toLowerCase();
    if (!q) return this.list();
    const all = await this.list();
    return all.filter(
      (p) =>
        p.text.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q)) ||
        p.note?.toLowerCase().includes(q),
    );
  },

  async bulkPut(phrases: Phrase[]): Promise<void> {
    await db.phrases.bulkPut(phrases);
  },

  async clear(): Promise<void> {
    await db.phrases.clear();
  },
};
