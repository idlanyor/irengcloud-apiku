import defaultAxios from 'axios';
import * as cheerio from 'cheerio';
import defaultLogger from '../../utils/logger.js';

export function createInstagramService({ httpClient = defaultAxios, logger = defaultLogger } = {}) {
  const DEFAULT_UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

  function extractShortcode(url) {
    const s = String(url);
    const m = s.match(/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
    return m ? m[1] : null;
  }

  // Engine 1: SnapSave Decoded Engine
  function decodeSnapSave(h, u, n, t, e) {
    function _0xe21c(d, e, f) {
      const charSet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/';
      const hArr = charSet.slice(0, e);
      const iArr = charSet.slice(0, f);
      let j = d.split('').reverse().reduce(function (a, b, c) {
        if (hArr.indexOf(b) !== -1) return (a += hArr.indexOf(b) * Math.pow(e, c));
      }, 0);
      let k = '';
      while (j > 0) {
        k = iArr[j % f] + k;
        j = (j - (j % f)) / f;
      }
      return k || '0';
    }

    let k = '';
    for (let i = 0; i < h.length; i++) {
      let s = '';
      while (h[i] !== n[e]) {
        s += h[i];
        i++;
      }
      for (let j = 0; j < n.length; j++) {
        s = s.replace(new RegExp(n[j], 'g'), j.toString());
      }
      k += String.fromCharCode(_0xe21c(s, e, 10) - t);
    }
    try {
      return decodeURIComponent(k);
    } catch (err) {
      return k;
    }
  }

  async function fetchSnapSave(url) {
    const res = await httpClient.post('https://snapsave.app/action.php', new URLSearchParams({ url }).toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': DEFAULT_UA,
        Origin: 'https://snapsave.app',
        Referer: 'https://snapsave.app/',
      },
      timeout: 10000,
    });

    const data = res.data;
    const argsMatch = data.match(/}\s*\(\s*"([^"]+)"\s*,\s*(\d+)\s*,\s*"([^"]+)"\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (!argsMatch) return null;

    const [_, h, u, n, t, e] = argsMatch;
    const unpacked = decodeSnapSave(h, parseInt(u), n, parseInt(t), parseInt(e));

    const htmlMatch = unpacked.match(/innerHTML\s*=\s*"([\s\S]*?)";/);
    const htmlContent = htmlMatch ? htmlMatch[1].replace(/\\"/g, '"') : unpacked;

    const $ = cheerio.load(htmlContent);
    const mediaList = [];

    $('.download-items').each((_, el) => {
      const thumb = $(el).find('img').attr('src');
      const downloadUrl = $(el).find('a').attr('href');
      const isVideo = $(el).find('.icon-dlvideo').length > 0;

      if (downloadUrl) {
        mediaList.push({
          type: isVideo ? 'video' : 'photo',
          thumbnail: thumb || null,
          url: downloadUrl,
        });
      }
    });

    return mediaList.length > 0 ? mediaList : null;
  }

  function parseMedia(item) {
    if (!item) return null;

    const nodes = item.edge_sidecar_to_children?.edges?.map((edge) => edge.node) || [item];
    const mediaList = nodes
      .map((node) => ({
        type: node.is_video ? 'video' : 'photo',
        thumbnail: node.display_url || null,
        url: node.is_video ? node.video_url : node.display_url,
      }))
      .filter((media) => media.url);

    return mediaList.length > 0 ? mediaList : null;
  }

  // Engine 2: Instagram embed page (no login required)
  async function fetchEmbed(shortcode) {
    const { data: html } = await httpClient.get(`https://www.instagram.com/p/${shortcode}/embed/captioned/`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000,
    });
    const match = html.match(/"contextJSON"\s*:\s*"((?:\\.|[^"\\])*)"/);
    if (!match) return null;

    const context = JSON.parse(JSON.parse(`"${match[1]}"`));
    return parseMedia(context?.gql_data?.shortcode_media);
  }

  // Engine 3: Fallback GraphQL Official Query
  async function fetchGraphQL(shortcode) {
    const variables = JSON.stringify({ shortcode });
    const body = new URLSearchParams({ doc_id: '8845758582119845', variables });

    const { data } = await httpClient.post('https://www.instagram.com/graphql/query', body.toString(), {
      headers: {
        'User-Agent': DEFAULT_UA,
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-FB-Friendly-Name': 'PolarisPostRootQuery',
        'X-IG-App-ID': '936619743392459',
        Origin: 'https://www.instagram.com',
        Referer: `https://www.instagram.com/p/${shortcode}/`,
      },
      timeout: 10000,
    });

    const item = data?.data?.xdt_shortcode_media;
    if (!item) return null;

    const mediaList = [];
    if (item.edge_sidecar_to_children?.edges?.length) {
      item.edge_sidecar_to_children.edges.forEach((edge) => {
        const node = edge.node;
        const isVideo = Boolean(node.is_video);
        mediaList.push({
          type: isVideo ? 'video' : 'photo',
          thumbnail: node.display_url || null,
          url: isVideo ? node.video_url : node.display_url,
        });
      });
    } else {
      const isVideo = Boolean(item.is_video);
      mediaList.push({
        type: isVideo ? 'video' : 'photo',
        thumbnail: item.display_url || null,
        url: isVideo ? item.video_url : item.display_url,
      });
    }

    return mediaList.length > 0 ? mediaList : null;
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

      // Strategy: Embed (direct IG) -> SnapSave -> GraphQL
      for (const [engine, fetcher] of [
        ['Embed', () => fetchEmbed(shortcode)],
        ['SnapSave', () => fetchSnapSave(url)],
        ['GraphQL', () => fetchGraphQL(shortcode)],
      ]) {
        try {
          const mediaList = await fetcher();
          if (mediaList?.length) {
            return {
              success: true,
              shortcode,
              count: mediaList.length,
              type: mediaList.length > 1 ? 'carousel' : mediaList[0].type,
              media: mediaList,
            };
          }
          logger.info(`${engine} returned no media for ${shortcode}`, 'INSTAGRAM');
        } catch (err) {
          logger.error(`${engine} failed for ${shortcode}: ${err.message}`, 'INSTAGRAM');
        }
      }

      return {
        success: false,
        error: 'Gagal mengambil media Instagram (post privat / tidak ditemukan).',
      };
    },
  };
}

const defaultInstagramService = createInstagramService();
export const scrapeIG = defaultInstagramService.scrapeIG;
