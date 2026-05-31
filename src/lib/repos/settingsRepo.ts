import { DEFAULT_SETTINGS, type Settings } from '../types';

const KEY = 'wordrobe.settings';

/**
 * Pick a UI locale from an ordered list of browser languages (most-preferred first).
 * Returns the first recognized language: Korean → 'ko', English → 'en'.
 * Falls back to 'en' for any other / unrecognized language (international default).
 * Pure + exported for testing.
 */
export function detectUiLocale(languages: readonly string[]): 'ko' | 'en' {
  for (const raw of languages) {
    if (!raw) continue;
    const lang = raw.toLowerCase();
    if (lang.startsWith('ko')) return 'ko';
    if (lang.startsWith('en')) return 'en';
  }
  return 'en';
}

/** Resolve the first-visit UI locale from the browser, with a safe fallback. */
function browserUiLocale(): Settings['uiLocale'] {
  if (typeof navigator === 'undefined') return DEFAULT_SETTINGS.uiLocale;
  const langs =
    navigator.languages && navigator.languages.length
      ? navigator.languages
      : navigator.language
        ? [navigator.language]
        : [];
  if (langs.length === 0) return DEFAULT_SETTINGS.uiLocale;
  return detectUiLocale(langs);
}

export const settingsRepo = {
  load(): Settings {
    if (typeof localStorage === 'undefined') return { ...DEFAULT_SETTINGS, uiLocale: browserUiLocale() };
    const raw = localStorage.getItem(KEY);
    // First visit (no stored settings): auto-detect UI language from the browser.
    if (!raw) return { ...DEFAULT_SETTINGS, uiLocale: browserUiLocale() };
    try {
      const parsed = JSON.parse(raw) as Partial<Settings>;
      const merged = { ...DEFAULT_SETTINGS, ...parsed };
      // No explicit user choice persisted yet → detect from browser each load.
      // Once the user toggles the language, uiLocale is saved and takes over.
      if (parsed.uiLocale == null) merged.uiLocale = browserUiLocale();
      return merged;
    } catch {
      return { ...DEFAULT_SETTINGS, uiLocale: browserUiLocale() };
    }
  },

  save(settings: Settings): void {
    localStorage.setItem(KEY, JSON.stringify(settings));
  },

  patch(patch: Partial<Settings>): Settings {
    const next = { ...this.load(), ...patch };
    this.save(next);
    return next;
  },

  clear(): void {
    localStorage.removeItem(KEY);
  },

  maskKey(key: string): string {
    if (!key) return '';
    if (key.length <= 8) return '****';
    return `${key.slice(0, 6)}…${key.slice(-4)}`;
  },
};
