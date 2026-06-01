import Dexie, { type Table } from 'dexie';
import type { Phrase, PersonaMemory } from '@/lib/types';

class WordrobeDB extends Dexie {
  phrases!: Table<Phrase, string>;
  persona!: Table<PersonaMemory, number>;

  constructor() {
    super('wordrobe');
    this.version(1).stores({
      phrases: 'id, capturedAt, *tags',
      persona: 'version, updatedAt',
    });
  }
}

export const db = new WordrobeDB();
