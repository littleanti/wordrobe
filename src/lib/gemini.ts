import { GoogleGenAI } from '@google/genai';
import { tStatic } from '@/lib/i18n';
import { MODEL_ID } from '@/lib/types';

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
    return new GeminiError(tStatic('error.auth'), 'auth', 401);
  }
  if (lower.includes('429') || lower.includes('quota') || lower.includes('rate')) {
    return new GeminiError(tStatic('error.rate'), 'rate', 429);
  }
  if (lower.includes('500') || lower.includes('502') || lower.includes('503') || lower.includes('504')) {
    return new GeminiError(tStatic('error.server'), 'server');
  }
  if (lower.includes('failed to fetch') || lower.includes('network')) {
    return new GeminiError(tStatic('error.network'), 'network');
  }
  return new GeminiError(message || tStatic('error.unknown'), 'unknown');
}

export interface GeminiClientOptions {
  apiKey: string;
}

/**
 * Extract a JSON object/array from a model response.
 * We instruct JSON-only via the prompt instead of using `responseSchema`, so the
 * response may be wrapped in a ```json code fence or include stray prose.
 */
function extractJson(raw: string): string {
  let text = raw.trim();
  // Strip a leading/trailing markdown code fence (```json ... ```).
  const fence = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fence) text = fence[1].trim();
  // Otherwise, slice to the outermost JSON delimiters.
  const start = text.search(/[[{]/);
  const end = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
  if (start >= 0 && end > start) text = text.slice(start, end + 1);
  return text;
}

export class GeminiClient {
  private ai: GoogleGenAI;

  constructor(opts: GeminiClientOptions) {
    if (!opts.apiKey) throw new GeminiError(tStatic('error.emptyKey'), 'auth');
    this.ai = new GoogleGenAI({ apiKey: opts.apiKey });
  }

  async generateJson<T>(prompt: string): Promise<T> {
    try {
      // Instruct JSON-only via the prompt (no responseSchema) for portability.
      const result = await this.ai.models.generateContent({
        model: MODEL_ID,
        contents: `${prompt}\n\n반드시 유효한 JSON 객체 하나만 출력하세요. 코드블록 표시나 다른 설명은 절대 포함하지 마세요.`,
      });
      const text = result.text ?? '';
      if (!text) throw new GeminiError(tStatic('error.emptyResponse'), 'unknown');
      return JSON.parse(extractJson(text)) as T;
    } catch (err) {
      throw classify(err);
    }
  }

  async *stream(prompt: string): AsyncGenerator<string> {
    try {
      const response = await this.ai.models.generateContentStream({
        model: MODEL_ID,
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
        model: MODEL_ID,
        contents: 'ping',
      });
      return Boolean(r.text);
    } catch (err) {
      throw classify(err);
    }
  }
}
