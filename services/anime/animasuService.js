import { execFile } from 'child_process';
import { promisify } from 'util';
import * as cheerio from 'cheerio';
import defaultLogger from '../../utils/logger.js';

const execFileAsync = promisify(execFile);

export function createAnimasuService({ logger = defaultLogger } = {}) {
  const BASE_URL = process.env.ANIMASU_BASE_URL || 'https://animasu.love';

  async function fetchWithCurl(urlPath) {
    const fullUrl = urlPath.startsWith('http') ? urlPath : `${BASE_URL}${urlPath}`;
    const args = [
      '-s',
      '-L',
      fullUrl,
      '-H',
      'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      '-H',
      'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      '-H',
      'Accept-Language: en-US,en;q=0.5',
    ];

    const { stdout } = await execFileAsync('curl', args, { maxBuffer: 10 * 1024 * 1024 });
    return stdout;
  }

  function parseSlugFromUrl(url) {
    if (!url) return null;
    const parts = url.split('/').filter(Boolean);
    return parts[parts.length - 1] || null;
  }

  function extractStreamUrl(val) {
    if (!val) return '';
    if (val.startsWith('http')) return val;
    try {
      const decoded = Buffer.from(val, 'base64').toString('utf-8');
      const match = decoded.match(/src=["']([^"']+)["']/i);
      if (match && match[1]) return match[1];
    } catch (e) {}
    const match = val.match(/src=["']([^"']+)["']/i);
    if (match && match[1]) return match[1];
    return val;
  }

  function parseAnimeCard($, el) {
    const title = $(el).find('.ttme h2, .tt').text().trim();
    const href = $(el).find('a').attr('href') || '';
    const slug = parseSlugFromUrl(href);
    const thumb = $(el).find('img').attr('src') || $(el).find('img').attr('data-src') || '';
    const type = $(el).find('.typez').text().trim();
    const ep = $(el).find('.epx').text().trim();
    const status = $(el).find('.sb').text().trim();
    const rating = $(el).find('.numscore').text().trim();

    return {
      title,
      slug,
      url: href,
      thumb,
      type,
      episode: ep,
      status,
      rating,
    };
  }

  return {
    async getHome(page = 1) {
      const pageNum = parseInt(page, 10) || 1;
      const urlPath = pageNum === 1 ? '/' : `/page/${pageNum}/`;
      logger.info(`Fetching Animasu home page ${pageNum}`, 'ANIMASU');

      const html = await fetchWithCurl(urlPath);
      const $ = cheerio.load(html);

      const ongoing = [];
      const updated = [];

      $('.bixbox').each((_, section) => {
        const headerText = $(section).find('.releases h3 span, .releases h2 span, h3, h2').text();

        if (headerText.includes('Sedang Tayang')) {
          $(section)
            .find('.bs')
            .each((_, el) => {
              ongoing.push(parseAnimeCard($, el));
            });
        } else if (headerText.includes('Baru Ditambah') || headerText.includes('Diperbarui')) {
          $(section)
            .find('.bs')
            .each((_, el) => {
              updated.push(parseAnimeCard($, el));
            });
        }
      });

      return { ongoing, updated };
    },

    async search(query) {
      if (!query) throw new Error('Parameter "q" kata kunci pencarian anime wajib diisi');
      logger.info(`Searching Animasu: ${query}`, 'ANIMASU');

      const urlPath = `/?s=${encodeURIComponent(query)}`;
      const html = await fetchWithCurl(urlPath);
      const $ = cheerio.load(html);

      const results = [];
      $('.bs').each((_, el) => {
        results.push(parseAnimeCard($, el));
      });

      return results;
    },

    async getDetail(slug) {
      if (!slug) throw new Error('Parameter "slug" anime wajib diisi');
      let cleanSlug = slug.trim().replace(/^\/+|\/+$/g, '');
      if (cleanSlug.startsWith('http')) {
        cleanSlug = parseSlugFromUrl(cleanSlug);
      }
      cleanSlug = cleanSlug.replace(/^anime\//i, '');
      const urlPath = `/anime/${cleanSlug}/`;
      logger.info(`Fetching Animasu detail for ${cleanSlug}`, 'ANIMASU');

      const html = await fetchWithCurl(urlPath);
      const $ = cheerio.load(html);

      const info = $('.infox');
      const title = info.find('h1').text().trim();
      if (!title) {
        throw new Error(`Detail anime "${slug}" tidak ditemukan di Animasu`);
      }
      const alter = info.find('.alter').text().trim();
      const synopsis = $('.sinopc').text().trim();
      const thumb = $('.thumb img').attr('src') || '';
      const rating = $('.rating strong').text().replace('Rating', '').trim();

      const spe = {};
      $('.spe span').each((_, span) => {
        const text = $(span).text().trim();
        if (text.includes('Genre:')) {
          const genres = [];
          $(span)
            .find('a')
            .each((_, a) => genres.push($(a).text().trim()));
          spe.genres = genres;
        } else if (text.includes('Status:')) {
          spe.status = text.replace('Status:', '').trim();
        } else if (text.includes('Jenis:')) {
          spe.type = text.replace('Jenis:', '').trim();
        } else if (text.includes('Episode:')) {
          spe.total_episodes = text.replace('Episode:', '').trim();
        } else if (text.includes('Studio:')) {
          spe.studio = $(span).find('a').text().trim();
        }
      });

      const episodes = [];
      $('.bxcl ul li').each((_, li) => {
        const a = $(li).find('span.lchx a');
        if (a.length) {
          const href = a.attr('href') || '';
          episodes.push({
            title: a.text().trim(),
            slug: parseSlugFromUrl(href),
            url: href,
            date: $(li).find('.dt').text().trim(),
          });
        }
      });

      return {
        title,
        alternative_title: alter,
        synopsis,
        thumb,
        rating,
        ...spe,
        episodes,
      };
    },

    async getSchedule() {
      logger.info('Fetching Animasu schedule', 'ANIMASU');
      const html = await fetchWithCurl('/jadwal/');
      const $ = cheerio.load(html);

      const schedule = [];
      $('.bixbox')
        .slice(1)
        .each((_, box) => {
          const day = $(box).find('h3 span').text().trim();
          const anime_list = [];
          $(box)
            .find('.bs')
            .each((_, el) => {
              anime_list.push(parseAnimeCard($, el));
            });

          if (day && anime_list.length) {
            schedule.push({ day, anime_list });
          }
        });

      return schedule;
    },

    async getEpisode(slug) {
      if (!slug) throw new Error('Parameter "slug" episode anime wajib diisi');

      let cleanSlug = slug.trim().replace(/^\/+|\/+$/g, '');
      if (cleanSlug.startsWith('http')) {
        cleanSlug = parseSlugFromUrl(cleanSlug);
      }

      const withoutSubIndo = cleanSlug.replace(/-sub-indo$|-sub-indonesia$|-subtitle-indonesia$/gi, '');
      const variations = [
        cleanSlug,
        withoutSubIndo,
        withoutSubIndo.startsWith('nonton-') ? withoutSubIndo.replace(/^nonton-/i, '') : `nonton-${withoutSubIndo}`,
        cleanSlug.startsWith('nonton-') ? cleanSlug.replace(/^nonton-/i, '') : `nonton-${cleanSlug}`,
      ];
      const uniqueSlugs = [...new Set(variations.filter(Boolean))];

      logger.info(`Fetching Animasu episode with candidates: ${uniqueSlugs.join(', ')}`, 'ANIMASU');

      let $ = null;
      let title = '';
      let matchedSlug = cleanSlug;

      for (const s of uniqueSlugs) {
        try {
          const resHtml = await fetchWithCurl(`/${s}/`);
          const doc = cheerio.load(resHtml);
          const t = doc('h1.entry-title, h1').first().text().trim();
          if (t && !t.toLowerCase().includes('not found') && !t.toLowerCase().includes('tidak ditemukan')) {
            $ = doc;
            title = t;
            matchedSlug = s;
            break;
          }
        } catch (e) {
          // continue checking next candidate
        }
      }

      if (!$ || !title) {
        throw new Error(`Episode anime dengan slug "${slug}" tidak ditemukan di Animasu`);
      }

      let iframeSrc = $('#pembed iframe').attr('src') || '';

      const mirrors = [];
      $('.mirror option').each((_, opt) => {
        const val = $(opt).attr('value');
        const name = $(opt).text().trim();
        if (val && val !== '') {
          mirrors.push({
            name,
            url: extractStreamUrl(val),
            value: val,
          });
        }
      });

      if (!iframeSrc && mirrors.length > 0 && mirrors[0].url) {
        iframeSrc = mirrors[0].url;
      }

      let prev = null;
      let next = null;
      let allEp = null;

      $('.naveps a, .nextprev a').each((_, a) => {
        const text = $(a).text().trim().toLowerCase();
        const href = $(a).attr('href') || '';
        if (text.includes('sebelumnya') || $(a).attr('rel') === 'prev') {
          prev = href;
        } else if (text.includes('selanjutnya') || $(a).attr('rel') === 'next') {
          next = href;
        } else if (text.includes('informasi') || text.includes('semua') || text.includes('daftar') || $(a).hasClass('nvx')) {
          allEp = href;
        }
      });

      return {
        title,
        matched_slug: matchedSlug,
        stream_url: iframeSrc,
        mirrors,
        navigation: {
          prev_slug: parseSlugFromUrl(prev),
          next_slug: parseSlugFromUrl(next),
          anime_detail_slug: parseSlugFromUrl(allEp),
        },
      };
    },
  };
}

const defaultAnimasuService = createAnimasuService();
export const getHome = defaultAnimasuService.getHome;
export const search = defaultAnimasuService.search;
export const getDetail = defaultAnimasuService.getDetail;
export const getSchedule = defaultAnimasuService.getSchedule;
export const getEpisode = defaultAnimasuService.getEpisode;
