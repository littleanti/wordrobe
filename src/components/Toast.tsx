import { useApp } from '../lib/store';

export default function ToastContainer() {
  const toasts = useApp((s) => s.toasts);
  const dismiss = useApp((s) => s.dismissToast);
  return (
    <div className="fixed bottom-24 right-4 flex flex-col gap-2 z-50">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismiss(t.id)}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-lg text-sm text-left transition-all bg-zinc-900/80 backdrop-blur-md border border-zinc-800/60 text-zinc-100"
        >
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              t.tone === 'error'
                ? 'bg-rose-500'
                : t.tone === 'success'
                  ? 'bg-emerald-400'
                  : 'bg-zinc-400'
            }`}
          />
          {t.message}
        </button>
      ))}
    </div>
  );
}
