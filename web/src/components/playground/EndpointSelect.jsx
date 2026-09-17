import { useCatalogStore } from '../../stores/useCatalogStore';
import { useEndpointStore } from '../../stores/useEndpointStore';

const CATEGORY_LABELS = {
  hadits: 'Kategori: Hadits Digital 9 Imam',
  islami: 'Kategori: Layanan Islami',
  budaya: 'Kategori: Budaya & Aksara',
  lirik: 'Kategori: Lirik Musik',
  info: 'Kategori: Informasi & Cuaca',
  anime: 'Kategori: Anime & Donghua Streaming',
  manga: 'Kategori: Manga & Komik Reader',
  downloader: 'Kategori: Media & File Downloader',
};

/**
 * Select endpoint — optgroup per kategori (dari catalog store).
 * Ganti endpoint me-reset params ke default (via store.selectEndpoint).
 */
export default function EndpointSelect() {
  const status = useCatalogStore((s) => s.status);
  const categories = useCatalogStore((s) => s.categories);
  const endpoints = useCatalogStore((s) => s.endpoints);
  const selectedKey = useEndpointStore((s) => s.selectedKey);
  const selectEndpoint = useEndpointStore((s) => s.selectEndpoint);

  if (status === 'loading' || status === 'idle') {
    return (
      <select disabled className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-400 dark:text-slate-500">
        <option>Memuat endpoint...</option>
      </select>
    );
  }

  return (
    <select
      value={selectedKey ?? ''}
      onChange={(e) => selectEndpoint(e.target.value)}
      className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none transition focus:border-slate-400 dark:focus:border-slate-600"
    >
      {categories.map((cat) => {
        const catEndpoints = endpoints.filter((ep) => ep.category === cat.key);
        // Group by subcategory if available
        const subMap = {};
        catEndpoints.forEach((ep) => {
          const subKey = ep.subcategoryLabel || 'Lainnya';
          if (!subMap[subKey]) subMap[subKey] = [];
          subMap[subKey].push(ep);
        });

        const subKeys = Object.keys(subMap);

        return (
          <optgroup key={cat.key} label={CATEGORY_LABELS[cat.key] ?? cat.label}>
            {subKeys.flatMap((subLabel) =>
              subMap[subLabel].map((ep) => (
                <option key={ep.key} value={ep.key}>
                  [{subLabel}] {ep.methods[0]} {ep.path} ({ep.name})
                </option>
              ))
            )}
          </optgroup>
        );
      })}
    </select>
  );
}
