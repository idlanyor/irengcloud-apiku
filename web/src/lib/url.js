/**
 * Build relative request path dari path template + params (pure).
 * Path param `{imam}` diganti; sisanya jadi query string.
 * Terima PATH langsung (bukan key) — sumber path dari catalog store.
 */
export function computedPath(path, params = {}) {
  if (!path) return '';
  let result = path;
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([pKey, value]) => {
    const val = String(value ?? '').trim();
    if (result.includes(`{${pKey}}`)) {
      result = result.replace(`{${pKey}}`, encodeURIComponent(val || pKey));
    } else if (val) {
      queryParams.append(pKey, val);
    }
  });

  const queryString = queryParams.toString();
  return `${result}${queryString ? '?' + queryString : ''}`;
}

/** Build params object dari endpoint catalog (native default → String). */
export function defaultParamsFor(endpoint) {
  if (!endpoint) return {};
  return endpoint.params.reduce((acc, p) => {
    acc[p.key] = p.default !== undefined ? String(p.default) : '';
    return acc;
  }, {});
}

/** Normalize teks untuk pencarian (lowercase, strip trailing). */
function norm(s) {
  return String(s ?? '').toLowerCase().trim();
}

/**
 * Filter endpoint by query — match nama, path, deskripsi, method, dan param key.
 * Pure, dipakai navbar search & halaman /endpoints.
 */
export function filterEndpoints(endpoints, query) {
  const q = norm(query);
  if (!q) return endpoints;
  return endpoints.filter((ep) => {
    if (norm(ep.name).includes(q)) return true;
    if (norm(ep.path).includes(q)) return true;
    if (norm(ep.description).includes(q)) return true;
    if ((ep.methods ?? []).some((m) => norm(m).includes(q))) return true;
    if ((ep.params ?? []).some((p) => norm(p.key).includes(q) || norm(p.label).includes(q))) return true;
    return false;
  });
}
