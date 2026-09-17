/**
 * Fetch relative — dev di-proxy ke :8410 oleh Vite, prod same-origin.
 * JANGAN hardcode base URL produksi di sini.
 */
export async function apiRequest(relativeUrl, { signal } = {}) {
  const res = await fetch(relativeUrl, {
    headers: { Accept: 'application/json' },
    signal,
  });
  const data = await res.json().catch(() => null);
  return { res, data };
}
