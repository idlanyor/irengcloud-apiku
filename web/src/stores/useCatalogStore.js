import { create } from 'zustand';

/**
 * Catalog endpoint — di-fetch sekali dari /api/v1/catalog (sumber tunggal
 * server-side). Semua halaman (home, playground, /endpoints) baca dari sini.
 *
 * load() idempotent (guard status) biar StrictMode double-mount tak double-fetch.
 */
/** Count per kategori + 'all' — dihitung sekali saat load (referensi stabil). */
function computeCounts(endpoints, categories) {
  const counts = { all: endpoints.length };
  for (const cat of categories) {
    counts[cat.key] = endpoints.filter((e) => e.category === cat.key).length;
  }
  return counts;
}

export const useCatalogStore = create((set, get) => ({
  status: 'idle', // idle = belum pernah fetch; guard load() biar tak skip panggilan pertama
  error: null,
  categories: [],
  endpoints: [],
  counts: { all: 0 },

  load: async () => {
    const s = get().status;
    if (s === 'ready' || s === 'loading') return;
    set({ status: 'loading', error: null });

    try {
      const res = await fetch('/api/v1/catalog');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const categories = data.categories ?? [];
      const endpoints = data.endpoints ?? [];
      set({ status: 'ready', categories, endpoints, counts: computeCounts(endpoints, categories) });
    } catch (err) {
      set({ status: 'error', error: err.message });
    }
  },

  getEndpoint: (key) => get().endpoints.find((e) => e.key === key) || null,

  byCategory: (catKey) => get().endpoints.filter((e) => e.category === catKey),
}));
