import defaultAxios from 'axios';
import defaultLogger from '../../utils/logger.js';

export function createTiktok2Service({ httpClient = defaultAxios, logger = defaultLogger } = {}) {
  return {
    async scrapeTikTokVideo(tiktokUrl) {
      try {
        if (!tiktokUrl || typeof tiktokUrl !== 'string') {
          return { success: false, error: 'URL TikTok tidak valid' };
        }

        logger.info(`Requesting video data from snaptik.fi for: ${tiktokUrl}`, 'SCRAPER');

        const { data } = await httpClient.post(
          'https://snaptik.fi/api/tiktok',
          { url: tiktokUrl.trim() },
          {
            headers: {
              'Content-Type': 'application/json',
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
              Referer: 'https://snaptik.fi/id/download-tiktok-video',
              Origin: 'https://snaptik.fi',
            },
            timeout: 30000,
          }
        );

        if (!data) {
          logger.error('snaptik.fi returned empty response', 'SCRAPER');
          return { success: false, error: 'Respon dari snaptik.fi kosong' };
        }

        if (data.error) {
          logger.error(`snaptik.fi returned error: ${data.error}`, 'SCRAPER');
          return { success: false, error: data.error };
        }

        const downloadLinks = data.download_link || {};
        const videoUrl =
          downloadLinks.no_watermark_hd ||
          downloadLinks.no_watermark ||
          downloadLinks.watermark ||
          null;

        if (!videoUrl && !downloadLinks.mp3) {
          logger.error('No downloadable media URL found in snaptik.fi response', 'SCRAPER');
          return { success: false, error: 'URL video/audio TikTok tidak dapat diunduh' };
        }

        logger.info('snaptik.fi scrape succeeded!', 'SCRAPER');
        return {
          success: true,
          source: 'snaptik.fi',
          url: tiktokUrl,
          title: data.title || 'No title',
          description: data.description || data.title || '',
          videoUrl,
          audioUrl: downloadLinks.mp3 || data.audio || null,
          hdUrl: downloadLinks.no_watermark_hd || null,
          watermarkUrl: downloadLinks.watermark_hd || downloadLinks.watermark || null,
          duration: data.duration || null,
          music_duration: data.music_duration || null,
          cover: data.cover || null,
          dynamic_cover: data.dynamic_cover || null,
          statistics: data.statistics || null,
          author: data.author || (data.artist ? { nickname: data.artist } : null),
          download_link: downloadLinks,
        };
      } catch (error) {
        const errorMsg = error.response?.data?.error || error.message;
        logger.error(`snaptik.fi scrape failed: ${errorMsg}`, 'SCRAPER');
        return {
          success: false,
          error: `Gagal scrape TikTok via snaptik.fi: ${errorMsg}`,
        };
      }
    },
  };
}

export const scrapeTikTokVideo = createTiktok2Service().scrapeTikTokVideo;
