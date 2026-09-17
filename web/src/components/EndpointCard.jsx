import { Link } from 'react-router-dom';
import { TAG_ICONS } from '../lib/tagIcons';
import { computedPath, defaultParamsFor } from '../lib/url';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { useUIStore } from '../stores/useUIStore';
import { useEndpointStore } from '../stores/useEndpointStore';

/**
 * Kartu endpoint — data utuh dari catalog store (path/method/desc/params).
 * Contoh URL dihitung dari default params (DRY, bukan string hardcode).
 */
export default function EndpointCard({ endpoint }) {
  const [copied, copy] = useCopyToClipboard();
  const showToast = useUIStore((s) => s.showToast);
  const tag = endpoint.card?.tag ?? endpoint.category;
  const icon = TAG_ICONS[tag] ?? 'fa-solid fa-circle';
  const exampleUrl = computedPath(endpoint.path, defaultParamsFor(endpoint));

  const fullUrl = `https://apiku.irengcloud.com${endpoint.path}`;

  const handleCopy = async (e) => {
    e.stopPropagation();
    const ok = await copy(fullUrl);
    if (ok) showToast(`URL "${fullUrl}" berhasil disalin!`);
  };

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col justify-between rounded-lg border border-rose-200/70 dark:border-rose-950/80 bg-white dark:bg-[#160d13]/80 p-5 transition hover:border-rose-300 dark:hover:border-rose-800/60 hover:shadow-xs overflow-hidden">
      <div className="min-w-0">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400 truncate">
            <i className={`${icon} text-rose-500 dark:text-rose-400 shrink-0 text-xs`} /> <span className="truncate">{tag}</span>
          </span>
          <div className="flex gap-1.5 shrink-0">
            {endpoint.methods.map((m) => (
              <span
                key={m}
                className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold ${
                  m === 'GET'
                    ? 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-900/60'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/60'
                }`}
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        <h3 className="mb-1.5 text-base font-bold text-slate-900 dark:text-white break-words">{endpoint.name}</h3>
        <p className="mb-4 text-xs leading-relaxed text-slate-600 dark:text-rose-100/70 break-words">{endpoint.description}</p>

        <div
          className="mb-2 flex items-center justify-between gap-2 rounded-md border border-rose-200/80 dark:border-rose-950/80 bg-rose-50/40 dark:bg-[#0f0a0d] px-3 py-1.5 font-mono text-xs text-rose-950 dark:text-rose-200 min-w-0 overflow-hidden"
          title={`https://apiku.irengcloud.com${endpoint.path}`}
        >
          <span className="truncate min-w-0">{`https://apiku.irengcloud.com${endpoint.path}`}</span>
          <button onClick={(e) => {
            e.stopPropagation();
            handleCopy(e);
          }} className="shrink-0 text-rose-400 hover:text-rose-700 dark:hover:text-white transition" aria-label="Copy path">
            <i className={`fa-solid ${copied ? 'fa-check text-emerald-500 dark:text-emerald-400' : 'fa-copy'}`} />
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-rose-700/70 dark:text-rose-400/80 min-w-0 overflow-hidden">
          <i className="fa-solid fa-circle-info shrink-0 text-[11px]" />
          <code className="truncate text-rose-700/70 dark:text-rose-400/80 min-w-0 font-mono text-[11px]">{exampleUrl}</code>
        </div>
      </div>

      <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <Link
          to={`/playground?endpoint=${encodeURIComponent(endpoint.key)}`}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-rose-gradient text-white hover:opacity-95 shadow-sm shadow-rose-900/20 px-3.5 py-1.5 text-xs font-bold transition active:scale-[0.98]"
        >
          <i className="fa-solid fa-play text-[10px]" /> Coba di Playground
        </Link>
        <a
          href="#quickstart"
          onClick={() => {
            useEndpointStore.getState().selectEndpoint(endpoint.key, defaultParamsFor(endpoint));
          }}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-rose-200 dark:border-rose-950/80 bg-rose-50/40 dark:bg-[#1f121a]/50 px-3 py-1.5 text-xs font-semibold text-rose-800 dark:text-rose-200 transition hover:border-rose-300 dark:hover:border-rose-800/60 active:scale-[0.98]"
        >
          <i className="fa-solid fa-code text-[11px]" /> Integrasi
        </a>
      </div>
    </div>
  );
}

