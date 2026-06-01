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
  backgroundTopics: string[];
  rawMarkdown: string;
  sourcePhraseIds: string[];
}

/** Single model used for every LLM call (compose + persona analysis). */
export const MODEL_ID = 'gemini-3.1-flash-lite';

export type Locale = 'ko' | 'en' | 'auto';

export interface Settings {
  apiKey: string;
  language: Locale;
  uiLocale: 'ko' | 'en';
  autoAnalyze: boolean;
  minPhrasesForAnalysis: number;
}

export const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  language: 'auto',
  uiLocale: 'ko',
  autoAnalyze: true,
  minPhrasesForAnalysis: 5,
};

export interface PersonaAnalysisJson {
  toneKeywords: string[];
  signaturePhrases: string[];
  avoidPatterns: string[];
  backgroundTopics: string[];
}

export interface ComposeVariant {
  index: number;
  text: string;
}

export interface ExportPayload {
  schema: 'wordrobe-v1';
  exportedAt: number;
  phrases: Phrase[];
  persona: PersonaMemory | null;
}
