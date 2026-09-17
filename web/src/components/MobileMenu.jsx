import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUIStore } from '../stores/useUIStore';

const LINKS = [
  { href: '#features', icon: 'fa-solid fa-layer-group', label: 'Fitur Utama' },
  { href: '/endpoints', icon: 'fa-solid fa-code', label: 'API Endpoints', router: true },
  { href: '#quickstart', icon: 'fa-solid fa-laptop-code', label: 'Integrasi Kode' },
];

export default function MobileMenu() {
  const open = useUIStore((s) => s.mobileMenuOpen);
  const setOpen = useUIStore((s) => s.setMobileMenuOpen);
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, setOpen]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Dimmed backdrop backdrop click closes menu */}
      <div 
        className="fixed inset-0 top-[65px] z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity animate-fade-in"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Slide down menu container */}
      <div className="absolute inset-x-0 top-full z-50 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f17] shadow-2xl lg:hidden animate-slide-down">
        <div className="max-h-[calc(100vh-80px)] overflow-y-auto px-4 py-5">
          <ul className="flex flex-col gap-2">
            {LINKS.map((l) => (
              <li key={l.href}>
                {l.router ? (
                  <Link
                    to={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-950 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 dark:hover:text-white transition"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      <i className={`${l.icon} text-xs`} />
                    </div>
                    <span>{l.label}</span>
                  </Link>
                ) : (
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-950 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 dark:hover:text-white transition"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      <i className={`${l.icon} text-xs`} />
                    </div>
                    <span>{l.label}</span>
                  </a>
                )}
              </li>
            ))}

            <li className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <Link
                to="/playground"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-950 px-4 py-2.5 text-sm font-bold transition hover:bg-slate-800 dark:hover:bg-slate-200"
              >
                <i className="fa-solid fa-play text-xs" /> Buka API Playground
              </Link>
            </li>
          </ul>

          <div className="mt-4 flex items-center justify-between rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3 py-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-2">
              <span className="status-dot-active" /> Server Online
            </span>
            <span className="font-mono text-slate-700 dark:text-slate-300">v1.2.0</span>
          </div>
        </div>
      </div>
    </>
  );
}

