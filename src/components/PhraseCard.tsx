import type { Phrase } from '../lib/types';

interface Props {
  phrase: Phrase;
  onDelete: () => void;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function shortenUrl(url?: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.hostname;
  } catch {
    return url.slice(0, 40);
  }
}

export default function PhraseCard({ phrase, onDelete }: Props) {
  const source = shortenUrl(phrase.sourceUrl);
  return (
    <article className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <p className="text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">{phrase.text}</p>
      <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <span>{formatDate(phrase.capturedAt)}</span>
          {source && (
            <a
              href={phrase.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-indigo-300 truncate max-w-[16ch]"
            >
              {source}
            </a>
          )}
          {phrase.tags?.map((t) => (
            <span key={t} className="text-slate-500">
              #{t}
            </span>
          ))}
        </div>
        <button onClick={onDelete} className="text-slate-500 hover:text-red-300">
          삭제
        </button>
      </div>
    </article>
  );
}
