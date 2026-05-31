import { useState } from 'react';
import type { Phrase } from '../lib/types';
import { useT, type TFn } from '../lib/i18n';

interface Props {
  phrase: Phrase;
  onDelete: () => void;
}

function timeAgo(ts: number, t: TFn): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t('time.justNow');
  if (mins < 60) return t('time.minutesAgo', { n: mins });
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t('time.hoursAgo', { n: hrs });
  const days = Math.floor(hrs / 24);
  if (days < 30) return t('time.daysAgo', { n: days });
  const months = Math.floor(days / 30);
  if (months < 12) return t('time.monthsAgo', { n: months });
  return t('time.yearsAgo', { n: Math.floor(months / 12) });
}

function getHostname(url?: string): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url.slice(0, 30);
  }
}

function getInitial(url?: string, text?: string): string {
  if (url) {
    try {
      const host = new URL(url).hostname.replace(/^www\./, '');
      return host[0].toUpperCase();
    } catch {
      /* fall through to text initial */
    }
  }
  return (text?.[0] ?? 'W').toUpperCase();
}

export default function PhraseCard({ phrase, onDelete }: Props) {
  const t = useT();
  const [liked, setLiked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const hostname = getHostname(phrase.sourceUrl);
  const initial = getInitial(phrase.sourceUrl, phrase.text);

  const onCopy = () => {
    navigator.clipboard.writeText(phrase.text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <article className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-soft-sm">
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="w-9 h-9 rounded-full bg-avatar-gradient flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm leading-none">{initial}</span>
        </div>
        <div className="flex-1 min-w-0">
          {hostname ? (
            <a
              href={phrase.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors truncate block"
            >
              {hostname}
            </a>
          ) : (
            <span className="text-xs font-medium text-slate-400">{t('phraseCard.directInput')}</span>
          )}
        </div>
        {/* Dot menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full"
            aria-label={t('common.more')}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <circle cx="5" cy="12" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="19" cy="12" r="1.5" />
            </svg>
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-8 z-20 bg-white border border-slate-200 rounded-xl shadow-soft-lg py-1 min-w-[100px]">
                <button
                  onClick={() => { setMenuOpen(false); onDelete(); }}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-slate-50 transition-colors"
                >
                  {t('common.delete')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pb-3">
        <div className="border-l-2 border-indigo-500/60 pl-3">
          <p className="text-base text-slate-900 whitespace-pre-wrap leading-relaxed">
            {phrase.text}
          </p>
        </div>
      </div>

      {/* Meta row */}
      <div className="px-4 pb-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400">{timeAgo(phrase.capturedAt, t)}</span>
        {phrase.tags?.map((t) => (
          <span
            key={t}
            className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100"
          >
            #{t}
          </span>
        ))}
      </div>

      {/* Action row */}
      <div className="flex items-center gap-1 px-3 pb-3 border-t border-slate-200 pt-2">
        <button
          onClick={() => setLiked((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            liked ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
          }`}
          aria-label={t('phraseCard.saved')}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {liked && <span>{t('phraseCard.saved')}</span>}
        </button>
        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
          aria-label={t('common.copy')}
        >
          {copied ? (
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
          <span>{copied ? t('common.copied') : t('common.copy')}</span>
        </button>
      </div>
    </article>
  );
}
