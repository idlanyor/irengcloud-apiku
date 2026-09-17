import { useCatalogStore } from '../../stores/useCatalogStore';
import { useEndpointStore } from '../../stores/useEndpointStore';

/** Input param dinamis dari catalog endpoint. setParam → store → URL bar. */
export default function ParamInputs() {
  const selectedKey = useEndpointStore((s) => s.selectedKey);
  const params = useEndpointStore((s) => s.params);
  const setParam = useEndpointStore((s) => s.setParam);
  const config = useCatalogStore((s) => (selectedKey ? s.endpoints.find((e) => e.key === selectedKey) : null));

  if (!config) return null;

  if (config.params.length === 0) {
    return (
      <p className="text-sm italic text-muted">
        Endpoint ini tidak memerlukan parameter tambahan.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {config.params.map((p) => (
        <div key={p.key}>
          <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">{p.label}</label>
          {p.type === 'select' ? (
            <select
              value={String(params[p.key] ?? '')}
              onChange={(e) => setParam(p.key, e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-600"
            >
              {(p.options ?? []).map((opt) => (
                <option key={opt} value={opt}>
                  {String(opt).toUpperCase()}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={p.type === 'number' ? 'number' : 'text'}
              value={String(params[p.key] ?? '')}
              onChange={(e) => setParam(p.key, e.target.value)}
              placeholder={p.placeholder ?? ''}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:border-slate-600"
            />
          )}
        </div>
      ))}
    </div>
  );
}
