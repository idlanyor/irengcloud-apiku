import { Link } from 'react-router-dom';

const NAV_LINKS = [
  { href: '#overview', label: 'Overview' },
  { href: '#features', label: 'Fitur Utama' },
  { href: '/playground', label: 'API Playground' },
  { href: '/endpoints', label: 'Dokumentasi' },
];

const MODULE_LINKS = [
  { href: '/playground', label: 'Hadits Search FTS' },
  { href: '/playground', label: 'Shahih Bukhari & Muslim' },
  { href: '/playground', label: 'Instagram Extractor' },
  { href: '/endpoints', label: 'Spesifikasi REST' },
];

const SEO_LINKS = [
  { href: '/playground', label: 'API Playground', bold: true },
  { href: '/endpoints', label: 'Dokumentasi Endpoint' },
  { href: '/docs', label: 'Swagger UI' },
  { href: '/ai/docs', label: 'AI Docs (Markdown)' },
  { href: '/llms.txt', label: 'llms.txt' },
  { href: '/llms.json', label: 'llms.json' },
  { href: '/swagger.json', label: 'OpenAPI JSON' },
  { href: '/swagger.yaml', label: 'OpenAPI YAML' },
  { href: '/sitemap.xml', label: 'Sitemap', muted: true },
  { href: '/robots.txt', label: 'Robots', muted: true },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-white dark:bg-slate-800 dark:border dark:border-slate-700">
                <i className="fa-solid fa-bolt text-xs" />
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white text-base">
                IrengCloud <span className="text-slate-500 dark:text-slate-400 font-semibold">API</span>
              </span>
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Layanan REST API Universal berkinerja tinggi, tanpa API Key, dan siap pakai untuk komunitas pengembang.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300">Navigasi</h3>
            <ul className="space-y-2 text-xs">
              {NAV_LINKS.map((l) => (
                <li key={l.label}>
                  {l.href.startsWith('/') ? (
                    <Link to={l.href} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
                      {l.label}
                    </Link>
                  ) : (
                    <a href={l.href} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300">Modul API</h3>
            <ul className="space-y-2 text-xs">
              {MODULE_LINKS.map((l) => (
                <li key={l.label}>
                  {l.href.startsWith('/') ? (
                    <Link to={l.href} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
                      {l.label}
                    </Link>
                  ) : (
                    <a href={l.href} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300">Status Sistem</h3>
            <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3">
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <span className="status-dot-active" /> Semua Sistem Aktif
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Version: <span className="text-slate-800 dark:text-slate-200">v1.2.0</span>
                <br />
                Header: <span className="text-slate-800 dark:text-slate-200">X-Api-Version</span>
              </p>
            </div>
          </div>
        </div>

        {/* SEO internal links */}
        <div className="mt-10 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-200 dark:border-slate-800/80 pt-6 text-xs">
          <span className="text-slate-600 dark:text-slate-400 font-semibold">Spesifikasi &amp; Dokumentasi:</span>
          {SEO_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 dark:border-slate-800/80 pt-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <div>
            &copy; 2026 <strong className="text-slate-700 dark:text-slate-300">IrengCloud Universal API</strong>. All rights reserved.
          </div>
          <div className="flex gap-4">
            <a href="https://irengcloud.com" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              irengcloud.com
            </a>
            <a href="https://apiku.irengcloud.com" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              apiku.irengcloud.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
