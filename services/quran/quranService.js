/**
 * Al-Quran Service — proxy data.equran.id (API v2)
 */
export function createQuranService({ httpClient, logger }) {
  const BASE_URL = 'https://equran.id/api/v2';
  const CACHE_TTL = 24 * 60 * 60 * 1000;
  const cache = new Map();

  async function fetchEquran(path, cacheKey) {
    const hit = cache.get(cacheKey);
    const now = Date.now();
    if (hit && now - hit.time < CACHE_TTL) {
      return hit.data;
    }

    logger.info(`Fetching ${BASE_URL}${path} from equran.id`, 'QURAN_SERVICE');
    const { data } = await httpClient.get(`${BASE_URL}${path}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      timeout: 15000,
    });

    if (!data || data.code !== 200 || !data.data) {
      throw new Error('Respons tidak valid dari equran.id');
    }

    cache.set(cacheKey, { data: data.data, time: now });
    return data.data;
  }

  async function getSuratList() {
    return fetchEquran('/surat', 'quran_surat_list');
  }

  async function getSurat(nomor) {
    const n = Number(nomor);
    if (!Number.isInteger(n) || n < 1 || n > 114) {
      const error = new Error('Nomor surat harus antara 1-114');
      error.status = 400;
      throw error;
    }

    return fetchEquran(`/surat/${n}`, `quran_surat_${n}`);
  }

  async function getTafsir(nomor) {
    const n = Number(nomor);
    if (!Number.isInteger(n) || n < 1 || n > 114) {
      const error = new Error('Nomor surat harus antara 1-114');
      error.status = 400;
      throw error;
    }

    return fetchEquran(`/tafsir/${n}`, `quran_tafsir_${n}`);
  }

  /**
   * Cari ayat berdasarkan kata kunci di terjemahan Bahasa Indonesia
   * @param {Object} params
   * @param {string} params.q - Kata kunci pencarian
   * @param {number} [params.page] - Nomor halaman (default 1)
   * @param {number} [params.size] - Jumlah hasil per halaman (default 10, max 50)
   */
  async function searchAyat({ q, page = 1, size = 10 } = {}) {
    const query = String(q || '').trim();
    if (!query) {
      const error = new Error('Parameter q (kata kunci) wajib diisi');
      error.status = 400;
      throw error;
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(size, 10) || 10));

    const { data } = await httpClient.get('https://api.quran.com/api/v4/search', {
      params: { q: query, language: 'id', page: pageNumber, size: pageSize },
      timeout: 15000,
    });

    if (!data || !data.search) {
      throw new Error('Respons tidak valid dari quran.com');
    }

    const { results, total_results, current_page, total_pages } = data.search;

    return {
      query,
      total: total_results,
      page: current_page,
      total_pages: total_pages,
      size: pageSize,
      data: results.map(r => ({
        ayat_key: r.verse_key,
        arab: r.text,
        terjemahan: r.translations?.[0]?.text || null,
      })),
    };
  }

  return {
    getSuratList,
    getSurat,
    getTafsir,
    searchAyat,
  };
}
