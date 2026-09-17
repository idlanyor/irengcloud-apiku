/**
 * MUI Khutbah Service
 * Scrapes Friday Sermons (Khutbah Jumat & Idul Fitri) from mui.or.id
 */
export function createKhutbahService({ httpClient, cheerio, logger }) {
  const BASE_URL = 'https://mui.or.id/info-khutbah';

  /**
   * Scrape paginated list of Khutbah articles from mui.or.id
   * @param {Object} params
   * @param {number} [params.page=1]
   * @param {number} [params.per_page=20]
   */
  async function getKhutbahList({ page = 1, per_page = 20 } = {}) {
    const pageNum = parseInt(page, 10) || 1;
    const perPageNum = parseInt(per_page, 10) || 20;

    const targetUrl = `${BASE_URL}?per_page=${perPageNum}&page=${pageNum}`;
    logger.info(`Fetching Khutbah MUI list: ${targetUrl}`, 'KHUTBAH_SERVICE');

    const { data } = await httpClient.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);
    const khutbahItems = [];

    $('article.post-card').each((_, el) => {
      const $card = $(el);
      const $link = $card.find('a.post-link');
      const href = $link.attr('href') || '';
      
      const title = $card.find('.post-title').text().trim() || $card.find('img').attr('alt') || '';
      const thumbnail = $card.find('img').attr('src') || '';
      const category = $card.find('.post-category').text().trim() || 'Khutbah';
      const dateStr = $card.find('time.post-date').text().trim() || '';

      if (title && href) {
        khutbahItems.push({
          title,
          url: href.startsWith('http') ? href : `https://mui.or.id${href}`,
          thumbnail,
          category,
          date: dateStr,
        });
      }
    });

    return {
      page: pageNum,
      per_page: perPageNum,
      total: khutbahItems.length,
      data: khutbahItems,
    };
  }

  /**
   * Scrape full detail text of a Khutbah article
   * @param {string} url - Full MUI article URL
   */
  async function getKhutbahDetail(url) {
    if (!url) throw new Error('Parameter "url" wajib diisi.');
    
    logger.info(`Fetching Khutbah MUI detail: ${url}`, 'KHUTBAH_SERVICE');

    const { data } = await httpClient.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);

    const title = $('h1').first().text().trim() || $('.post-title').first().text().trim();
    const thumbnail = $('.post-media img').attr('src') || $('article img').first().attr('src') || '';
    const dateStr = $('time').first().text().trim() || $('.post-date').first().text().trim();

    // Parse article paragraphs
    const paragraphs = [];
    $('.entry-content p, article p, main p').each((_, el) => {
      const pText = $(el).text().trim();
      if (pText && !pText.includes('gtag') && !pText.includes('window.dataLayer')) {
        paragraphs.push(pText);
      }
    });

    return {
      title,
      url,
      thumbnail,
      date: dateStr,
      content: paragraphs.join('\n\n'),
      paragraphs,
    };
  }

  return {
    getKhutbahList,
    getKhutbahDetail,
  };
}
