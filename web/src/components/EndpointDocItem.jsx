import { Link } from 'react-router-dom';
import { computedPath, defaultParamsFor } from '../lib/url';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { useUIStore } from '../stores/useUIStore';

const METHOD_STYLE = {
  GET: 'bg-emerald-500/15 text-emerald-300',
  POST: 'bg-sky-500/15 text-sky-300',
};

/** Kartu detail satu endpoint — path, method badge, desc, tabel param, contoh URL. */
export default function EndpointDocItem({ endpoint }) {
  const [copied, copy] = useCopyToClipboard();
  const showToast = useUIStore((s) => s.showToast);
  const exampleUrl = computedPath(endpoint.path, defaultParamsFor(endpoint));

  const handleCopy = async (text, label) => {
    const ok = await copy(text);
    if (ok) showToast(`${label} berhasil disalin!`);
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs">
      {/* Header */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex gap-1.5 shrink-0">
          {endpoint.methods.map((m) => (
            <span key={m} className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold ${METHOD_STYLE[m] ?? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300'}`}>
              {m}
            </span>
          ))}
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white break-words">{endpoint.name}</h3>
      </div>

      <p className="mb-4 text-xs leading-relaxed text-slate-600 dark:text-slate-400 break-words">{endpoint.description}</p>

      {/* Path + copy */}
      <div className="mb-4 flex items-center justify-between gap-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 px-3 py-2 font-mono text-xs text-slate-800 dark:text-slate-300 min-w-0 overflow-hidden">
        <span className="truncate min-w-0">{`https://apiku.irengcloud.com${endpoint.path}`}</span>
        <button
          onClick={() => handleCopy(`https://apiku.irengcloud.com${endpoint.path}`, 'Path / URL')}
          className="shrink-0 text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          aria-label="Copy path"
        >
          <i className={`fa-solid ${copied ? 'fa-check text-emerald-500 dark:text-emerald-400' : 'fa-copy'}`} />
        </button>
      </div>

      {/* Params table */}
      {endpoint.params.length > 0 ? (
        <div className="mb-4 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
          <table className="w-full min-w-[500px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="px-3 py-2 font-semibold">Param</th>
                <th className="px-3 py-2 font-semibold">Lokasi</th>
                <th className="px-3 py-2 font-semibold">Tipe</th>
                <th className="px-3 py-2 font-semibold">Wajib</th>
                <th className="px-3 py-2 font-semibold">Default</th>
                <th className="px-3 py-2 font-semibold">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {endpoint.params.map((p) => (
                <tr key={p.key} className="border-b border-slate-100 dark:border-slate-850 align-top">
                  <td className="px-3 py-2 font-mono text-slate-900 dark:text-slate-200 font-semibold">{p.key}</td>
                  <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{p.in}</td>
                  <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{p.type}</td>
                  <td className="px-3 py-2">
                    {p.required ? (
                      <span className="rounded bg-red-100 text-red-700 border border-red-200 dark:bg-red-950/60 dark:border-red-800 px-1.5 py-0.5 text-[10px] font-bold dark:text-red-300">Ya</span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">Tidak</span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-slate-700 dark:text-slate-300">
                    {p.default !== undefined ? String(p.default) : <span className="text-slate-400 dark:text-slate-600">—</span>}
                  </td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                    {p.description}
                    {p.options ? (
                      <div className="mt-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        opsi: {p.options.join(', ')}
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mb-4 text-xs italic text-slate-400 dark:text-slate-500">Tanpa parameter tambahan.</p>
      )}

      {/* Example URL */}
      <div className="mb-4 flex items-center justify-between gap-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 px-3 py-2 min-w-0 overflow-hidden">
        <span className="truncate min-w-0 font-mono text-xs text-slate-500 dark:text-slate-400" title={exampleUrl}>
          {exampleUrl}
        </span>
        <button
          onClick={() => handleCopy(exampleUrl, 'Contoh URL')}
          className="shrink-0 text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          aria-label="Copy example URL"
        >
          <i className="fa-solid fa-copy" />
        </button>
      </div>

      <Link
        to={`/playground?endpoint=${encodeURIComponent(endpoint.key)}`}
        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 px-3.5 py-1.5 text-xs font-bold transition active:scale-[0.98]"
      >
        <i className="fa-solid fa-play text-[10px]" /> Coba di Playground
      </Link>
    </div>
  );
}

