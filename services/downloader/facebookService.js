import defaultAxios from 'axios';
import * as cheerio from 'cheerio';
import defaultLogger from '../../utils/logger.js';

export function createFacebookService({ httpClient = defaultAxios, logger = defaultLogger } = {}) {
  const BASE_URL = 'https://fbdownloader.to';
  const AJAX_URL = `${BASE_URL}/api/ajaxSearch`;
  const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  return {
    async scrapeFB(targetUrl) {
      try {
        logger.info(`Scraping FB video (Native First) for: ${targetUrl}`, 'FACEBOOK');

        // 1. Try Native Direct Facebook Scraping First
        const nativeResult = await fetchNativeFB(httpClient, targetUrl);
        if (nativeResult && nativeResult.success) {
          return nativeResult;
        }

        // 2. Fallback to fbdownloader.to API if Native Scraping is empty
        logger.info(`Native FB scraping empty, trying fbdownloader.to API fallback`, 'FACEBOOK');
        return await fetchFbDownloaderApi(httpClient, targetUrl, { BASE_URL, AJAX_URL, USER_AGENT });

      } catch (e) {
        logger.error(`FB scrape error: ${e.message}`, 'FACEBOOK');
        return {
          success: false,
          error: `Gagal mengambil data video Facebook: ${e.message}`,
        };
      }
    },
  };
}

/** Native Facebook HTML Scraping using Desktop User-Agent */
async function fetchNativeFB(httpClient, url) {
  try {
    const res = await httpClient.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
      },
    });

    const html = res.data;

    // Direct JSON Key Patterns inside Native FB HTML
    const hdMatch = html.match(/"browser_native_hd_url":"([^"]+)"/) || html.match(/"playable_url_quality_hd":"([^"]+)"/);
    const sdMatch = html.match(/"browser_native_sd_url":"([^"]+)"/) || html.match(/"playable_url":"([^"]+)"/);
    const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/);
    const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/);

    let hd = null;
    let sd = null;

    if (hdMatch) {
      try { hd = JSON.parse('"' + hdMatch[1] + '"'); } catch (e) { hd = hdMatch[1].replace(/\\/g, ''); }
    }
    if (sdMatch) {
      try { sd = JSON.parse('"' + sdMatch[1] + '"'); } catch (e) { sd = sdMatch[1].replace(/\\/g, ''); }
    }

    const title = ogTitle ? ogTitle[1].replace(/&amp;/g, '&') : 'Facebook Video';
    const thumbnail = ogImage ? ogImage[1].replace(/&amp;/g, '&') : null;
    const videoUrl = hd || sd;

    if (videoUrl) {
      return {
        success: true,
        source: 'native',
        title,
        thumbnail,
        video_url: videoUrl,
        sd: sd || videoUrl,
        hd: hd || null,
      };
    }

    return null;
  } catch (err) {
    return null;
  }
}

/** fbdownloader.to Backup API Extractor */
async function fetchFbDownloaderApi(httpClient, targetUrl, { BASE_URL, AJAX_URL, USER_AGENT }) {
  try {
    const headers = {
      'user-agent': USER_AGENT,
      'referer': `${BASE_URL}/en`,
      'origin': BASE_URL,
      'content-type': 'application/x-www-form-urlencoded',
      'x-requested-with': 'XMLHttpRequest',
    };

    const body = `q=${encodeURIComponent(targetUrl)}&vt=facebook`;
    const res = await httpClient.post(AJAX_URL, body, { headers });

    if (res.data && res.data.status === 'ok' && res.data.data) {
      const $ = cheerio.load(res.data.data);
      const title = $('.content h3').text().trim() || 'Facebook Video';
      const thumbnail = $('.thumbnail img').attr('src') || null;
      const duration = $('.content p').text().trim() || null;

      let hd = null;
      let sd = null;
      const media = [];

      $('tbody tr').each((_, el) => {
        const qualityText = $(el).find('.video-quality').text().trim().toLowerCase();
        const href = $(el).find('a.download-link-fb').attr('href');

        if (href) {
          if (qualityText.includes('720p') || qualityText.includes('hd')) {
            hd = href;
            media.push({ quality: 'HD', url: href });
          } else if (qualityText.includes('360p') || qualityText.includes('sd')) {
            sd = href;
            media.push({ quality: 'SD', url: href });
          } else {
            media.push({ quality: qualityText.toUpperCase(), url: href });
          }
        }
      });

      const primaryVideoUrl = hd || sd || (media[0] ? media[0].url : null);

      if (primaryVideoUrl) {
        return {
          success: true,
          source: 'fbdownloader_api',
          title,
          thumbnail,
          duration,
          video_url: primaryVideoUrl,
          sd,
          hd,
          media,
        };
      }
    }

    return {
      success: false,
      error: 'Tidak dapat menemukan link unduhan video Facebook. Pastikan link publik.',
    };
  } catch (err) {
    return {
      success: false,
      error: `Backup API failed: ${err.message}`,
    };
  }
}

export const scrapeFB = createFacebookService().scrapeFB;
