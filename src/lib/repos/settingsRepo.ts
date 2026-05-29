import { DEFAULT_SETTINGS, type Settings } from '../types';

const KEY = 'wordrobe.settings';

export const settingsRepo = {
  load(): Settings {
    if (typeof localStorage === 'undefined') return { ...DEFAULT_SETTINGS };
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    try {
      const parsed = JSON.parse(raw) as Partial<Settings>;
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return { ...DEFAULT_SETTINGS };
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
