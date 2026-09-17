import defaultAxios from 'axios';
import * as defaultCheerio from 'cheerio';
import defaultLogger from '../../utils/logger.js';

/**
 * Tahlil Service
 * Scrapes and serves the complete 56 Bacaan Tahlil texts (Arabic, Latin transliteration, and Indonesian translation) from NU Online.
 */
export function createTahlilService({ httpClient = defaultAxios, cheerio = defaultCheerio, logger = defaultLogger } = {}) {
  const TARGET_URL = 'https://quran.nu.or.id/tahlil';

  let cachedData = null;
  let cacheTimestamp = 0;
  const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour in-memory cache

  async function fetchTahlilFromSource() {
    logger.info(`Fetching Tahlil texts from ${TARGET_URL}`, 'TAHLIL_SERVICE');

    const { data } = await httpClient.get(TARGET_URL, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);
    const verses = [];

    $('.flex-grow.flex.flex-col.ms-2, .last\\:border-none, .flex-grow.flex.flex-col').each((_, el) => {
      const $el = $(el);
      const arabic = $el.find('[dir="rtl"], .text-right').text().trim();
      const latin = $el.find('.text-primary-500, .dark\\:text-primary-300').text().trim();
      const terjemah = $el.find('.text-neutral-700, .dark\\:text-neutral-300').text().trim();

      if (arabic || terjemah) {
        verses.push({
          number: verses.length + 1,
          arabic,
          latin: latin || null,
          terjemah: terjemah || null,
        });
      }
    });

    const title = $('h1').first().text().trim() || 'Bacaan Tahlil';

    return {
      title,
      source: TARGET_URL,
      total_verses: verses.length,
      verses,
    };
  }

  async function getCachedTahlil() {
    const now = Date.now();
    if (!cachedData || now - cacheTimestamp > CACHE_TTL_MS) {
      cachedData = await fetchTahlilFromSource();
      cacheTimestamp = now;
    }
    return cachedData;
  }

  async function getTahlilData({ page, limit, number } = {}) {
    const fullData = await getCachedTahlil();

    if (number !== undefined && number !== null && number !== '') {
      const num = parseInt(number, 10);
      const single = fullData.verses.find((v) => v.number === num);
      if (!single) {
        throw new Error(`Bacaan Tahlil nomor ${num} tidak ditemukan. Rentang nomor yang valid: 1 - ${fullData.total_verses}`);
      }
      return {
        title: fullData.title,
        source: fullData.source,
        verse: single,
      };
    }

    if (page !== undefined || limit !== undefined) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, parseInt(limit, 10) || 20);
      const startIndex = (pageNum - 1) * limitNum;
      const paginatedVerses = fullData.verses.slice(startIndex, startIndex + limitNum);

      return {
        title: fullData.title,
        source: fullData.source,
        total_verses: fullData.total_verses,
        page: pageNum,
        limit: limitNum,
        total_pages: Math.ceil(fullData.total_verses / limitNum),
        data: paginatedVerses,
      };
    }

    return {
      title: fullData.title,
      source: fullData.source,
      total_verses: fullData.total_verses,
      data: fullData.verses,
    };
  }

  async function getVerse(number) {
    return getTahlilData({ number });
  }

  return {
    getTahlilData,
    getVerse,
  };
}

export const defaultTahlilService = createTahlilService();
export const getTahlilData = defaultTahlilService.getTahlilData;
export const getVerse = defaultTahlilService.getVerse;
