export interface Phrase {
  id: string;
  text: string;
  sourceUrl?: string;
  sourceTitle?: string;
  capturedAt: number;
  tags?: string[];
  note?: string;
}

export interface PersonaMemory {
  version: number;
  updatedAt: number;
  toneKeywords: string[];
  signaturePhrases: string[];
  avoidPatterns: string[];
  vocabulary: { word: string; weight: number }[];
  backgroundTopics: string[];
  rawMarkdown: string;
  sourcePhraseIds: string[];
}

export interface Settings {
  apiKey: string;
  model: 'gemini-2.5-flash' | 'gemini-2.5-pro';
  language: 'ko' | 'en' | 'auto';
  uiLocale: 'ko' | 'en';
}
