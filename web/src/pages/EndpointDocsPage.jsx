import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import EndpointDocItem from '../components/EndpointDocItem';
import SearchBar from '../components/SearchBar';
import { useCatalogStore } from '../stores/useCatalogStore';
import { filterEndpoints } from '../lib/url';

/**
 * /endpoints — dokumentasi detail SEMUA endpoint, grup per kategori.
 * Data dari catalog store (fetch /api/v1/catalog, satu sumber kebenaran).
 */
export default function EndpointDocsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const status = useCatalogStore((s) => s.status);
  const error = useCatalogStore((s) => s.error);
  const load = useCatalogStore((s) => s.load);
  const categories = useCatalogStore((s) => s.categories);
  const endpoints = useCatalogStore((s) => s.endpoints);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen bg-[#fff8f9] dark:bg-[#0f0a0d] text-rose-950 dark:text-rose-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        {/* Header */}
        <div className="mb-10 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
            Spesifikasi REST API
          </span>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Dokumentasi Lengkap
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-rose-200/70">
            Seluruh endpoint menggunakan awalan <code className="font-mono text-rose-700 dark:text-rose-300">/api/v1</code> dan mengembalikan
            respons JSON terstruktur.
          </p>
          {status === 'ready' && (
            <div className="mt-4 flex gap-2">
              <span className="rounded-md border border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/40 px-2.5 py-1 text-xs font-mono text-rose-800 dark:text-rose-300">
                {endpoints.length} Endpoint
              </span>
              <span className="rounded-md border border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/40 px-2.5 py-1 text-xs font-mono text-rose-700 dark:text-rose-400">
                {categories.length} Kategori
              </span>
            </div>
          )}
        </div>

        {/* Search endpoint */}
        {status === 'ready' && (
          <div className="mb-10 max-w-xl">
            <SearchBar
              value={q}
              onChange={(v) => setSearchParams(v ? { q: v } : {}, { replace: true })}
            />
            {q && (
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                <strong className="text-slate-900 dark:text-white">{filterEndpoints(endpoints, q).length}</strong> hasil untuk{' '}
                <code className="text-slate-800 dark:text-slate-300">"{q}"</code>
              </p>
            )}
          </div>
        )}

        {/* Body */}
        {(status === 'loading' || status === 'idle') && (
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-10 text-center text-sm text-slate-500 dark:text-slate-400">
            Memuat dokumentasi endpoint...
          </div>
        )}
        {status === 'error' && (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 p-10 text-center">
            <p className="text-sm text-red-600 dark:text-red-300">Gagal memuat katalog endpoint: {error}</p>
            <button onClick={load} className="rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-950 px-3.5 py-1.5 text-xs font-bold">
              Muat Ulang
            </button>
          </div>
        )}
        {status === 'ready' && (() => {
          const filtered = filterEndpoints(endpoints, q);
          if (!filtered.length) {
            return (
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-10 text-center">
                <i className="fa-solid fa-magnifying-glass mb-3 text-2xl text-slate-400 dark:text-slate-500" />
                <p className="font-semibold text-slate-900 dark:text-white text-sm">Tidak ada endpoint cocok dengan "{q}"</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Coba kata kunci lain — nama, path, atau parameter.</p>
              </div>
            );
          }
          return (
          <div className="flex flex-col gap-10">
            {categories.map((cat) => {
              const items = filtered.filter((e) => e.category === cat.key);
              if (!items.length) return null;
              return (
                <section key={cat.key} id={`cat-${cat.key}`}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
                      <i className={`${cat.icon ?? 'fa-solid fa-box'} text-xs`} />
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{cat.label}</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{cat.description}</p>
                    </div>
                    <span className="ml-auto rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 px-2.5 py-1 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                      {items.length} endpoint
                    </span>
                  </div>
                  <div className="flex flex-col gap-4">
                    {items.map((ep) => (
                      <EndpointDocItem key={ep.key} endpoint={ep} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
          );
        })()}
      </main>

      <Footer />
      <Toast />
    </div>
  );
}
