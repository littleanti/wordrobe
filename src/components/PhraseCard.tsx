import { useState } from 'react';
import type { Phrase } from '../lib/types';

interface Props {
  phrase: Phrase;
  onDelete: () => void;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '방금 전';
  if (mins < 60) return `${mins}분 전`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}시간 전`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}일 전`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}달 전`;
  return `${Math.floor(months / 12)}년 전`;
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
    } catch {}
  }
  return (text?.[0] ?? 'W').toUpperCase();
}

const AVATAR_GRADIENTS = [
  'from-pink-500 via-rose-500 to-orange-400',
  'from-violet-500 via-purple-500 to-pink-500',
  'from-blue-500 via-cyan-500 to-teal-400',
  'from-amber-500 via-orange-500 to-rose-500',
  'from-emerald-500 via-teal-500 to-cyan-500',
];

function avatarGradient(seed: string): string {
  let n = 0;
  for (let i = 0; i < seed.length; i++) n = (n + seed.charCodeAt(i)) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[n];
}

export default function PhraseCard({ phrase, onDelete }: Props) {
  const [liked, setLiked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const hostname = getHostname(phrase.sourceUrl);
  const initial = getInitial(phrase.sourceUrl, phrase.text);
  const grad = avatarGradient(phrase.id);

  const onCopy = () => {
    navigator.clipboard.writeText(phrase.text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <article className="bg-zinc-900 border border-zinc-800/60 rounded-2xl overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div
          className={`w-9 h-9 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center flex-shrink-0 shadow-glow-sm`}
        >
          <span className="text-white font-bold text-sm leading-none">{initial}</span>
        </div>
        <div className="flex-1 min-w-0">
          {hostname ? (
            <a
              href={phrase.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-zinc-300 hover:text-pink-400 transition-colors truncate block"
            >
              {hostname}
            </a>
          ) : (
            <span className="text-xs font-medium text-zinc-500">직접 입력</span>
          )}
        </div>
        {/* Dot menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded-full"
            aria-label="메뉴"
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
              <div className="absolute right-0 top-8 z-20 bg-zinc-800 border border-zinc-700 rounded-xl shadow-lg py-1 min-w-[100px]">
                <button
                  onClick={() => { setMenuOpen(false); onDelete(); }}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-700 transition-colors"
                >
                  삭제
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pb-3">
        <div className="border-l-2 border-pink-500/60 pl-3">
          <p className="text-base text-zinc-100 whitespace-pre-wrap leading-relaxed">
            {phrase.text}
          </p>
        </div>
      </div>

      {/* Meta row */}
      <div className="px-4 pb-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-zinc-600">{timeAgo(phrase.capturedAt)}</span>
        {phrase.tags?.map((t) => (
          <span
            key={t}
            className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/50"
          >
            #{t}
          </span>
        ))}
      </div>

      {/* Action row */}
      <div className="flex items-center gap-1 px-3 pb-3 border-t border-zinc-800/60 pt-2">
        <button
          onClick={() => setLiked((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            liked ? 'text-pink-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          aria-label="좋아요"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {liked && <span>저장됨</span>}
        </button>
        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
          aria-label="복사"
        >
          {copied ? (
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
          <span>{copied ? '복사됨' : '복사'}</span>
        </button>
      </div>
    </article>
  );
}
