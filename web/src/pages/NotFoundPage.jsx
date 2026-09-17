import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0b0f17] px-4 text-center text-slate-100">
      <div className="max-w-md rounded-lg border border-slate-800 bg-slate-900/60 p-8">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-md border border-red-800/60 bg-red-950/40 px-2.5 py-1 text-xs font-semibold text-red-300">
          <i className="fa-solid fa-triangle-exclamation" /> 404 Not Found
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-white">404</h1>
        <h2 className="mt-2 text-lg font-bold text-slate-200">Halaman Tidak Ditemukan</h2>
        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          Rute atau halaman yang Anda cari tidak tersedia di platform IrengCloud API.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/"
            className="rounded-md bg-white px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-slate-200"
          >
            Kembali ke Beranda
          </Link>
          <Link
            to="/playground"
            className="rounded-md border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-700 hover:text-white"
          >
            Buka Playground
          </Link>
        </div>
      </div>
    </div>
  );
}
