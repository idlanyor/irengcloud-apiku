import defaultAxios from 'axios';
import defaultLogger from '../utils/logger.js';

export function createFacebookService({ httpClient = defaultAxios, logger = defaultLogger } = {}) {
  return {
    async scrapeFB(url) {
      try {
        const res = await httpClient.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1'
          }
        });
        
        const html = res.data;
        
        const browserNativeHd = html.match(/"browser_native_hd_url":"([^"]+)"/);
        const browserNativeSd = html.match(/"browser_native_sd_url":"([^"]+)"/);
        
        let videoUrl = null;
        
        if (browserNativeHd) {
          try { videoUrl = JSON.parse('"' + browserNativeHd[1] + '"'); } catch (e) { videoUrl = browserNativeHd[1].replace(/\\/g, ''); }
        } else if (browserNativeSd) {
          try { videoUrl = JSON.parse('"' + browserNativeSd[1] + '"'); } catch (e) { videoUrl = browserNativeSd[1].replace(/\\/g, ''); }
        }

        if (videoUrl) {
          return {
            success: true,
            url: url,
            video_url: videoUrl
          };
        } else {
          return {
            success: false,
            error: 'Tidak ditemukan video URL di halaman tersebut. Mungkin video bersifat private atau struktur FB berubah.'
          };
        }

      } catch (e) {
        logger.error(`FB scrape error: ${e.message}`, 'FACEBOOK');
        return {
          success: false,
          error: `Gagal mengambil data dari FB: ${e.message}`
        };
      }
    }
  };
}

export const scrapeFB = createFacebookService().scrapeFB;
