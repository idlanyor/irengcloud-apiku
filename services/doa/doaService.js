/**
 * Doa Harian & Pilihan Service
 * Extracts complete Doa texts (Arabic, Latin, Translation) from NU Online
 */
export function createDoaService({ httpClient, cheerio, logger }) {
  const BASE_URL = 'https://quran.nu.or.id/doa';

  const CATEGORIES = {
    'doa-keseharian': 'Doa Keseharian',
    'doa-rezeki': 'Doa Rezeki',
    'doa-tolak-bala': 'Doa Tolak Bala',
    'doa-kesehatan': 'Doa Kesehatan',
    'doa-perjalanan': 'Doa Perjalanan',
    'doa-ilmu': 'Doa Ilmu',
    'doa-waktu-tertentu': 'Doa Waktu Tertentu',
    'doa-kualitas-diri': 'Doa Kualitas Diri',
    'doa-pernikahan-rumah-tangga': 'Doa Pernikahan & Rumah Tangga',
    'doa-hamil-persalinan': 'Doa Hamil & Persalinan',
    'doa-wudhu': 'Doa Wudhu',
    'doa-para-nabi-di-al-quran': 'Doa para Nabi di Al-Quran',
    'doa-baca-al-quran': 'Doa Baca Al-Quran',
    'doa-shalat': 'Doa Shalat',
    'doa-haji-umrah': 'Doa Haji & Umrah',
    'doa-kematian': 'Doa Kematian',
  };

  /**
   * Get list of Doa by category
   * @param {Object} params
   * @param {string} [params.category] - Category slug ('doa-keseharian', 'doa-rezeki', 'doa-tolak-bala', etc.)
   */
  async function getDoaData({ category = '' } = {}) {
    const slug = category && CATEGORIES[category] ? category : 'doa-keseharian';
    const targetUrl = `${BASE_URL}/${slug}`;

    logger.info(`Fetching Doa content from ${targetUrl}`, 'DOA_SERVICE');

    const { data } = await httpClient.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);
    const doas = [];

    // Parse items block
    $('.flex-grow.flex.flex-col.ms-2, .last\\:border-none').each((_, el) => {
      const $el = $(el);
      const title = $el.find('.font-semibold, h2, h3').first().text().trim();
      const arabic = $el.find('[dir="rtl"], .text-right').text().trim();
      const latin = $el.find('.text-primary-500, .dark\\:text-primary-300').text().trim();
      const terjemah = $el.find('.text-neutral-700, .dark\\:text-neutral-300').text().trim();

      if (arabic || terjemah) {
        doas.push({
          title: title || null,
          arabic,
          latin: latin || null,
          terjemah: terjemah || null,
        });
      }
    });

    const pageTitle = $('h1').first().text().trim() || CATEGORIES[slug];

    return {
      category: slug,
      category_label: CATEGORIES[slug] || 'Kumpulan Doa',
      title: pageTitle,
      total_doa: doas.length,
      available_categories: CATEGORIES,
      data: doas,
    };
  }

  return {
    getDoaData,
    CATEGORIES,
  };
}
