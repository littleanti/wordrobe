import { useEffect, useState, useCallback } from 'react';
import { phraseRepo } from '../lib/repos/phraseRepo';
import { useApp } from '../lib/store';
import { useT } from '../lib/i18n';
import { exportAll, downloadJson, importAll, readJsonFile } from '../lib/export';
import type { ExportPayload, Phrase } from '../lib/types';
import PhraseAddDialog from '../components/PhraseAddDialog';
import PhraseCard from '../components/PhraseCard';

function getAllTags(phrases: Phrase[]): string[] {
  const set = new Set<string>();
  for (const p of phrases) p.tags?.forEach((t) => set.add(t));
  return Array.from(set);
}

export default function PhrasesPage() {
  const [phrases, setPhrases] = useState<Phrase[] | null>(null);
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pushToast = useApp((s) => s.pushToast);
  const t = useT();

  const refresh = useCallback(async () => {
    const list = query ? await phraseRepo.search(query) : await phraseRepo.list();
    setPhrases(list);
  }, [query]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onDelete = async (id: string) => {
    if (!confirm(t('phrases.confirmDelete'))) return;
    await phraseRepo.remove(id);
    pushToast(t('phrases.deletedToast'), 'info');
    refresh();
  };

  const onExport = async () => {
    const payload = await exportAll();
    downloadJson(`wordrobe-${new Date().toISOString().slice(0, 10)}.json`, payload);
    pushToast(t('phrases.exportedToast'), 'success');
    setMenuOpen(false);
  };

  const onImport = async (file: File) => {
    try {
      const payload = (await readJsonFile(file)) as ExportPayload;
      const replace = confirm(t('phrases.confirmImport'));
      await importAll(payload, { replace });
      pushToast(t('phrases.importDone'), 'success');
      refresh();
    } catch (err) {
      pushToast(t('phrases.importFailed', { msg: (err as Error).message }), 'error');
    }
    setMenuOpen(false);
  };

  const allTags = phrases ? getAllTags(phrases) : [];

  const displayed = activeTag
    ? (phrases ?? []).filter((p) => p.tags?.includes(activeTag))
    : (phrases ?? []);

  return (
    <section className="max-w-lg mx-auto px-4 pb-6">
      {/* Sticky top bar: search + FAB */}
      <div className="sticky top-0 z-20 pt-4 pb-2 bg-slate-50/90 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <svg
              viewBox="0 0 24 24"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActiveTag(null); }}
              placeholder={t('phrases.searchPlaceholder')}
              className="w-full bg-white border border-slate-200 rounded-full pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors shadow-soft-sm"
            />
          </div>

          {/* Dot menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors shadow-soft-sm"
              aria-label={t('common.more')}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-12 z-20 bg-white border border-slate-200 rounded-2xl shadow-soft-lg py-1.5 min-w-[140px]">
                  <div className="px-4 py-1.5 text-xs text-slate-400 border-b border-slate-200 mb-1">
                    {phrases ? t('phrases.countSuffix', { n: phrases.length }) : '...'}
                  </div>
                  <button
                    onClick={onExport}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {t('phrases.export')}
                  </button>
                  <label className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
                    {t('phrases.import')}
                    <input
                      type="file"
                      accept="application/json"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onImport(f);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </>
            )}
          </div>

          {/* FAB add button */}
          <button
            onClick={() => setAdding(true)}
            className="w-10 h-10 rounded-full bg-wordrobe-gradient flex items-center justify-center shadow-glow text-white flex-shrink-0 transition-transform active:scale-95"
            aria-label={t('phrases.addAria')}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {/* Tag story strip */}
        {allTags.length > 0 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveTag(null)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border-[1.5px] transition-colors ${
                activeTag === null
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-500'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              {t('phrases.all')}
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border-[1.5px] transition-colors ${
                  activeTag === tag
                    ? 'bg-indigo-50 text-indigo-600 border-indigo-500'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Feed */}
      <div className="mt-3">
        {phrases === null && (
          <p className="text-slate-400 text-sm text-center py-12">{t('common.loading')}</p>
        )}

        {phrases !== null && displayed.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
            <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-9 h-9 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-700 font-medium mb-1">
                {query || activeTag ? t('phrases.noResults') : t('phrases.emptyTitle')}
              </p>
              <p className="text-slate-400 text-sm">
                {query || activeTag ? t('phrases.noResultsHint') : t('phrases.emptyHint')}
              </p>
            </div>
            {!query && !activeTag && (
              <button
                onClick={() => setAdding(true)}
                className="px-6 py-2.5 rounded-full bg-wordrobe-gradient text-white font-semibold text-sm shadow-glow transition-transform active:scale-95"
              >
                {t('phrases.firstAdd')}
              </button>
            )}
          </div>
        )}

        {displayed.length > 0 && (
          <div className="space-y-4">
            {displayed.map((p) => (
              <PhraseCard key={p.id} phrase={p} onDelete={() => onDelete(p.id)} />
            ))}
          </div>
        )}
      </div>

      <PhraseAddDialog open={adding} onClose={() => setAdding(false)} onSaved={refresh} />
    </section>
  );
}
