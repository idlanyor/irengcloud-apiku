import { Link, useLocation } from 'react-router-dom';
import { useUIStore } from '../stores/useUIStore';
import MobileMenu from './MobileMenu';
import SearchBar from './SearchBar';

const NAV_LINKS = [
  { href: '#features', label: 'Fitur' },
  { href: '/endpoints', label: 'API Endpoints', router: true },
  { href: '#quickstart', label: 'Integrasi Kode' },
];

/** Clean top navigation bar matching IrengCloud design conventions. */
export default function Navbar() {
  const isHome = useLocation().pathname === '/';
  const mobileMenuOpen = useUIStore((s) => s.mobileMenuOpen);
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen);
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);

  const anchorHref = (href) => (isHome ? href : `/${href}`);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0b0f17]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-rose-gradient text-white shadow-sm shadow-rose-900/30">
            <i className="fa-solid fa-bolt text-sm" />
          </div>
          <div className="leading-tight">
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
              IrengCloud <span className="text-rose-600 dark:text-rose-400 font-semibold">API</span>
            </span>
            <span className="block font-mono text-[10px] tracking-wider text-rose-500/80 dark:text-rose-400/70">v1.2.0</span>
          </div>
        </Link>

        <ul className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              {l.router ? (
                <Link to={l.href} className="text-sm font-semibold text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 transition">
                  {l.label}
                </Link>
              ) : (
                <a href={anchorHref(l.href)} className="text-sm font-semibold text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 transition">
                  {l.label}
                </a>
              )}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2.5">
          <SearchBar />

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 dark:border-rose-900/40 bg-slate-50 dark:bg-rose-950/20 text-slate-700 dark:text-rose-200 hover:border-rose-300 dark:hover:border-rose-700/60 transition"
            aria-label={`Ganti ke mode ${theme === 'dark' ? 'terang' : 'gelap'}`}
            title={`Mode ${theme === 'dark' ? 'Terang' : 'Gelap'}`}
          >
            <i className={`fa-solid ${theme === 'dark' ? 'fa-sun text-rose-400' : 'fa-moon text-rose-600'} text-xs`} />
          </button>

          <div className="hidden items-center gap-2 rounded-md border border-slate-200 dark:border-rose-900/40 bg-slate-50 dark:bg-rose-950/20 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-rose-200 md:flex">
            <span className="status-dot-active" /> Online
          </div>

          <Link
            to="/playground"
            className="hidden items-center gap-2 rounded-md bg-rose-gradient text-white hover:opacity-95 shadow-sm shadow-rose-900/20 px-3.5 py-1.5 text-xs font-bold transition md:flex active:scale-[0.98]"
          >
            <i className="fa-solid fa-play text-[10px]" /> <span>Playground</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 lg:hidden hover:bg-slate-100 dark:hover:bg-slate-900"
            aria-label="Toggle Navigation Menu"
          >
            <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`} />
          </button>
        </div>
      </div>

      <MobileMenu />
    </header>
  );
}
