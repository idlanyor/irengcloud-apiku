import { usePlaygroundStore } from '../../stores/usePlaygroundStore';
import { useUIStore } from '../../stores/useUIStore';
import { syntaxHighlightJSON } from '../../lib/syntaxHighlight';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';

/** Panel respons — status badge, latency, dan JSON highlight. */
export default function ResponsePanel() {
  const status = usePlaygroundStore((s) => s.status);
  const httpStatus = usePlaygroundStore((s) => s.httpStatus);
  const latencyMs = usePlaygroundStore((s) => s.latencyMs);
  const response = usePlaygroundStore((s) => s.response);
  const errorMsg = usePlaygroundStore((s) => s.errorMsg);
  const [copied, copy] = useCopyToClipboard();
  const showToast = useUIStore((s) => s.showToast);

  const badgeClass =
    status === 'success'
      ? 'bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
      : status === 'error'
        ? 'bg-red-100 text-red-700 border border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800'
        : 'bg-slate-200 text-slate-600 border border-slate-300 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800';

  const badgeText =
    status === 'pending'
      ? 'PENDING'
      : status === 'error'
        ? errorMsg && !httpStatus
          ? 'ERR'
          : httpStatus
        : httpStatus ?? '—';

  let content = '// Respons JSON akan muncul di sini...';
  if (status === 'pending') content = '// Menghubungi server...';
  else if (status === 'error' && !response) content = `// ${errorMsg ?? 'Request gagal'}`;
  else if (response !== null) content = syntaxHighlightJSON(response);

  const handleCopy = async () => {
    const raw = response !== null ? JSON.stringify(response, null, 2) : content.replace(/^\/\/ ?/, '');
    const ok = await copy(raw);
    if (ok) showToast('Respons JSON berhasil disalin ke clipboard!');
  };

  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0b0f17]">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-3.5 py-2.5 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-medium text-slate-500 dark:text-slate-400">Status:</span>
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold ${badgeClass}`}>{badgeText}</span>
          {latencyMs !== null && (
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">• {latencyMs} ms</span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white"
        >
          <i className={`fa-solid ${copied ? 'fa-check text-emerald-500' : 'fa-copy'} text-xs`} />
          Salin JSON
        </button>
      </div>

      <pre className="max-h-[32rem] flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-300">
        {status === 'pending' || response === null ? (
          content
        ) : (
          <span dangerouslySetInnerHTML={{ __html: content }} />
        )}
      </pre>
    </div>
  );
}
