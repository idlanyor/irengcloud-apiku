import defaultAxios from 'axios';
import * as defaultCheerio from 'cheerio';
import defaultLogger from '../../utils/logger.js';

export const MAULID_BOOKS = {
  'maulid-dibai': {
    name: "Maulid Diba'i",
    author: "Wajihuddin Abdurrahman bin Muhammad asy-Syaibani az-Zabidi (Ibnud Diba')",
    total_bacaan: '29 Bacaan',
  },
  'maulidul-barzanji': {
    name: 'Maulid Barzanji',
    author: "Sayyid Ja'far bin Hasan al-Barzanji",
    total_bacaan: '20 Bacaan',
  },
  'syaraful-anam': {
    name: 'Maulid Syarafil Anam',
    author: 'Syihabuddin Ahmad bin Ali bin Qasim al-Hariri',
    total_bacaan: '39 Bacaan',
  },
  'maulid-simthud-duror': {
    name: 'Simthud Durar',
    author: 'Habib Ali bin Muhammad al-Habsyi',
    total_bacaan: '17 Bacaan',
  },
  'qasidah-burdah': {
    name: 'Qasidah Burdah',
    author: "Imam Syarafuddin Abu Abdillah Muhammad bin Sa'id al-Bushiri",
    total_bacaan: '10 Bacaan',
  },
  'adl-dliyaul-lami': {
    name: "Adl-Dliyaul Lami'",
    author: 'Habib Umar bin Muhammad bin Salim bin Hafizh',
    total_bacaan: '11 Bacaan',
  },
  'maulid-al-azab': {
    name: "Maulid 'Azab",
    author: "Syaikh Muhammad bin Muhammad al-'Azab",
    total_bacaan: '11 Bacaan',
  },
};

/**
 * Maulid Service
 * Extracts complete Maulid texts (Arabic, Latin, Translation) from NU Online (quran.nu.or.id/maulid)
 */
export function createMaulidService({ httpClient = defaultAxios, cheerio = defaultCheerio, logger = defaultLogger } = {}) {
  const BASE_URL = 'https://quran.nu.or.id/maulid';

  function getBooksList() {
    return Object.entries(MAULID_BOOKS).map(([slug, meta]) => ({
      slug,
      name: meta.name,
      author: meta.author,
      total_bacaan: meta.total_bacaan,
      url: `${BASE_URL}/${slug}`,
    }));
  }

  async function getMaulidData({ category = '', slug = '' } = {}) {
    const rawKey = (slug || category || 'maulid-dibai').trim().toLowerCase();
    const cleanKey = rawKey.replace(/^\/+|\/+$/g, '').replace(/^maulid\//i, '');
    const activeSlug = MAULID_BOOKS[cleanKey] ? cleanKey : 'maulid-dibai';
    const bookMeta = MAULID_BOOKS[activeSlug] || { name: 'Kitab Maulid Nabi', author: null, total_bacaan: null };

    const targetUrl = `${BASE_URL}/${activeSlug}`;
    logger.info(`Fetching Maulid content from ${targetUrl}`, 'MAULID_SERVICE');

    const { data } = await httpClient.get(targetUrl, {
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

    const pageTitle = $('h1').first().text().trim() || bookMeta.name;

    return {
      slug: activeSlug,
      name: bookMeta.name,
      author: bookMeta.author,
      title: pageTitle,
      source: targetUrl,
      total_verses: verses.length,
      available_books: getBooksList(),
      verses,
    };
  }

  return {
    getBooksList,
    getMaulidData,
    MAULID_BOOKS,
  };
}

export const defaultMaulidService = createMaulidService();
export const getBooksList = defaultMaulidService.getBooksList;
export const getMaulidData = defaultMaulidService.getMaulidData;
