import { useApp } from '../lib/store';

export default function ToastContainer() {
  const toasts = useApp((s) => s.toasts);
  const dismiss = useApp((s) => s.dismissToast);
  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={`px-4 py-2 rounded-md shadow-lg text-sm text-left transition-opacity ${
            t.tone === 'error'
              ? 'bg-red-900/90 text-red-50 border border-red-700'
              : t.tone === 'success'
                ? 'bg-emerald-900/90 text-emerald-50 border border-emerald-700'
                : 'bg-slate-800/95 text-slate-100 border border-slate-700'
          }`}
        >
          {t.message}
        </button>
      ))}
    </div>
  );
}
