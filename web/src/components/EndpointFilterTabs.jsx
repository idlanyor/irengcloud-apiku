import { useCatalogStore } from '../stores/useCatalogStore';
import { useUIStore } from '../stores/useUIStore';

const CATEGORY_ICONS = {
  all: 'fa-solid fa-cubes',
  hadits: 'fa-solid fa-book-quran',
  islami: 'fa-solid fa-kaaba',
  budaya: 'fa-solid fa-scroll',
  lirik: 'fa-solid fa-music',
  info: 'fa-solid fa-cloud-bolt',
  anime: 'fa-solid fa-tv',
  manga: 'fa-solid fa-book-open',
  downloader: 'fa-solid fa-download',
};

/** Tab filter kategori — counts dihitung dari catalog store, bukan hardcode. */
export default function EndpointFilterTabs() {
  const activeCategory = useUIStore((s) => s.activeCategory);
  const setCategory = useUIStore((s) => s.setCategory);
  const categories = useCatalogStore((s) => s.categories);
  const counts = useCatalogStore((s) => s.counts);

  const tabs = [{ key: 'all', label: 'Semua' }, ...categories];

  return (
    <div className="mb-8 flex overflow-x-auto pb-2 pt-1 scrollbar-none sm:flex-wrap sm:justify-center gap-2 -mx-4 px-4 sm:mx-0 sm:px-0">
      {tabs.map((cat) => {
        const active = activeCategory === cat.key;
        return (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={`flex shrink-0 items-center gap-2 rounded-md border px-3 py-1.5 text-xs sm:text-sm font-semibold transition active:scale-[0.98] ${
              active
                ? 'border-rose-600 bg-rose-gradient text-white font-bold shadow-sm shadow-rose-900/30'
                : 'border-rose-200/80 bg-rose-50/50 text-rose-900 hover:border-rose-300 hover:text-rose-950 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-200 dark:hover:border-rose-800/60 dark:hover:text-white'
            }`}
          >
            <i className={`${CATEGORY_ICONS[cat.key] ?? 'fa-solid fa-cubes'} text-xs ${active ? 'text-white' : 'text-rose-500/70 dark:text-rose-400'}`} />
            <span>{cat.label}</span>
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-mono ${active ? 'bg-black/20 text-white font-bold' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'}`}>
              {counts[cat.key] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}

