import { useApp } from '../lib/store';
import type { UiLocale } from '../lib/i18n';

const OPTIONS: { value: UiLocale; label: string }[] = [
  { value: 'ko', label: '한' },
  { value: 'en', label: 'EN' },
];

export default function LanguageToggle() {
  const locale = useApp((s) => s.settings.uiLocale);
  const setSettings = useApp((s) => s.setSettings);

  return (
    <div
      className="flex items-center rounded-full border border-slate-200 bg-white p-0.5 text-xs font-semibold shadow-soft-sm"
      role="group"
      aria-label="Language"
    >
      {OPTIONS.map((opt) => {
        const active = locale === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => setSettings({ uiLocale: opt.value })}
            aria-pressed={active}
            className={`px-2.5 py-1 rounded-full leading-none transition-colors ${
              active ? 'bg-wordrobe-gradient text-white' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
