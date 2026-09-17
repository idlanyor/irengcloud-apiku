import { useCatalogStore } from '../stores/useCatalogStore';
import { useEndpointStore } from '../stores/useEndpointStore';
import { useUIStore } from '../stores/useUIStore';
import { computedPath } from '../lib/url';
import { sdkSnippet } from '../lib/codegen';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';

const SDK_LANGS = [
  { key: 'curl', label: 'cURL' },
  { key: 'js', label: 'JavaScript' },
  { key: 'python', label: 'Python' },
  { key: 'php', label: 'PHP' },
  { key: 'go', label: 'Go' },
];

const SDK_ICONS = {
  curl: 'fa-solid fa-terminal',
  js: 'fa-brands fa-js',
  python: 'fa-brands fa-python',
  php: 'fa-brands fa-php',
  go: 'fa-brands fa-golang',
};

/** Kode integrasi 5 bahasa — sinkron dengan endpoint & params playground. */
export default function SDKCard() {
  const selectedKey = useEndpointStore((s) => s.selectedKey);
  const params = useEndpointStore((s) => s.params);
  const sdkLang = useUIStore((s) => s.sdkLang);
  const setSdkLang = useUIStore((s) => s.setSdkLang);
  const [copied, copy] = useCopyToClipboard();
  const showToast = useUIStore((s) => s.showToast);
  const endpoint = useCatalogStore((s) => {
    if (selectedKey) return s.endpoints.find((e) => e.key === selectedKey);
    return s.endpoints.find((e) => e.key === 'server-stats') || s.endpoints[0];
  });

  const code = sdkSnippet(sdkLang, computedPath(endpoint?.path, params));

  const handleCopy = async () => {
    const ok = await copy(code);
    if (ok) showToast('Kode snippet berhasil disalin!');
  };

  return (
    <div className="overflow-hidden rounded-lg border border-rose-200/70 dark:border-rose-950/80 bg-white dark:bg-[#160d13]/80 shadow-xs">
      <div className="flex flex-wrap gap-1 border-b border-rose-200/70 dark:border-rose-950/80 p-2 bg-rose-50/40 dark:bg-[#0f0a0d]/60">
        {SDK_LANGS.map((l) => (
          <button
            key={l.key}
            onClick={() => setSdkLang(l.key)}
            className={`flex items-center gap-2 rounded px-3 py-1.5 text-xs font-semibold transition ${
              sdkLang === l.key
                ? 'bg-rose-gradient text-white font-bold shadow-sm shadow-rose-900/20'
                : 'text-rose-900/70 hover:text-rose-950 dark:text-rose-200/70 dark:hover:text-white'
            }`}
          >
            <i className={`${SDK_ICONS[l.key] ?? 'fa-solid fa-code'} text-xs`} />
            {l.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {endpoint && (
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-600 dark:text-rose-200/80">
              Target: <code className="rounded bg-rose-50/80 dark:bg-[#0f0a0d] border border-rose-200 dark:border-rose-950/80 px-2 py-0.5 text-rose-900 dark:text-rose-200 font-mono text-xs">{endpoint.methods[0]} {endpoint.path}</code>
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded border border-rose-200 dark:border-rose-950/80 bg-rose-50/60 dark:bg-[#1f121a]/60 px-2.5 py-1 text-xs font-semibold text-rose-800 dark:text-rose-200 transition hover:border-rose-300 dark:hover:border-rose-800/60 hover:text-rose-950 dark:hover:text-white"
            >
              <i className={`fa-solid ${copied ? 'fa-check text-emerald-500 dark:text-emerald-400' : 'fa-copy'} text-xs`} />
              Salin Kode
            </button>
          </div>
        )}
        <pre className="max-h-96 overflow-auto rounded-md bg-[#0f0a0d] text-rose-100 p-4 font-mono text-xs leading-relaxed border border-rose-950/80">
          {code}
        </pre>
      </div>
    </div>
  );
}
