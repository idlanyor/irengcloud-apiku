import defaultAxios from 'axios';
import * as defaultCheerio from 'cheerio';
import defaultLogger from '../../utils/logger.js';

export function createMediafireService({ httpClient = defaultAxios, cheerio = defaultCheerio, logger = defaultLogger } = {}) {
  const USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  return {
    async scrapeMediafire(url) {
      logger.info(`Scraping Mediafire: ${url}`, 'MEDIAFIRE');

      const { data } = await httpClient.get(url, {
        headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'en-US,en;q=0.9' },
        timeout: 15000,
      });

      const $ = cheerio.load(data);
      const $btn = $('a[aria-label="Download file"]').first();
      const dl =
        $btn.attr('href') ||
        $('#downloadButton').attr('href') ||
        $('#download_link a').attr('href') ||
        '';

      if (!dl) {
        throw new Error('Download link tidak ditemukan (file mungkin privat atau telah dihapus)');
      }

      const title = $('meta[property="og:title"]').attr('content') || '';
      const btnText = $btn.text() || '';
      const sizeMatch = btnText.match(/\(([\d.,]+\s?[KMG]?B)\)/i);
      const size = sizeMatch ? sizeMatch[1].replace(/\s/g, '') : '';

      return {
        success: true,
        title,
        url: dl,
        size,
      };
    },
  };
}

export const scrapeMediafire = createMediafireService().scrapeMediafire;
