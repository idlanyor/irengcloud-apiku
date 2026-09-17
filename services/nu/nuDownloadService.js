/**
 * NU Online Download Service
 * Scrapes archive files, books, Fatwa/Bahtsul Masail PDFs, and Mars/Audio MP3s from NU Online
 */
export function createNuDownloadService({ httpClient, cheerio, logger }) {
  const BASE_URL = 'https://www.nu.or.id/download';

  const CATEGORIES = {
    'atribut': 'Atribut dan Logo',
    'buku-dan-kitab': 'Buku dan Kitab',
    'amaliyah-nu': 'Amaliyah NU',
    'produk-hukum': 'Produk Hukum',
    'lagu-mars-dan-himne': 'Lagu, Mars dan Himne',
  };

  /**
   * Scrape list of download items from NU Online
   * @param {Object} params
   * @param {string} [params.category] - Category slug ('atribut', 'buku-dan-kitab', 'amaliyah-nu', 'produk-hukum', 'lagu-mars-dan-himne')
   * @param {string} [params.q] - Search query
   */
  async function getDownloadItems({ category = '', q = '' } = {}) {
    const slug = category && CATEGORIES[category] ? category : 'lagu-mars-dan-himne';
    const targetUrl = `${BASE_URL}/${slug}`;

    logger.info(`Fetching NU Online downloads: ${targetUrl}`, 'NU_DOWNLOAD_SERVICE');

    const { data } = await httpClient.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);
    const items = [];

    $('.w-full.flex-col').each((_, el) => {
      const $el = $(el);
      const $link = $el.find('a[href*="storage.nu.or.id"]').first() || $el.find('a').first();
      const fileUrl = $link.attr('href') || '';
      const title = $el.find('.text-gray-900, .dark\\:text-white').text().trim() || $link.text().trim();

      if (title && fileUrl) {
        // File extension detector
        let extension = 'file';
        if (fileUrl.endsWith('.mp3')) extension = 'mp3';
        else if (fileUrl.endsWith('.pdf')) extension = 'pdf';
        else if (fileUrl.endsWith('.mpeg')) extension = 'mpeg';
        else if (fileUrl.endsWith('.png') || fileUrl.endsWith('.jpg')) extension = 'image';
        else if (fileUrl.endsWith('.zip')) extension = 'zip';

        items.push({
          title,
          file_url: fileUrl,
          file_type: extension,
          category: slug,
          category_label: CATEGORIES[slug] || 'Download NU',
        });
      }
    });

    // Client-side search filtering if 'q' is passed
    let filteredItems = items;
    if (q) {
      const queryLower = q.toLowerCase();
      filteredItems = items.filter(item => item.title.toLowerCase().includes(queryLower));
    }

    return {
      category: slug,
      category_label: CATEGORIES[slug] || 'Download NU',
      total: filteredItems.length,
      available_categories: CATEGORIES,
      data: filteredItems,
    };
  }

  return {
    getDownloadItems,
    CATEGORIES,
  };
}
