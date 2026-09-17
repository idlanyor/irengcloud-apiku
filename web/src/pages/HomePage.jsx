import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import StatsBar from '../components/StatsBar';
import Features from '../components/Features';
import EndpointFilterTabs from '../components/EndpointFilterTabs';
import EndpointGrid from '../components/EndpointGrid';
import SDKCard from '../components/SDKCard';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import { useCatalogStore } from '../stores/useCatalogStore';

export default function HomePage() {
  const load = useCatalogStore((s) => s.load);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen bg-[#fff8f9] dark:bg-[#0f0a0d] text-rose-950 dark:text-rose-100">
      <Navbar />

      <main>
        <Hero />
        <StatsBar />
        <Features />

        {/* Endpoint docs */}
        <section id="endpoints" className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
              Spesifikasi REST API
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Katalog Endpoint</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-rose-100/70">
              Seluruh endpoint diawali dengan prefix <code className="font-mono text-rose-700 dark:text-rose-300">/api/v1</code> dan
              mengembalikan respons JSON terstandar.
            </p>
          </div>

          <EndpointFilterTabs />
          <EndpointGrid />
        </section>

        {/* Quickstart */}
        <section id="quickstart" className="mx-auto max-w-7xl px-4 pb-20 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Integrasi Cepat</span>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Contoh Kode Integrasi
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Salin potongan kode siap pakai untuk cURL, JavaScript, Python, PHP, dan Go.
            </p>
          </div>
          <SDKCard />
        </section>
      </main>

      <Footer />
      <Toast />
    </div>
  );
}
