import { useCatalogStore } from '../stores/useCatalogStore';
import { useUIStore } from '../stores/useUIStore';
import EndpointCard from './EndpointCard';

/** Grid kartu endpoint — difilter oleh useUIStore.activeCategory. */
export default function EndpointGrid() {
  const status = useCatalogStore((s) => s.status);
  const endpoints = useCatalogStore((s) => s.endpoints);
  const activeCategory = useUIStore((s) => s.activeCategory);

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-10 text-center text-sm text-slate-400">
        Memuat katalog endpoint...
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="rounded-lg border border-red-900/40 bg-red-950/20 p-10 text-center text-sm text-red-300">
        Gagal memuat katalog endpoint. Silakan muat ulang halaman.
      </div>
    );
  }

  const visible = endpoints.filter(
    (ep) => activeCategory === 'all' || ep.category === activeCategory
  );

  if (!visible.length) {
    return <div className="text-center text-muted">Tidak ada endpoint di kategori ini.</div>;
  }

  return (
    <div className="grid w-full min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((ep) => (
        <EndpointCard key={ep.key} endpoint={ep} />
      ))}
    </div>
  );
}

