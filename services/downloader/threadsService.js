import defaultAxios from 'axios';
import defaultLogger from '../../utils/logger.js';

export function createThreadsService({ httpClient = defaultAxios, logger = defaultLogger } = {}) {
  return {
    async scrapeThreads(url) {
      try {
        const res = await httpClient.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          }
        });
        
        const html = res.data;
        
        const videoMatch = html.match(/"video_versions":\[(.*?\])/);
        const imageMatch = html.match(/"image_versions2":\{"candidates":\[(.*?)\]\}/);
        
        let mediaUrl = null;
        let type = null;

        if (videoMatch) {
          try {
            const videoData = JSON.parse('[' + videoMatch[1] + ']');
            if (videoData.length > 0) {
              mediaUrl = videoData[0].url;
              type = 'video';
            }
          } catch (e) {
            const mp4 = videoMatch[1].match(/"url":"(.*?)"/);
            if (mp4) {
              mediaUrl = mp4[1].replace(/\\\//g, '/');
              type = 'video';
            }
          }
        } 
        
        if (!mediaUrl && imageMatch) {
          try {
            const imgData = JSON.parse('[' + imageMatch[1] + ']');
            if (imgData.length > 0) {
              mediaUrl = imgData[0].url;
              type = 'image';
            }
          } catch (e) {
            const jpg = imageMatch[1].match(/"url":"(.*?)"/);
            if (jpg) {
              mediaUrl = jpg[1].replace(/\\\//g, '/');
              type = 'image';
            }
          }
        }

        if (mediaUrl) {
          return {
            success: true,
            url: url,
            type: type,
            media_url: mediaUrl
          };
        } else {
          return {
            success: false,
            error: 'Media URL tidak ditemukan di dalam HTML. Kemungkinan post hanya berisi teks atau format berubah.'
          };
        }

      } catch (e) {
        logger.error(`Threads scrape error: ${e.message}`, 'THREADS');
        return {
          success: false,
          error: `Gagal scrape Threads: ${e.message}`
        };
      }
    }
  };
}

export const scrapeThreads = createThreadsService().scrapeThreads;
