import { useEffect, useState, useCallback } from 'react';
import { phraseRepo } from '../lib/repos/phraseRepo';
import { useApp } from '../lib/store';
import { exportAll, downloadJson, importAll, readJsonFile } from '../lib/export';
import type { ExportPayload, Phrase } from '../lib/types';
import PhraseAddDialog from '../components/PhraseAddDialog';
import PhraseCard from '../components/PhraseCard';

export default function PhrasesPage() {
  const [phrases, setPhrases] = useState<Phrase[] | null>(null);
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const pushToast = useApp((s) => s.pushToast);

  const refresh = useCallback(async () => {
    const list = query ? await phraseRepo.search(query) : await phraseRepo.list();
    setPhrases(list);
  }, [query]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onDelete = async (id: string) => {
    if (!confirm('이 글귀를 삭제할까요?')) return;
    await phraseRepo.remove(id);
    pushToast('삭제했습니다.', 'info');
    refresh();
  };

  const onExport = async () => {
    const payload = await exportAll();
    downloadJson(`wordrobe-${new Date().toISOString().slice(0, 10)}.json`, payload);
    pushToast('JSON으로 내보냈습니다.', 'success');
  };

  const onImport = async (file: File) => {
    try {
      const payload = (await readJsonFile(file)) as ExportPayload;
      const replace = confirm('기존 데이터를 대체할까요?\n확인=대체 / 취소=병합');
      await importAll(payload, { replace });
      pushToast('가져오기 완료', 'success');
      refresh();
    } catch (err) {
      pushToast(`가져오기 실패: ${(err as Error).message}`, 'error');
    }
  };

  return (
    <section className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 검색..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-400"
        />
        <button
          onClick={() => setAdding(true)}
          className="px-3 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-sm rounded-md whitespace-nowrap"
        >
          + 글귀 추가
        </button>
      </div>

      <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
        <span>{phrases ? `${phrases.length}개` : '...'}</span>
        <div className="flex items-center gap-3">
          <button onClick={onExport} className="hover:text-slate-300">
            내보내기
          </button>
          <label className="hover:text-slate-300 cursor-pointer">
            가져오기
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
      </div>

      {phrases === null && <p className="text-slate-500 text-sm">불러오는 중...</p>}
      {phrases && phrases.length === 0 && (
        <div className="border border-dashed border-slate-800 rounded-lg p-8 text-center text-sm text-slate-400">
          {query ? '검색 결과가 없습니다.' : '아직 모은 글귀가 없습니다. 우상단 "+ 글귀 추가"로 시작하세요.'}
        </div>
      )}
      {phrases && phrases.length > 0 && (
        <div className="space-y-3">
          {phrases.map((p) => (
            <PhraseCard key={p.id} phrase={p} onDelete={() => onDelete(p.id)} />
          ))}
        </div>
      )}

      <PhraseAddDialog open={adding} onClose={() => setAdding(false)} onSaved={refresh} />
    </section>
  );
}
