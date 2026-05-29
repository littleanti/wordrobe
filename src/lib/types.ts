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

export type GeminiModel = 'gemini-2.5-flash' | 'gemini-2.5-pro';
export type Locale = 'ko' | 'en' | 'auto';

export interface Settings {
  apiKey: string;
  model: GeminiModel;
  language: Locale;
  uiLocale: 'ko' | 'en';
  autoAnalyze: boolean;
  minPhrasesForAnalysis: number;
}

export const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  model: 'gemini-2.5-flash',
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
