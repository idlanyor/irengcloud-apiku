const FEATURES = [
  {
    icon: 'fa-solid fa-tv',
    title: 'Anime & Donghua Scraper',
    text: 'Dukungan penuh streaming player, episode, jadwal rilis harian, dan mirror decryption dari Otakudesu, Animasu, dan AniChin.',
  },
  {
    icon: 'fa-solid fa-book-open',
    title: 'Komiku Manga Reader',
    text: 'Baca manga/manhwa/manhua gratis lengkap dengan episode chapter dan Image Anti-Hotlink Proxy (Bypass 403 Forbidden).',
  },
  {
    icon: 'fa-solid fa-train',
    title: 'Jadwal KRL, TV & BMKG',
    text: 'Info realtime jam keberangkatan KRL Commuter Line Jabodetabek/Jogja-Solo, jadwal acara TV nasional & live bola, hingga Gempa & Cuaca BMKG.',
  },
  {
    icon: 'fa-solid fa-cloud-arrow-up',
    title: 'Cloud Storage & Temp Mail',
    text: 'Upload file hingga 50MB langsung ke Cloudflare R2 Storage (s3.ireng.uk) serta pembuat email sementara (Mail.tm) dan inbox OTP.',
  },
  {
    icon: 'fa-solid fa-download',
    title: 'Media Downloader Super',
    text: 'Ekstraksi video & gambar kualitas tinggi dari Pinterest, Instagram, TikTok (tanpa WM), YouTube, Threads, Twitter/X, & Mediafire.',
  },
  {
    icon: 'fa-solid fa-book-quran',
    title: 'Hadits FTS & Islami Digital',
    text: 'Pencarian kata kunci SQLite Full-Text Search (FTS) untuk 9 Kitab Hadits Imam Besar, Jadwal Sholat Indonesia, Khutbah, & Doa.',
  },
];

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Keunggulan &amp; Modul</span>
        <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Ekosistem API Serbaguna</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Layanan API terpadu yang handal, cepat, dan siap pakai untuk berbagai kebutuhan aplikasi dan automasi.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-lg border border-rose-200/70 dark:border-rose-950/80 bg-white dark:bg-[#160d13]/80 p-6 transition hover:border-rose-300 dark:hover:border-rose-800/60 hover:shadow-xs"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-rose-gradient text-white shadow-sm shadow-rose-900/30">
              <i className={`${f.icon} text-base`} />
            </div>
            <h3 className="mb-2 text-base font-bold text-slate-900 dark:text-white">{f.title}</h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-rose-100/70">{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
