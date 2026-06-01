import { useRef, useState } from 'react';
import { useT } from '@/lib/i18n';
import { useApp } from '@/lib/store';
import { clearAllLocalAppData } from '@/lib/dataManagement';
import { exportAll, importAll, downloadJson, readJsonFile } from '@/lib/export';
import { DEFAULT_SETTINGS, type ExportPayload, type Locale } from '@/lib/types';

export default function SettingsPage() {
  const t = useT();
  const pushToast = useApp((s) => s.pushToast);
  const settings = useApp((s) => s.settings);
  const setSettings = useApp((s) => s.setSettings);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState<'export' | 'import' | 'clear' | null>(null);

  const onExport = async () => {
    setBusy('export');
    try {
      const payload = await exportAll();
      downloadJson(`wordrobe-backup-${new Date().toISOString().slice(0, 10)}.json`, payload);
      pushToast(t('settings.toastExported'), 'success');
    } catch {
      pushToast(t('settings.toastExportFailed'), 'error');
    } finally {
      setBusy(null);
    }
  };

  const onImportFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy('import');
    try {
      const payload = (await readJsonFile(file)) as ExportPayload;
      const replace = window.confirm(t('phrases.confirmImport'));
      await importAll(payload, { replace });
      pushToast(
        t('settings.toastImported', {
          phrases: payload.phrases.length,
          persona: payload.persona ? 1 : 0,
        }),
        'success',
      );
    } catch {
      pushToast(t('settings.toastImportFailed'), 'error');
    } finally {
      setBusy(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const onClearAll = async () => {
    if (!window.confirm(t('settings.confirmClearAll'))) return;
    setBusy('clear');
    try {
      await clearAllLocalAppData();
      setSettings(DEFAULT_SETTINGS);
      pushToast(t('settings.toastCleared'), 'success');
    } catch {
      pushToast(t('settings.toastClearFailed'), 'error');
    } finally {
      setBusy(null);
    }
  };

  const setLanguage = (language: Locale) => setSettings({ language });

  return (
    <section className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h1 className="text-lg font-bold text-slate-900">{t('nav.settings')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('settings.subtitle')}</p>
      </div>

      {/* Data management */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-soft-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-900">{t('settings.dataTitle')}</p>
          <p className="text-xs text-slate-500 mt-1">{t('settings.dataDesc')}</p>
        </div>
        <div className="p-4 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => void onExport()}
            disabled={busy !== null}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-white disabled:opacity-50"
          >
            <span aria-hidden="true">↓</span>
            {busy === 'export' ? t('common.loading') : t('settings.exportBtn')}
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy !== null}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-white disabled:opacity-50"
          >
            <span aria-hidden="true">↑</span>
            {busy === 'import' ? t('common.loading') : t('settings.importBtn')}
          </button>
          <button
            type="button"
            onClick={() => void onClearAll()}
            disabled={busy !== null}
            className="flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
          >
            <span aria-hidden="true">×</span>
            {busy === 'clear' ? t('common.loading') : t('settings.clearBtn')}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => void onImportFile(e.target.files?.[0])}
          />
        </div>
      </div>

      {/* Persona analysis */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-soft-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-900">{t('settings.analysisTitle')}</p>
          <p className="text-xs text-slate-500 mt-1">{t('settings.analysisDesc')}</p>
        </div>
        <div className="p-4 space-y-4">
          {/* Auto-analyze toggle */}
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900">{t('settings.autoAnalyzeTitle')}</p>
              <p className="text-xs text-slate-500 mt-0.5">{t('settings.autoAnalyzeDesc')}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.autoAnalyze}
              onClick={() => setSettings({ autoAnalyze: !settings.autoAnalyze })}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                settings.autoAnalyze ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  settings.autoAnalyze ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Min phrases */}
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900">{t('settings.minPhrasesTitle')}</p>
              <p className="text-xs text-slate-500 mt-0.5">{t('settings.minPhrasesDesc')}</p>
            </div>
            <input
              type="number"
              min={1}
              max={50}
              value={settings.minPhrasesForAnalysis}
              onChange={(e) =>
                setSettings({ minPhrasesForAnalysis: Math.max(1, Number(e.target.value) || 1) })
              }
              className="w-20 flex-shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 text-center focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Output language */}
          <div>
            <p className="text-sm font-medium text-slate-900 mb-2">{t('settings.languageTitle')}</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                ['auto', 'settings.languageAuto'],
                ['ko', 'settings.languageKo'],
                ['en', 'settings.languageEn'],
              ] as const).map(([value, labelKey]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setLanguage(value)}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                    settings.language === value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                  }`}
                >
                  {t(labelKey)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-soft-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-900">{t('settings.privacyTitle')}</p>
          <p className="text-xs text-slate-500 mt-1">{t('settings.privacyDesc')}</p>
        </div>
        <div className="p-4 space-y-3">
          {[
            'settings.privacyLocal',
            'settings.privacyGemini',
            'settings.privacyKey',
            'settings.privacyLoss',
            'settings.privacyConsent',
          ].map((key) => (
            <div key={key} className="flex gap-3 text-sm leading-relaxed text-slate-600">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
              <p>{t(key)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3">
        <p className="text-sm font-semibold text-amber-800">{t('settings.disclaimerTitle')}</p>
        <p className="text-xs leading-relaxed text-amber-700 mt-1">{t('settings.disclaimerDesc')}</p>
      </div>
    </section>
  );
}
