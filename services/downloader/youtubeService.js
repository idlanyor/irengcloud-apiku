import defaultAxios from 'axios';
import defaultLogger from '../../utils/logger.js';

export function createYoutubeService({ httpClient = defaultAxios, logger = defaultLogger } = {}) {
  const USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

  const BACKEND_HOST = String.fromCharCode(46, 121, 109, 99, 100, 110, 46, 111, 114, 103); // .ymcdn.org

  function extractVideoId(input) {
    const s = String(input);
    const m = s.match(/(?:v=|youtu\.be\/|\/embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
    return /^[A-Za-z0-9_-]{11}$/.test(s.trim()) ? s.trim() : null;
  }

  async function pollProgress(progressUrl, maxAttempts = 20) {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const { data } = await httpClient.get(progressUrl, {
        headers: {
          'User-Agent': USER_AGENT,
          Referer: 'https://id.ytmp3.mobi/',
          Origin: 'https://id.ytmp3.mobi',
        },
        timeout: 10000,
      });

      if (data?.error && data.error > 0) {
        throw new Error(`YTMP3 konversi error kode: ${data.error}`);
      }

      if (data?.progress === 3) {
        return data;
      }
    }
    throw new Error('Timeout menunggu konversi video YouTube (Server 1)');
  }

  return {
    extractVideoId,
    async convertVideo(input, qualityOrFormat = 'mp4') {
      const videoId = extractVideoId(input);
      if (!videoId) throw new Error('URL/id YouTube tidak valid');

      const isMp3 = String(qualityOrFormat).toLowerCase().includes('mp3') || String(qualityOrFormat).toLowerCase() === 'audio';
      const targetFormat = isMp3 ? 'mp3' : 'mp4';

      logger.info(`YTMP3 convert ${videoId} format: ${targetFormat}`, 'YTDL');

      // 1. Inisialisasi token konverter
      const initUrl = `https://a${BACKEND_HOST}/api/v1/init?p=y&23=1llum1n471&_=${Math.random()}`;
      const { data: initData } = await httpClient.get(initUrl, {
        headers: {
          'User-Agent': USER_AGENT,
          Referer: 'https://id.ytmp3.mobi/',
          Origin: 'https://id.ytmp3.mobi',
        },
        timeout: 15000,
      });

      if (!initData?.convertURL) {
        throw new Error(`Gagal inisialisasi YTMP3: ${initData?.error || 'respons tidak valid'}`);
      }

      // 2. Request konversi video mp4 / audio mp3
      const convUrl = `${initData.convertURL}&v=${videoId}&f=${targetFormat}&_=${Math.random()}`;
      const { data: convData } = await httpClient.get(convUrl, {
        headers: {
          'User-Agent': USER_AGENT,
          Referer: 'https://id.ytmp3.mobi/',
          Origin: 'https://id.ytmp3.mobi',
        },
        timeout: 15000,
      });

      if (convData?.error && convData.error > 0) {
        throw new Error(`YTMP3 gagal memulai konversi (error: ${convData.error})`);
      }

      const progressUrl = convData.progressURL;
      const downloadUrl = convData.downloadURL;

      if (!progressUrl || !downloadUrl) {
        throw new Error('YTMP3 tidak mengembalikan URL progress atau unduhan');
      }

      // 3. Polling sampai siap diunduh
      const progressResult = await pollProgress(progressUrl);

      const title = progressResult?.title || convData?.title || 'YouTube Media';
      const cleanTitle = title.replace(/[^\w\s.-]/gi, '').trim() || 'yt_' + videoId;
      const ext = isMp3 ? 'mp3' : 'mp4';

      return {
        success: true,
        title,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        url: downloadUrl,
        filename: `${cleanTitle}_${ext}.${ext}`,
        format: targetFormat,
        quality: isMp3 ? '128kbps' : (qualityOrFormat && !isMp3 ? (qualityOrFormat.includes('p') ? qualityOrFormat : `${qualityOrFormat}p`) : '360p'),
        videoId,
      };
    },
  };
}

const defaultYoutubeService = createYoutubeService();
export const extractVideoId = defaultYoutubeService.extractVideoId;
export const convertVideo = defaultYoutubeService.convertVideo;
