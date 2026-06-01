import { db } from '@/lib/db';
import type { PersonaMemory } from '@/lib/types';

export const personaRepo = {
  async getLatest(): Promise<PersonaMemory | undefined> {
    return db.persona.orderBy('version').reverse().first();
  },

  async save(memory: PersonaMemory): Promise<void> {
    await db.persona.put(memory);
  },

  async clear(): Promise<void> {
    await db.persona.clear();
  },
};
