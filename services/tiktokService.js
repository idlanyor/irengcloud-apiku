import defaultAxios from 'axios';
import * as defaultCheerio from 'cheerio';
import defaultLogger from '../utils/logger.js';

export function createTiktokService({ httpClient = defaultAxios, cheerio = defaultCheerio, logger = defaultLogger } = {}) {
  const fetchTokdlToken = async () => {
    const { data } = await httpClient.get('https://tokdl.com/', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);
    const token = $('input#token[name="token"]').val();
    if (!token) throw new Error('Gagal mengekstrak token dari tokdl.com');
    return token;
  };

  const calculateHash = (url) => {
    const btoaUrl = Buffer.from(url).toString('base64');
    const salt = Buffer.from('aio-dl').toString('base64');
    return `${btoaUrl}${url.length + 1000}${salt}`;
  };

  return {
    async scrapeTikTokVideo(tiktokUrl) {
      try {
        logger.info(`Fetching tokdl.com token...`, 'SCRAPER');
        const token = await fetchTokdlToken();
        const hash = calculateHash(tiktokUrl);

        logger.info(`Requesting video data from tokdl.com for: ${tiktokUrl}`, 'SCRAPER');

        const params = new URLSearchParams();
        params.append('url', tiktokUrl);
        params.append('token', token);
        params.append('hash', hash);

        const { data } = await httpClient.post(
          'https://tokdl.com/wp-json/aio-dl/video-data/',
          params.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
              Referer: 'https://tokdl.com/',
              Origin: 'https://tokdl.com',
            },
            timeout: 30000,
          }
        );

        if (data.error) {
          logger.error(`tokdl.com returned error: ${data.error}`, 'SCRAPER');
          return { success: false, error: data.error };
        }

        if (!data.medias || data.medias.length === 0) {
          logger.error('tokdl.com returned no media data', 'SCRAPER');
          return { success: false, error: 'Media data TikTok tidak ditemukan' };
        }

        const hdMedia = data.medias.find(
          (m) => m.quality === 'hd' && m.extension === 'mp4' && m.videoAvailable
        );
        const watermarkMedia = data.medias.find(
          (m) => m.quality === 'watermark' && m.extension === 'mp4'
        );
        const audioMedia = data.medias.find(
          (m) => m.extension === 'mp3' && m.audioAvailable
        );

        const videoUrl = hdMedia?.url || watermarkMedia?.url || null;

        if (!videoUrl) {
          logger.error('No downloadable video URL found in tokdl.com response', 'SCRAPER');
          return { success: false, error: 'URL video TikTok tidak dapat diunduh' };
        }

        logger.info('tokdl.com scrape succeeded!', 'SCRAPER');
        return {
          success: true,
          url: tiktokUrl,
          videoUrl,
          audioUrl: audioMedia?.url || null,
          hdUrl: hdMedia?.url || null,
          watermarkUrl: watermarkMedia?.url || null,
          title: data.title || 'No title',
          description: data.title || 'No description',
          thumbnail: data.thumbnail || null,
          duration: data.duration || null,
        };
      } catch (error) {
        logger.error(`tokdl.com scrape failed: ${error.message}`, 'SCRAPER');
        return {
          success: false,
          error: `Gagal scrape TikTok: ${error.message}`
        };
      }
    },
  };
}

export const scrapeTikTokVideo = createTiktokService().scrapeTikTokVideo;
