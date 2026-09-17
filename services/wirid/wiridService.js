/**
 * Wirid & Dzikir Service
 * Extracts complete Wirid, Ratib, Hizib, and Shalawat texts (Arabic, Latin, Translation) from NU Online
 */
export function createWiridService({ httpClient, cheerio, logger }) {
  const BASE_URL = 'https://quran.nu.or.id/wirid';

  const CATEGORIES = {
    'wirid-harian': 'Wirid Harian',
    'shalawat': 'Shalawat',
    'munajat': 'Asmaul Husna & Munajat',
    'istighotsah-mujahadah': 'Istighotsah & Mujahadah',
    'ratib': 'Ratib',
    'hizib': 'Hizib',
    'manaqib-syekh-abdul-qadir': 'Manaqib Syekh Abdul Qadir',
    'dalailul-khairat': 'Dalailul Khairat',
  };

  /**
   * Get list of Wirid categories or specific category detail
   * @param {Object} params
   * @param {string} [params.category] - Category slug ('wirid-harian', 'ratib', 'hizib', 'shalawat', etc.)
   */
  async function getWiridData({ category = '' } = {}) {
    const slug = category && CATEGORIES[category] ? category : 'wirid-harian';
    const targetUrl = `${BASE_URL}/${slug}`;

    logger.info(`Fetching Wirid content from ${targetUrl}`, 'WIRID_SERVICE');

    const { data } = await httpClient.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);
    const verses = [];

    // Parse verses block
    $('.flex-grow.flex.flex-col.ms-2, .last\\:border-none').each((_, el) => {
      const $el = $(el);
      const arabic = $el.find('[dir="rtl"], .text-right').text().trim();
      const latin = $el.find('.text-primary-500, .dark\\:text-primary-300').text().trim();
      const terjemah = $el.find('.text-neutral-700, .dark\\:text-neutral-300').text().trim();

      if (arabic || terjemah) {
        verses.push({
          arabic,
          latin: latin || null,
          terjemah: terjemah || null,
        });
      }
    });

    // Extract section titles if present
    const sectionTitle = $('h1').first().text().trim() || CATEGORIES[slug];

    return {
      category: slug,
      category_label: CATEGORIES[slug] || 'Wirid & Dzikir',
      title: sectionTitle,
      total_verses: verses.length,
      available_categories: CATEGORIES,
      data: verses,
    };
  }

  return {
    getWiridData,
    CATEGORIES,
  };
}
