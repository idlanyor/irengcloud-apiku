import crypto from 'node:crypto';
import defaultAxios from 'axios';
import defaultLogger from '../utils/logger.js';

export function createYoutubeService({ httpClient = defaultAxios, logger = defaultLogger } = {}) {
  const USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

  const AES_KEY_HEX = 'C5D58EF67A7584E4A29F6C35BBC4EB12';

  function extractVideoId(input) {
    const s = String(input);
    const m = s.match(/(?:v=|youtu\.be\/|\/embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
    return /^[A-Za-z0-9_-]{11}$/.test(s.trim()) ? s.trim() : null;
  }

  function decryptPayload(base64Payload) {
    const rawBase64 = String(base64Payload).replace(/\s/g, '');
    const buffer = Buffer.from(rawBase64, 'base64');
    if (buffer.length < 16) {
      throw new Error('Respons dekripsi tidak valid: panjang buffer kurang');
    }
    const iv = buffer.subarray(0, 16);
    const ciphertext = buffer.subarray(16);
    const keyBuf = Buffer.from(AES_KEY_HEX, 'hex');

    const decipher = crypto.createDecipheriv('aes-128-cbc', keyBuf, iv);
    let decrypted = decipher.update(ciphertext);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return JSON.parse(decrypted.toString('utf8'));
  }

  async function getCdnDomain() {
    try {
      const { data } = await httpClient.get('https://media.savetube.vip/api/random-cdn', {
        headers: { 'User-Agent': USER_AGENT },
        timeout: 10000,
      });
      return data?.cdn || data?.domain || 'cdn51.savetube.su';
    } catch {
      return 'cdn51.savetube.su';
    }
  }

  return {
    extractVideoId,
    async convertVideo(input, quality = '360') {
      const videoId = extractVideoId(input);
      if (!videoId) throw new Error('URL/id YouTube tidak valid');

      const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const cdnDomain = await getCdnDomain();

      logger.info(`yt-mp4 convert ${videoId} @ ${quality}p via ${cdnDomain}`, 'YTDL');

      const { data } = await httpClient.post(
        `https://${cdnDomain}/v2/info`,
        { url: targetUrl },
        {
          headers: {
            'User-Agent': USER_AGENT,
            Referer: 'https://yt-mp4.net/',
            Origin: 'https://yt-mp4.net',
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      if (!data?.status || !data?.data) {
        throw new Error(`Ekstraksi YouTube gagal: ${data?.message || 'respons API tidak valid'}`);
      }

      const decoded = decryptPayload(data.data);
      const reqQuality = parseInt(String(quality).replace(/p$/i, ''), 10) || 360;

      let selectedMedia = null;
      if (Array.isArray(decoded.video_formats) && decoded.video_formats.length > 0) {
        const available = decoded.video_formats.filter((f) => f.url);
        selectedMedia = available.find((f) => f.quality === reqQuality) || available[0];
      }

      if (!selectedMedia || !selectedMedia.url) {
        throw new Error('Stream video YouTube tidak ditemukan untuk kualitas yang diminta');
      }

      return {
        success: true,
        title: decoded.title || null,
        duration: decoded.durationLabel || decoded.duration || null,
        thumbnail: decoded.thumbnail || decoded.keyFrame || null,
        url: selectedMedia.url,
        filename: `${decoded.title || 'yt_' + videoId}_${selectedMedia.quality || quality}p.mp4`,
        quality: `${selectedMedia.quality || reqQuality}p`,
        videoId,
      };
    },
  };
}

const defaultYoutubeService = createYoutubeService();
export const extractVideoId = defaultYoutubeService.extractVideoId;
export const convertVideo = defaultYoutubeService.convertVideo;

