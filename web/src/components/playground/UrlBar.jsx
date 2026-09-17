import { useCatalogStore } from '../../stores/useCatalogStore';
import { useEndpointStore } from '../../stores/useEndpointStore';
import { useUIStore } from '../../stores/useUIStore';
import { computedPath } from '../../lib/url';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';

/** Baris URL terhitung — sinkron reaktif dari store, dengan tombol copy full URL. */
export default function UrlBar() {
  const selectedKey = useEndpointStore((s) => s.selectedKey);
  const params = useEndpointStore((s) => s.params);
  const endpoint = useCatalogStore((s) => (selectedKey ? s.endpoints.find((e) => e.key === selectedKey) : null));
  const [copied, copy] = useCopyToClipboard();
  const showToast = useUIStore((s) => s.showToast);

  const relativeUrl = computedPath(endpoint?.path, params);

  const handleCopy = async () => {
    const fullUrl = `https://apiku.irengcloud.com${relativeUrl}`;
    const ok = await copy(fullUrl);
    if (ok) showToast('Full URL berhasil disalin!');
  };

  return (
    <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950 px-3 py-2">
      <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-mono font-bold ${endpoint?.methods[0] === 'POST' ? 'bg-sky-100 text-sky-800 border border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800' : 'bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'}`}>
        {endpoint?.methods[0] ?? 'GET'}
      </span>
      <span className="truncate font-mono text-xs text-slate-700 dark:text-slate-200" title={relativeUrl}>
        {relativeUrl}
      </span>
      <button
        onClick={handleCopy}
        className="shrink-0 text-slate-400 transition hover:text-slate-900 dark:hover:text-white"
        aria-label="Copy full URL"
      >
        <i className={`fa-solid ${copied ? 'fa-check text-emerald-500' : 'fa-copy'}`} />
      </button>
    </div>
  );
}
