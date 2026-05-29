import { GoogleGenAI } from '@google/genai';
import type { GeminiModel } from './types';

export class GeminiError extends Error {
  constructor(
    message: string,
    public kind: 'auth' | 'rate' | 'network' | 'server' | 'unknown',
    public status?: number,
  ) {
    super(message);
    this.name = 'GeminiError';
  }
}

function classify(err: unknown): GeminiError {
  if (err instanceof GeminiError) return err;
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();
  if (lower.includes('api key') || lower.includes('unauthorized') || lower.includes('401') || lower.includes('403')) {
    return new GeminiError('API 키가 유효하지 않습니다. 설정에서 키를 다시 확인해주세요.', 'auth', 401);
  }
  if (lower.includes('429') || lower.includes('quota') || lower.includes('rate')) {
    return new GeminiError('Google AI Studio 사용 한도를 초과했습니다. 잠시 후 다시 시도해주세요.', 'rate', 429);
  }
  if (lower.includes('500') || lower.includes('502') || lower.includes('503') || lower.includes('504')) {
    return new GeminiError('Gemini 서버 오류입니다. 잠시 후 다시 시도해주세요.', 'server');
  }
  if (lower.includes('failed to fetch') || lower.includes('network')) {
    return new GeminiError('네트워크 오류입니다. 연결을 확인해주세요.', 'network');
  }
  return new GeminiError(message || '알 수 없는 오류', 'unknown');
}

export interface GeminiClientOptions {
  apiKey: string;
  model: GeminiModel;
}

export class GeminiClient {
  private ai: GoogleGenAI;
  private model: GeminiModel;

  constructor(opts: GeminiClientOptions) {
    if (!opts.apiKey) throw new GeminiError('API 키가 비어 있습니다.', 'auth');
    this.ai = new GoogleGenAI({ apiKey: opts.apiKey });
    this.model = opts.model;
  }

  async generateJson<T>(prompt: string, schema: object): Promise<T> {
    try {
      const result = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      });
      const text = result.text ?? '';
      if (!text) throw new GeminiError('빈 응답을 받았습니다.', 'unknown');
      return JSON.parse(text) as T;
    } catch (err) {
      throw classify(err);
    }
  }

  async *stream(prompt: string): AsyncGenerator<string> {
    try {
      const response = await this.ai.models.generateContentStream({
        model: this.model,
        contents: prompt,
      });
      for await (const chunk of response) {
        const t = chunk.text;
        if (t) yield t;
      }
    } catch (err) {
      throw classify(err);
    }
  }

  async ping(): Promise<boolean> {
    try {
      const r = await this.ai.models.generateContent({
        model: this.model,
        contents: 'ping',
      });
      return Boolean(r.text);
    } catch (err) {
      throw classify(err);
    }
  }
}
