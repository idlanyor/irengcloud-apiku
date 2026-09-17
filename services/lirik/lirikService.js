/**
 * Lirik Musik Service
 * Provides song lyrics (plain + time-synced LRC) lookup and search.
 */
export function createLirikService({ httpClient, logger }) {
  const UPSTREAM = 'https://lrclib.net/api';
  const HEADERS = { 'User-Agent': 'IrengCloud-Universal-API/1.0' };

  /** Normalize upstream track object into IrengCloud's public shape. */
  function normalize(t) {
    if (!t) return null;
    return {
      judul: t.trackName || null,
      artis: t.artistName || null,
      album: t.albumName || null,
      durasi: t.duration ?? null,
      bahasa: t.lang || null,
      instrumen: Boolean(t.instrumental),
      lirik: t.plainLyrics || null,
      lirik_sinkron: t.syncedLyrics || null,
    };
  }

  /**
   * Search lyrics. Free-text `q`, or specific judul/artis/album.
   * @param {Object} params
   * @param {string} [params.q]       - Free-text query (judul/artis/album gabungan)
   * @param {string} [params.judul]   - Track title filter
   * @param {string} [params.artis]   - Artist name filter
   * @param {string} [params.album]   - Album name filter
   * @returns {Promise<Array>} Normalized track list
   */
  async function search({ q, judul, artis, album } = {}) {
    const upstreamParams = {};
    if (q) {
      upstreamParams.q = q;
    } else {
      if (judul) upstreamParams.track_name = judul;
      if (artis) upstreamParams.artist_name = artis;
      if (album) upstreamParams.album_name = album;
    }

    logger.info('Lirik search request', 'LIRIK_SERVICE');

    const { data } = await httpClient.get(`${UPSTREAM}/search`, {
      params: upstreamParams,
      headers: HEADERS,
      timeout: 15000,
      validateStatus: (s) => s < 500,
    });

    return Array.isArray(data) ? data.map(normalize).filter(Boolean) : [];
  }

  /**
   * Get best-matched lyrics for a specific track.
   * @param {Object} params
   * @param {string} params.judul    - Track title (required)
   * @param {string} params.artis    - Artist name (required)
   * @param {string} [params.album]  - Album name (improves accuracy)
   * @param {number} [params.durasi] - Track duration in seconds (improves accuracy)
   * @returns {Promise<Object|null>} Normalized track or null if no match
   */
  async function getBest({ judul, artis, album, durasi } = {}) {
    const upstreamParams = { track_name: judul, artist_name: artis };
    if (album) upstreamParams.album_name = album;
    if (durasi) upstreamParams.duration = durasi;

    logger.info('Lirik get request', 'LIRIK_SERVICE');

    const { data, status } = await httpClient.get(`${UPSTREAM}/get`, {
      params: upstreamParams,
      headers: HEADERS,
      timeout: 15000,
      validateStatus: (s) => s < 500,
    });

    if (status >= 400 || !data || !data.trackName) return null;
    return normalize(data);
  }

  return { search, getBest };
}
