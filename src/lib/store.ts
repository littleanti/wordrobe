import { create } from 'zustand';
import { settingsRepo } from './repos/settingsRepo';
import type { Settings } from './types';

export interface ToastEntry {
  id: number;
  message: string;
  tone: 'info' | 'error' | 'success';
  expiresAt: number;
}

interface AppState {
  settings: Settings;
  setSettings: (patch: Partial<Settings>) => void;

  toasts: ToastEntry[];
  pushToast: (message: string, tone?: ToastEntry['tone']) => void;
  dismissToast: (id: number) => void;
}

let toastSeq = 1;

export const useApp = create<AppState>((set, get) => ({
  settings: settingsRepo.load(),
  setSettings: (patch) => {
    const next = settingsRepo.patch(patch);
    set({ settings: next });
  },

  toasts: [],
  pushToast: (message, tone = 'info') => {
    const id = toastSeq++;
    const entry: ToastEntry = { id, message, tone, expiresAt: Date.now() + 4000 };
    set({ toasts: [...get().toasts, entry] });
    setTimeout(() => get().dismissToast(id), 4000);
  },
  dismissToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },
}));

export function hasApiKey(): boolean {
  return useApp.getState().settings.apiKey.trim().length > 0;
}
