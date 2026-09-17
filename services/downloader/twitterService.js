import defaultAxios from 'axios';
import defaultLogger from '../../utils/logger.js';

export function createTwitterService({ httpClient = defaultAxios, logger = defaultLogger } = {}) {
  const USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

  const SYNDICATION_URL = (id) =>
    `https://cdn.syndication.twimg.com/tweet-result?id=${id}&token=a&lang=en`;

  function extractTweetId(url) {
    const m = String(url).match(/status(?:es)?\/(\d+)/);
    return m ? m[1] : null;
  }

  function resolutionArea(src) {
    const m = String(src).match(/(\d+)x(\d+)/);
    return m ? parseInt(m[1], 10) * parseInt(m[2], 10) : 0;
  }

  return {
    async scrapeTwitter(url) {
      const id = extractTweetId(url) || String(url).trim();
      if (!/^\d+$/.test(id)) {
        throw new Error('Tidak dapat mengekstrak tweet ID dari URL');
      }

      logger.info(`Scraping Twitter/X tweet id: ${id}`, 'TWITTER');

      const { data } = await httpClient.get(SYNDICATION_URL(id), {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
        timeout: 15000,
      });

      if (!data || data.__typename === 'TweetTombstone') {
        throw new Error('Tweet tidak ditemukan atau telah dihapus');
      }

      const medias = [];

      if (data.video && Array.isArray(data.video.variants)) {
        const mp4s = data.video.variants.filter(
          (v) => v && v.type === 'video/mp4' && v.src
        );
        mp4s
          .map((v) => {
            const m = String(v.src).match(/(\d+)x(\d+)/);
            return {
              url: v.src,
              quality: m ? `${m[1]}x${m[2]}` : 'unknown',
              type: 'video',
              extension: 'mp4',
              _area: resolutionArea(v.src),
            };
          })
          .sort((a, b) => b._area - a._area)
          .forEach((v) => {
            const { _area, ...cleanVideo } = v;
            medias.push(cleanVideo);
          });
      }

      if (Array.isArray(data.photos)) {
        data.photos.forEach((p) => {
          const img = p?.imageUrl || p?.url;
          if (img) medias.push({ url: img, quality: 'image', type: 'photo', extension: 'jpg' });
        });
      }

      if (medias.length === 0 && Array.isArray(data.mediaDetails)) {
        data.mediaDetails.forEach((md) => {
          if (md?.media_url_https) {
            medias.push({
              url: md.media_url_https,
              quality: 'image',
              type: 'photo',
              extension: 'jpg',
            });
          }
        });
      }

      if (medias.length === 0) {
        throw new Error('Media unduhan tidak ditemukan pada tweet tersebut');
      }

      return {
        success: true,
        title: data.text || 'Twitter Media',
        user: data.user?.screen_name || '',
        poster: data.video?.poster || null,
        medias,
      };
    },
  };
}

export const scrapeTwitter = createTwitterService().scrapeTwitter;
