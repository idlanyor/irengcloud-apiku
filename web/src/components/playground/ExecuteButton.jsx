import { useEndpointStore } from '../../stores/useEndpointStore';
import { usePlaygroundStore } from '../../stores/usePlaygroundStore';

/** Tombol kirim — jalankan fetch via store; disabled saat pending. */
export default function ExecuteButton() {
  const selectedKey = useEndpointStore((s) => s.selectedKey);
  const params = useEndpointStore((s) => s.params);
  const status = usePlaygroundStore((s) => s.status);
  const execute = usePlaygroundStore((s) => s.execute);

  return (
    <button
      onClick={() => execute(selectedKey, params)}
      disabled={status === 'pending'}
      className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-rose-gradient px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-rose-900/30 transition hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {status === 'pending' ? (
        <>
          <i className="fa-solid fa-spinner fa-spin text-xs" /> Memproses...
        </>
      ) : (
        <>
          <i className="fa-solid fa-paper-plane text-xs text-rose-100" /> Kirim Request
        </>
      )}
    </button>
  );
}
