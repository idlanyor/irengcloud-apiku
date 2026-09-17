import { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCatalogStore } from '../stores/useCatalogStore';
import { useEndpointStore } from '../stores/useEndpointStore';
import { usePlaygroundStore } from '../stores/usePlaygroundStore';
import { useUIStore } from '../stores/useUIStore';
import EndpointSelect from '../components/playground/EndpointSelect';
import ParamInputs from '../components/playground/ParamInputs';
import UrlBar from '../components/playground/UrlBar';
import ExecuteButton from '../components/playground/ExecuteButton';
import ResponsePanel from '../components/playground/ResponsePanel';
import Toast from '../components/Toast';
import { defaultParamsFor } from '../lib/url';

/**
 * Playground — route tersendiri (bukan modal). Deep-link ?endpoint=key
 * auto-select + auto-execute (parity dengan legacy main.js).
 * Catalog di-fetch async: loading/error state dulu, lalu init selection.
 */
export default function PlaygroundPage() {
  const [searchParams] = useSearchParams();
  const status = useCatalogStore((s) => s.status);
  const load = useCatalogStore((s) => s.load);
  const selectedKey = useEndpointStore((s) => s.selectedKey);
  const initSelection = useEndpointStore((s) => s.initSelection);
  const params = useEndpointStore((s) => s.params);
  const execute = usePlaygroundStore((s) => s.execute);
  const autoRan = useRef(false);

  useEffect(() => {
    load();
  }, [load]);

  // Saat catalog siap: init selection (deep-link ?endpoint= menang) + auto-execute.
  useEffect(() => {
    if (status !== 'ready') return;
    const target = searchParams.get('endpoint');
    initSelection(target);

    if (!autoRan.current) {
      autoRan.current = true;
      const key = target && useCatalogStore.getState().getEndpoint(target)
        ? target
        : useEndpointStore.getState().selectedKey;
      const ep = useCatalogStore.getState().getEndpoint(key);
      if (ep) execute(key, useEndpointStore.getState().params ?? defaultParamsFor(ep));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Memuat endpoint...</p>
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100">
        <p className="text-xs text-red-600 dark:text-red-300">Gagal memuat katalog endpoint.</p>
        <button onClick={load} className="rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-950 px-3.5 py-1.5 text-xs font-bold">
          Muat Ulang
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8f9] dark:bg-[#0f0a0d] text-rose-950 dark:text-rose-100">
      {/* Playground navbar */}
      <nav className="sticky top-0 z-50 border-b border-rose-200/70 dark:border-rose-950/80 bg-white/95 dark:bg-[#0f0a0d]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-rose-gradient text-white shadow-sm shadow-rose-900/30">
              <i className="fa-solid fa-bolt text-xs" />
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white text-base">
              IrengCloud <span className="text-rose-600 dark:text-rose-400 font-semibold">API</span>
              <span className="ml-2 rounded border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                Playground
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/" className="hidden sm:inline-block text-xs font-medium text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-300 transition">
              <i className="fa-solid fa-arrow-left mr-1.5 text-rose-400" /> Kembali
            </Link>
            <Link to="/endpoints" className="hidden sm:inline-block text-xs font-medium text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-300 transition">
              <i className="fa-solid fa-book mr-1.5 text-rose-400" /> Dokumentasi
            </Link>
            <a href="/docs" target="_blank" rel="noreferrer" className="hidden sm:inline-block text-xs font-medium text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-300 transition">
              <i className="fa-solid fa-file-code mr-1.5 text-rose-400" /> Swagger UI
            </a>

            {/* Theme toggle button */}
            <button
              onClick={useUIStore.getState().toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 text-slate-700 dark:text-rose-200 hover:border-rose-300 dark:hover:border-rose-700/60 transition"
              aria-label="Toggle theme"
            >
              <i className={`fa-solid ${useUIStore((s) => s.theme) === 'dark' ? 'fa-sun text-rose-400' : 'fa-moon text-rose-600'} text-xs`} />
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Interactive REST Tester
            </h1>
            <p className="mt-1 text-xs text-slate-600 dark:text-rose-200/70">
              Pilih endpoint, konfigurasikan parameter, dan amati respons payload JSON secara real-time.
            </p>
          </div>
          <div className="self-start sm:self-auto inline-flex items-center gap-2 rounded-md border border-rose-200 dark:border-rose-900/40 bg-rose-50/80 dark:bg-rose-950/30 px-2.5 py-1 text-xs font-medium text-rose-800 dark:text-rose-200">
            <span className="status-dot-active" /> Server Aktif
          </div>
        </div>

        <div className="rounded-lg border border-rose-200/70 dark:border-rose-950/80 bg-white dark:bg-[#160d13]/80 p-4 sm:p-5 shadow-xs">
          {/* header */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-md border border-rose-200/60 dark:border-rose-950/80 bg-rose-50/40 dark:bg-[#0f0a0d]/60 px-4 py-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-950 dark:text-rose-200">
              <i className="fa-solid fa-sliders text-rose-500" /> Konfigurasi Request
            </div>
            <div className="text-xs text-slate-500 dark:text-rose-200/70 font-mono truncate">
              Base URL: <code className="text-rose-900 dark:text-rose-200 font-semibold">{window.location.origin}</code>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Controls */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Pilih Endpoint API</label>
                <EndpointSelect />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Computed Request Path</label>
                <UrlBar />
              </div>

              <ParamInputs />
              <ExecuteButton />
            </div>

            {/* Output */}
            <ResponsePanel />
          </div>
        </div>
      </main>

      <Toast />
    </div>
  );
}

