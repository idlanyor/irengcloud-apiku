import defaultAxios from 'axios';
import defaultLogger from '../utils/logger.js';

export function createInstagramService({ httpClient = defaultAxios, logger = defaultLogger } = {}) {
  const DEFAULT_UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

  function extractShortcode(url) {
    const s = String(url);
    const m = s.match(/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
    return m ? m[1] : null;
  }

  async function fetchWithGQL(shortcode) {
    const variables = JSON.stringify({
      shortcode,
      fetch_tagged: false,
      fetch_comment_count: 0,
      fetch_related_profile_media_count: 0,
      first: 1,
    });

    const body = new URLSearchParams({
      doc_id: '8845758582119845',
      variables,
    });

    const { data } = await httpClient.post('https://www.instagram.com/graphql/query', body.toString(), {
      headers: {
        'User-Agent': DEFAULT_UA,
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-FB-Friendly-Name': 'PolarisPostRootQuery',
        'X-IG-App-ID': '936619743392459',
        Origin: 'https://www.instagram.com',
        Referer: `https://www.instagram.com/p/${shortcode}/`,
      },
      timeout: 15000,
    });

    return data?.data?.xdt_shortcode_media || null;
  }

  function parseMedia(item) {
    if (!item) return null;

    const isVideo = Boolean(item.is_video);
    const result = {
      type: isVideo ? 'video' : 'photo',
      url: isVideo ? item.video_url : item.display_url,
      dimensions: item.dimensions || null,
    };

    if (item.edge_sidecar_to_children?.edges?.length) {
      result.type = 'carousel';
      result.media = item.edge_sidecar_to_children.edges.map((edge) => {
        const node = edge.node;
        const nodeIsVideo = Boolean(node.is_video);
        return {
          type: nodeIsVideo ? 'video' : 'photo',
          url: nodeIsVideo ? node.video_url : node.display_url,
        };
      });
    }

    return result;
  }

  return {
    async scrapeIG(url) {
      const shortcode = extractShortcode(url);
      if (!shortcode) {
        return {
          success: false,
          error: 'URL Instagram tidak valid (shortcode p/reel tidak ditemukan).',
        };
      }

      logger.info(`Scraping IG shortcode: ${shortcode}`, 'INSTAGRAM');

      try {
        const mediaData = await fetchWithGQL(shortcode);

        if (!mediaData) {
          return {
            success: false,
            error: 'Gagal mengambil data dari Instagram (media privat / tidak ditemukan).',
          };
        }

        const parsed = parseMedia(mediaData);

        return {
          success: true,
          shortcode,
          owner: {
            username: mediaData.owner?.username,
            full_name: mediaData.owner?.full_name,
            profile_pic_url: mediaData.owner?.profile_pic_url,
          },
          caption: mediaData.edge_media_to_caption?.edges[0]?.node?.text || '',
          ...parsed,
        };
      } catch (err) {
        logger.error(`Error IG scraping ${shortcode}: ${err.message}`, 'INSTAGRAM');
        return {
          success: false,
          error: `Gagal scrape Instagram: ${err.message}`,
        };
      }
    },
  };
}

export const scrapeIG = createInstagramService().scrapeIG;
