import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Pencarian endpoint — 2 mode:
 * - variant="navbar": input di navbar, Enter → navigasi /endpoints?q=... (deep-link).
 * - variant="docs": input di halaman /endpoints, live filter via q di URL.
 * Nilai di-sync ke URLSearchParams biar shareable + back button works.
 */
export default function SearchBar({ variant = 'docs', value, onChange, placeholder }) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState('');

  // docs: controlled dari parent (q di URL). navbar: local draft, commit on submit.
  const current = variant === 'docs' ? value : draft;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (variant === 'docs') return; // live filter, tak perlu submit
    navigate(`/endpoints${current.trim() ? `?q=${encodeURIComponent(current.trim())}` : ''}`);
  };

  return (
    <form onSubmit={handleSubmit} role="search">
      <div className="relative">
        <i className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500" />
        <input
          type="search"
          value={current}
          onChange={(e) => {
            if (variant === 'docs') onChange(e.target.value);
            else setDraft(e.target.value);
          }}
          placeholder={placeholder ?? 'Cari endpoint, path, atau parameter...'}
          className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 py-1.5 pl-8 pr-8 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition focus:border-slate-400 dark:focus:border-slate-600"
          aria-label="Cari endpoint"
        />
        {current && (
          <button
            type="button"
            onClick={() => (variant === 'docs' ? onChange('') : setDraft(''))}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
            aria-label="Bersihkan pencarian"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        )}
      </div>
    </form>
  );
}
