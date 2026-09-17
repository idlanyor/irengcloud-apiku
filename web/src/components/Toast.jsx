import { useUIStore } from '../stores/useUIStore';

/** Toast global — dibaca dari useUIStore, auto-hide 2.8s. */
export default function Toast() {
  const toast = useUIStore((s) => s.toast);
  if (!toast) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-lg">
        <i className="fa-solid fa-circle-check text-emerald-400" />
        {toast}
      </div>
    </div>
  );
}
