import { Link } from 'react-router-dom';
import HeroCodeWindow from './HeroCodeWindow';

const METRICS = [
  { icon: 'fa-solid fa-gauge-high', label: '< 15ms Latency' },
  { icon: 'fa-solid fa-cubes', label: '35+ Endpoint Publik' },
  { icon: 'fa-solid fa-cloud-arrow-up', label: 'Cloudflare R2 Storage' },
  { icon: 'fa-solid fa-shield-halved', label: 'Tanpa API Key' },
];

export default function Hero() {
  return (
    <section id="overview" className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0b0f17]">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:py-16 lg:grid-cols-2 lg:px-8 lg:py-20">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/40 px-3 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300">
            <span className="text-rose-600 dark:text-rose-400 font-bold">REST API Platform</span>
            <span className="font-mono text-[11px] text-rose-500/80 dark:text-rose-400/80">v1.2.0</span>
          </div>

          <h1 className="text-3xl font-extrabold leading-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl tracking-tight">
            Universal REST API <br />
            <span className="text-rose-gradient font-black">
              by IrengCloud
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-rose-100/80 sm:text-base">
            Platform API serbaguna dengan latensi rendah (&lt; 15ms) tanpa kewajiban pendaftaran akun.
            Tersedia modul Media Downloader, Hadits Digital FTS5, Layanan Islami, Scraper Anime &amp; Manga, hingga Cloud Uploader.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-2.5">
            <Link
              to="/playground"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-rose-gradient text-white hover:opacity-95 shadow-md shadow-rose-900/20 px-4 py-2.5 text-sm font-bold transition active:scale-[0.99]"
            >
              <i className="fa-solid fa-terminal text-xs text-rose-100" /> Buka API Playground
            </Link>
            <a
              href="/docs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:border-slate-400 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white active:scale-[0.99]"
            >
              <i className="fa-solid fa-book text-xs text-slate-400 dark:text-slate-500" /> Swagger UI
            </a>
            <a
              href="/swagger.yaml"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:border-slate-400 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white active:scale-[0.99]"
            >
              <i className="fa-solid fa-file-code text-xs text-slate-400 dark:text-slate-500" /> OpenAPI Spec
            </a>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-4">
            {METRICS.map((m) => (
              <div key={m.label} className="flex items-center gap-2 rounded-md border border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/40 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300">
                <i className={`${m.icon} text-slate-400 dark:text-slate-400 shrink-0 text-xs`} />
                <span className="truncate">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        <HeroCodeWindow />
      </div>
    </section>
  );
}

