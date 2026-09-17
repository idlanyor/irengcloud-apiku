/**
 * Lazy resolve lokasi → kode adm4 via wilayah.id (Kepmendagri 2025).
 * Tanpa prebuild index — walk hierarki level-by-level, 4 fetch per lookup.
 * Dipakai endpoint /api/v1/bmkg/cuaca buat resolve nama desa.
 */
const BASE = 'https://wilayah.id/api';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

// Cache per-level in-memory (provinsi sekali, kota per provinsi, dst)
const cache = new Map();
async function getJson(url) {
  if (cache.has(url)) return cache.get(url);
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`wilayah.id ${url} -> ${res.status}`);
  const data = await res.json();
  cache.set(url, data);
  return data;
}

function norm(s) {
  return String(s ?? '').toLowerCase().trim();
}

/** Cari entri by nama (exact → includes → contained). */
function findByName(list, name) {
  const n = norm(name);
  if (!n) return null;
  return (
    list.find((x) => norm(x.name) === n) ||
    list.find((x) => norm(x.name).includes(n)) ||
    list.find((x) => n.includes(norm(x.name))) ||
    null
  );
}

/**
 * Resolve nama "desa,kecamatan,kota,provinsi" → kode adm4 desa.
 * - desa wajib.
 * - provinsi opsional: bila kosong tapi kota ada, scan semua provinsi (38 fetch, cache).
 * - kecamatan wajib (tanpa itu desa ambigu; terlalu mahal scan semua kecamatan).
 * Return { adm4, lokasi } atau null.
 */
export async function resolveAdm4(input) {
  const parts = String(input ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const [desa, kecamatan, kota, provinsi] = parts;

  if (!desa || !kecamatan) return null;

  // level 1: provinsi (langsung atau scan semua)
  let prov = null;
  if (provinsi) {
    const provs = (await getJson(`${BASE}/provinces.json`)).data;
    prov = findByName(provs, provinsi);
  } else {
    const provs = (await getJson(`${BASE}/provinces.json`)).data;
    for (const p of provs) {
      const regs = (await getJson(`${BASE}/regencies/${p.code}.json`)).data;
      if (findByName(regs, kota)) {
        prov = p;
        break;
      }
    }
  }
  if (!prov) return null;

  const regs = (await getJson(`${BASE}/regencies/${prov.code}.json`)).data;
  const reg = findByName(regs, kota) || findByName(regs, desa);
  if (!reg) return null;

  const dists = (await getJson(`${BASE}/districts/${reg.code}.json`)).data;
  const dist = findByName(dists, kecamatan) || findByName(dists, desa);
  if (!dist) return null;

  const vils = (await getJson(`${BASE}/villages/${dist.code}.json`)).data;
  const vil = findByName(vils, desa);
  if (!vil) return null;

  return {
    adm4: vil.code,
    lokasi: {
      provinsi: prov.name,
      kota: reg.name,
      kecamatan: dist.name,
      desa: vil.name,
    },
  };
}
