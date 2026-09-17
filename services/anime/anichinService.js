import { execFile } from 'child_process';
import { promisify } from 'util';
import * as cheerio from 'cheerio';
import defaultLogger from '../../utils/logger.js';

const execFileAsync = promisify(execFile);

export function createAnichinService({ logger = defaultLogger } = {}) {
  const BASE_URL = 'https://anichin.cafe';

  async function fetchWithCurl(urlPath) {
    const fullUrl = urlPath.startsWith('http') ? urlPath : `${BASE_URL}${urlPath}`;
    const args = [
      '-s',
      '-L',
      fullUrl,
      '-k',
      '-H',
      'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ];

    const { stdout } = await execFileAsync('curl', args, { maxBuffer: 10 * 1024 * 1024 });
    return stdout;
  }

  function parseSlugFromUrl(url) {
    if (!url) return '';
    const parts = url.split('/').filter(Boolean);
    return parts[parts.length - 1] || '';
  }

  function parseAnimeCard($, el) {
    const title =
      $(el).find('.tt').text().trim() || $(el).find('a').attr('title') || $(el).find('.bsx a').text().trim();
    const href = $(el).find('a').attr('href') || '';
    const slug = parseSlugFromUrl(href);
    const thumb = $(el).find('img').attr('src') || $(el).find('img').attr('data-src') || '';
    const type = $(el).find('.typez').text().trim();
    const ep = $(el).find('.epx, .status').text().trim();

    return {
      title,
      slug,
      url: href,
      thumb,
      type,
      episode: ep,
    };
  }

  return {
    async getHome() {
      logger.info('Fetching AniChin home page', 'ANICHIN');
      const html = await fetchWithCurl('/');
      const $ = cheerio.load(html);

      const latestUpdates = [];
      $('.listupd .bs').each((_, el) => {
        const item = parseAnimeCard($, el);
        if (item.slug) latestUpdates.push(item);
      });

      const ongoingSeries = [];
      $('.ongoingseries ul li').each((_, li) => {
        const a = $(li).find('a');
        const href = a.attr('href') || '';
        ongoingSeries.push({
          title: $(li).find('span.l').text().trim(),
          episode: $(li).find('span.r').text().trim(),
          slug: parseSlugFromUrl(href),
          url: href,
        });
      });

      return {
        latest_updates: latestUpdates,
        ongoing_series: ongoingSeries,
      };
    },

    async search(query) {
      if (!query) throw new Error('Parameter "q" kata kunci pencarian Donghua wajib diisi');
      logger.info(`Searching AniChin: ${query}`, 'ANICHIN');

      const html = await fetchWithCurl(`/?s=${encodeURIComponent(query)}`);
      const $ = cheerio.load(html);

      const results = [];
      $('.bs').each((_, el) => {
        results.push(parseAnimeCard($, el));
      });

      return results;
    },

    async getDetail(slug) {
      if (!slug) throw new Error('Parameter "slug" Donghua wajib diisi');
      const urlPath = slug.startsWith('http')
        ? slug
        : slug.startsWith('/seri/')
        ? slug
        : `/seri/${slug}/`;
      logger.info(`Fetching AniChin Donghua detail for ${slug}`, 'ANICHIN');

      const html = await fetchWithCurl(urlPath);
      const $ = cheerio.load(html);

      const title = $('.infox h1.entry-title, h1').first().text().trim();
      const thumb = $('.thumb img').attr('src') || '';
      const synopsis = $('.desc, .entry-content').text().trim();

      const meta = {};
      $('.infox .spe span').each((_, span) => {
        const label = $(span).find('b').text().replace(':', '').trim().toLowerCase().replace(/\s+/g, '_');
        const text = $(span).text();
        const value = text.includes(':') ? text.split(':').slice(1).join(':').trim() : '';
        if (label) meta[label] = value;
      });

      const genres = [];
      $('.infox .genxed a').each((_, a) => genres.push($(a).text().trim()));

      const episodes = [];
      $('.eplister ul li a').each((_, a) => {
        const href = $(a).attr('href') || '';
        episodes.push({
          title: $(a).find('.epl-title').text().trim(),
          episode: $(a).find('.epl-num').text().trim(),
          date: $(a).find('.epl-date').text().trim(),
          slug: parseSlugFromUrl(href),
          url: href,
        });
      });

      return {
        title,
        thumb,
        synopsis,
        meta,
        genres,
        episodes,
      };
    },

    async getSchedule() {
      logger.info('Fetching AniChin Donghua schedule', 'ANICHIN');
      const html = await fetchWithCurl('/schedule/');
      const $ = cheerio.load(html);

      const schedule = [];
      $('.bixbox.schedulepage').each((_, box) => {
        const day = $(box).find('.releases h3 span').text().trim();
        const animeList = [];
        $(box)
          .find('.bs')
          .each((_, el) => {
            animeList.push(parseAnimeCard($, el));
          });

        if (day && animeList.length) {
          schedule.push({ day, anime_list: animeList });
        }
      });

      return schedule;
    },

    async getEpisode(slug) {
      if (!slug) throw new Error('Parameter "slug" episode Donghua wajib diisi');
      const urlPath = slug.startsWith('http') ? slug : `/${slug}/`;
      logger.info(`Fetching AniChin episode ${slug}`, 'ANICHIN');

      const html = await fetchWithCurl(urlPath);
      const $ = cheerio.load(html);

      const title = $('h1.entry-title').text().trim();
      const servers = [];

      $('select.mirror option').each((_, opt) => {
        const name = $(opt).text().trim();
        const val = $(opt).attr('value') || '';
        if (val) {
          try {
            const decodedHtml = Buffer.from(val, 'base64').toString('utf8');
            const iframeDoc = cheerio.load(decodedHtml);
            const src = iframeDoc('iframe').attr('src') || '';
            if (src) {
              servers.push({ name, src });
            }
          } catch (e) {
            // Ignore decoding failure
          }
        }
      });

      let hlsUrl = null;
      const mainServer = servers.find((s) => s.src.includes('anichin.stream'));
      if (mainServer) {
        const id = mainServer.src.split('?id=').pop();
        if (id) hlsUrl = `https://anichin.stream/hls/${id}.m3u8`;
      }

      return {
        title,
        servers,
        hls_url: hlsUrl,
      };
    },
  };
}

const defaultAnichinService = createAnichinService();
export const getHome = defaultAnichinService.getHome;
export const search = defaultAnichinService.search;
export const getDetail = defaultAnichinService.getDetail;
export const getSchedule = defaultAnichinService.getSchedule;
export const getEpisode = defaultAnichinService.getEpisode;
