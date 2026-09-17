import { execFile } from 'child_process';
import { promisify } from 'util';
import * as cheerio from 'cheerio';
import defaultLogger from '../../utils/logger.js';

const execFileAsync = promisify(execFile);

export function createKomikuService({ logger = defaultLogger } = {}) {
  const BASE_URL = 'https://komiku.org';

  async function fetchWithCurl(urlPath) {
    const fullUrl = urlPath.startsWith('http') ? urlPath : `${BASE_URL}${urlPath}`;
    const args = [
      '-s',
      '-L',
      fullUrl,
      '-k',
      '-H',
      'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      '-H',
      'Referer: https://komiku.org/',
    ];

    const { stdout } = await execFileAsync('curl', args, { maxBuffer: 10 * 1024 * 1024 });
    return stdout;
  }

  function parseSlugFromUrl(url) {
    if (!url) return '';
    const parts = url.split('/').filter(Boolean);
    return parts[parts.length - 1] || '';
  }

  function createProxyUrl(originalUrl) {
    if (!originalUrl) return '';
    return `https://apiku.irengcloud.com/api/v1/komiku/proxy-image?url=${encodeURIComponent(originalUrl)}`;
  }

  return {
    async getHome() {
      logger.info('Fetching Komiku home page', 'KOMIKU');
      const html = await fetchWithCurl('/');
      const $ = cheerio.load(html);

      const ranking = [];
      $('#Rekomendasi_Komik .ls2, .ls2').each((_, el) => {
        const a = $(el).find('a').first();
        const href = a.attr('href') || '';
        const rawThumb = $(el).find('img').attr('src') || $(el).find('img').attr('data-src') || '';

        if (href) {
          ranking.push({
            title: $(el).find('h3, .ls2j').text().trim(),
            slug: parseSlugFromUrl(href),
            url: href,
            raw_thumb: rawThumb,
            thumb: createProxyUrl(rawThumb),
            chapter: $(el).find('.ls2l, .ls24').text().trim(),
          });
        }
      });

      const recent = [];
      $('.ls4w .ls4, .ls4').each((_, el) => {
        const linkEl = $(el).find('.ls4j h3 a, h3 a').first();
        const href = linkEl.attr('href') || '';
        const rawThumb =
          $(el).find('img.lazy').attr('data-src') || $(el).find('img').attr('src') || '';
        const typeGenre = $(el).find('.ls4s').text().trim();

        let type = typeGenre;
        let genre = '';
        if (typeGenre.includes('•')) {
          const parts = typeGenre.split('•');
          type = parts[0].trim();
          genre = parts[1].trim();
        }

        if (href) {
          recent.push({
            title: linkEl.text().trim(),
            slug: parseSlugFromUrl(href),
            url: href,
            raw_thumb: rawThumb,
            thumb: createProxyUrl(rawThumb),
            type,
            genre,
            chapter: $(el).find('.ls24').text().trim(),
          });
        }
      });

      return { ranking, recent };
    },

    async search(query) {
      if (!query) throw new Error('Parameter "q" kata kunci pencarian Komik wajib diisi');
      logger.info(`Searching Komiku: ${query}`, 'KOMIKU');

      const html = await fetchWithCurl(`/?s=${encodeURIComponent(query)}`);
      const $ = cheerio.load(html);

      const results = [];
      $('.bge').each((_, el) => {
        const a = $(el).find('.kan a').first();
        const href = a.attr('href') || '';
        const rawThumb =
          $(el).find('img.lazy').attr('data-src') || $(el).find('img').attr('src') || '';
        const title = $(el).find('.kan h3').text().trim();
        const synopsis = $(el).find('.kan p').text().trim();
        const chapter = $(el).find('.new a, .kan .judul2').first().text().trim();

        if (href) {
          results.push({
            title,
            slug: parseSlugFromUrl(href),
            url: href,
            raw_thumb: rawThumb,
            thumb: createProxyUrl(rawThumb),
            synopsis,
            latest_chapter: chapter,
          });
        }
      });

      return results;
    },

    async getDetail(slug) {
      if (!slug) throw new Error('Parameter "slug" komik wajib diisi');
      const cleanSlug = slug.replace(/^manga\//, '').replace(/\/$/, '');
      const urlPath = slug.startsWith('http') ? slug : `/manga/${cleanSlug}/`;
      logger.info(`Fetching Komiku detail for ${cleanSlug}`, 'KOMIKU');

      const html = await fetchWithCurl(urlPath);
      const $ = cheerio.load(html);

      const title = $('#Judul h1, h1').first().text().trim();
      const rawThumb = $('.ims img').attr('src') || '';
      const synopsis = $('.desc, #Judul p').first().text().trim();

      const info = {};
      $('.inftable tr').each((_, tr) => {
        const key = $(tr).find('td').eq(0).text().trim();
        const val = $(tr).find('td').eq(1).text().trim();

        if (key === 'Judul Indonesia') info.title_id = val;
        else if (key === 'Jenis Komik') info.type = val;
        else if (key === 'Pengarang') info.author = val;
        else if (key === 'Status') info.status = val;
        else if (key === 'Konsep Cerita') info.concept = val;
      });

      const genres = [];
      $('.genre li.genre a').each((_, a) => genres.push($(a).text().trim()));

      const chapters = [];
      $('#Daftar_Chapter tr').each((_, tr) => {
        const a = $(tr).find('a').first();
        const href = a.attr('href') || '';
        if (href && !href.includes('#')) {
          chapters.push({
            title: a.text().trim(),
            date: $(tr).find('.tanggalseries').text().trim(),
            slug: parseSlugFromUrl(href),
            url: href,
          });
        }
      });

      return {
        title,
        raw_thumb: rawThumb,
        thumb: createProxyUrl(rawThumb),
        synopsis,
        ...info,
        genres,
        chapters,
      };
    },

    async getChapter(slug) {
      if (!slug) throw new Error('Parameter "slug" chapter komik wajib diisi');
      const cleanSlug = slug.replace(/^ch\//, '').replace(/\/$/, '');
      const urlPath = slug.startsWith('http') ? slug : `/${cleanSlug}/`;
      logger.info(`Fetching Komiku chapter ${cleanSlug}`, 'KOMIKU');

      const html = await fetchWithCurl(urlPath);
      const $ = cheerio.load(html);

      const title = $('h1').first().text().trim();
      const images = [];

      $('#Baca_Komik img').each((_, img) => {
        const rawSrc = $(img).attr('src') || $(img).attr('data-src');
        if (rawSrc) {
          images.push({
            raw_url: rawSrc,
            proxy_url: createProxyUrl(rawSrc),
          });
        }
      });

      return {
        title,
        total_images: images.length,
        images,
      };
    },
  };
}

const defaultKomikuService = createKomikuService();
export const getHome = defaultKomikuService.getHome;
export const search = defaultKomikuService.search;
export const getDetail = defaultKomikuService.getDetail;
export const getChapter = defaultKomikuService.getChapter;
