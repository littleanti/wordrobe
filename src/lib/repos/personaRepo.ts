import { db } from '../db';
import type { PersonaMemory } from '../types';

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
