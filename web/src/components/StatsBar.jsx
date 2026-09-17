const STATS = [
  { value: '35+', label: 'Modul Endpoint Aktif' },
  { value: 'Cloudflare R2', label: 'Object Storage' },
  { value: '< 15 ms', label: 'Rata-rata Latensi' },
  { value: '99.9%', label: 'Uptime Layanan' },
];

export default function StatsBar() {
  return (
    <section className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/30">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 lg:grid-cols-4 lg:px-8">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white lg:text-3xl tracking-tight">
              {s.value}
            </div>
            <div className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
