/**
 * Jadwal Sholat Service - Scraper for jadwalsholat.org
 */
export function createSholatService({ httpClient, cheerio, logger }) {
  const BASE_URL = 'https://jadwalsholat.org/jadwal-sholat/monthly.php';

  // In-memory cache for city list
  let cityCache = null;
  let cityCacheTime = 0;
  const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Fetch list of all available cities with their IDs from jadwalsholat.org
   * @param {string} [query] - Optional keyword filter
   */
  async function getKotaList(query = '') {
    const now = Date.now();
    if (!cityCache || now - cityCacheTime > CACHE_TTL) {
      logger.info('Fetching fresh city list from jadwalsholat.org', 'SHOLAT_SERVICE');
      const { data } = await httpClient.get(BASE_URL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        },
        timeout: 15000,
      });

      const $ = cheerio.load(data);
      const cities = [];

      $('select[name="kota"] option').each((_, el) => {
        const id = $(el).attr('value');
        const name = $(el).text().trim();
        if (id && name) {
          cities.push({ id: String(id), kota: name });
        }
      });

      cityCache = cities;
      cityCacheTime = now;
    }

    if (!query) {
      return cityCache;
    }

    const q = String(query).toLowerCase().trim();
    return cityCache.filter(c => c.kota.toLowerCase().includes(q) || c.id === q);
  }

  /**
   * Helper to find city ID by name or return ID if valid
   */
  async function resolveCityId(input) {
    const cities = await getKotaList();
    if (!input) return '308'; // Default Jakarta Pusat

    const strInput = String(input).trim();
    // If input is purely digits, check if ID exists
    if (/^\d+$/.test(strInput)) {
      const match = cities.find(c => c.id === strInput);
      return match ? match.id : '308';
    }

    // Otherwise search by name
    const match = cities.find(c => c.kota.toLowerCase() === strInput.toLowerCase()) ||
                  cities.find(c => c.kota.toLowerCase().includes(strInput.toLowerCase()));
    
    return match ? match.id : '308';
  }

  /**
   * Scrape monthly/daily prayer schedule for a given city ID
   * @param {Object} params
   * @param {string} [params.id] - City ID (e.g. '308')
   * @param {string} [params.kota] - City Name (e.g. 'Jakarta Pusat' or 'Bandung')
   * @param {number} [params.bulan] - Month 1-12
   * @param {number} [params.tahun] - Year (e.g. 2026)
   */
  async function getJadwalSholat({ id, kota, bulan, tahun }) {
    const cityId = id ? String(id) : await resolveCityId(kota);
    
    const currentDate = new Date();
    const m = bulan ? parseInt(bulan, 10) : currentDate.getMonth() + 1;
    const y = tahun ? parseInt(tahun, 10) : currentDate.getFullYear();
    const todayDay = currentDate.getDate();

    const targetUrl = `${BASE_URL}?id=${cityId}&m=${m}&y=${y}`;
    logger.info(`Scraping Jadwal Sholat: ${targetUrl}`, 'SHOLAT_SERVICE');

    const { data } = await httpClient.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);

    // Extract city header title
    const rawTitle = $('h1.h1_edit').text().trim();
    const titleMatch = rawTitle.match(/Jadwal Sholat untuk ([^,]+)/i);
    const cityName = titleMatch ? titleMatch[1].trim() : 'Unknown';

    // Parse schedule table rows
    const scheduleList = [];

    $('tr.table_light, tr.table_dark, tr.table_highlight').each((_, el) => {
      const tds = $(el).find('td');
      if (tds.length >= 9) {
        const tanggalStr = $(tds[0]).text().trim();
        const tanggalNum = parseInt(tanggalStr, 10);

        scheduleList.push({
          tanggal: tanggalStr,
          imsak: $(tds[1]).text().trim(),
          subuh: $(tds[2]).text().trim(),
          terbit: $(tds[3]).text().trim(),
          dhuha: $(tds[4]).text().trim(),
          dzuhur: $(tds[5]).text().trim(),
          ashr: $(tds[6]).text().trim(),
          maghrib: $(tds[7]).text().trim(),
          isya: $(tds[8]).text().trim(),
          is_today: (m === currentDate.getMonth() + 1 && y === currentDate.getFullYear() && tanggalNum === todayDay)
        });
      }
    });

    if (scheduleList.length === 0) {
      throw new Error('Gagal mengekstrak tabel jadwal sholat dari jadwalsholat.org');
    }

    // Find today's schedule if available
    const todaySchedule = scheduleList.find(s => s.is_today) || scheduleList[0];

    return {
      kota: cityName,
      city_id: cityId,
      periode: {
        bulan: m,
        tahun: y
      },
      today: todaySchedule,
      jadwal_bulanan: scheduleList
    };
  }

  return {
    getKotaList,
    getJadwalSholat
  };
}
