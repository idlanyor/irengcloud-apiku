import defaultAxios from 'axios';
import defaultLogger from '../../utils/logger.js';

export function createYoutube2Service({ httpClient = defaultAxios, logger = defaultLogger } = {}) {
  const USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

  function extractVideoId(input) {
    const s = String(input);
    const m = s.match(/(?:v=|youtu\.be\/|\/embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
    return /^[A-Za-z0-9_-]{11}$/.test(s.trim()) ? s.trim() : null;
  }

  async function pollProgress(progressUrl, maxAttempts = 15) {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 1500));
      const { data } = await httpClient.get(progressUrl, {
        headers: { 'User-Agent': USER_AGENT },
        timeout: 10000,
      });

      if (data?.success === 1 && data?.download_url) {
        return data.download_url;
      }

      if (data?.success === 0 && data?.text?.toLowerCase().includes('error')) {
        throw new Error(`Loader.to konversi error: ${data.text}`);
      }
    }
    throw new Error('Timeout menunggu konversi video YouTube');
  }

  return {
    extractVideoId,
    async convertVideo(input, quality = '720') {
      const videoId = extractVideoId(input);
      if (!videoId) throw new Error('URL/id YouTube tidak valid');

      const targetQuality = String(quality).replace(/p$/i, '') || '720';
      logger.info(`Loader.to convert ${videoId} @ ${targetQuality}p`, 'YTDL2');

      const initUrl = `https://loader.to/ajax/download.php?format=${targetQuality}&url=${encodeURIComponent(
        `https://www.youtube.com/watch?v=${videoId}`
      )}`;

      const { data } = await httpClient.get(initUrl, {
        headers: { 'User-Agent': USER_AGENT },
        timeout: 15000,
      });

      if (!data?.success || !data?.progress_url) {
        throw new Error(`Gagal menginisialisasi konversi: ${data?.message || 'respons tidak valid'}`);
      }

      const downloadUrl = await pollProgress(data.progress_url);

      return {
        success: true,
        title: data.info?.title || data.title || null,
        thumbnail: data.thumbnail_url || data.info?.image || null,
        url: downloadUrl,
        filename: `${data.title || 'yt_' + videoId}_${targetQuality}p.mp4`,
        quality: `${targetQuality}p`,
        videoId,
      };
    },
  };
}

const defaultYoutube2Service = createYoutube2Service();
export const extractVideoId = defaultYoutube2Service.extractVideoId;
export const convertVideo = defaultYoutube2Service.convertVideo;
