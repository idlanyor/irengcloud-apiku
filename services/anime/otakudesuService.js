import { execFile } from 'child_process';
import { promisify } from 'util';
import * as cheerio from 'cheerio';

const execFileAsync = promisify(execFile);

export class OtakudesuService {
  constructor() {
    this.baseUrl = 'https://otakudesu.blog';
    this.ajaxUrl = `${this.baseUrl}/wp-admin/admin-ajax.php`;
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }

  async fetchHtml(url) {
    const args = [
      '-s',
      '-L',
      url,
      '-H', `User-Agent: ${this.userAgent}`,
      '-H', `Referer: ${this.baseUrl}/`,
      '-H', `Origin: ${this.baseUrl}`,
      '-H', 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      '-H', 'Accept-Language: id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    ];
    const { stdout } = await execFileAsync('curl', args, { maxBuffer: 10 * 1024 * 1024 });
    return stdout;
  }

  async fetchPostForm(url, formData) {
    const formParams = [];
    for (const [key, val] of Object.entries(formData)) {
      formParams.push('-F', `${key}=${val}`);
    }

    const args = [
      '-s',
      '-L',
      url,
      '-H', `User-Agent: ${this.userAgent}`,
      '-H', `Referer: ${this.baseUrl}/`,
      '-H', `Origin: ${this.baseUrl}`,
      ...formParams
    ];
    const { stdout } = await execFileAsync('curl', args, { maxBuffer: 10 * 1024 * 1024 });
    return stdout;
  }

  extractSlug(url) {
    if (!url) return '';
    const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    const parts = cleanUrl.split('/');
    return parts[parts.length - 1] || '';
  }

  parseAnimeLi($, li) {
    const titleEl = $(li).find('h2 a, .jdlflm');
    const aEl = $(li).find('a').first();
    const url = aEl.attr('href') || titleEl.attr('href') || '';
    if (!url) return null;

    const title = titleEl.text().trim() || aEl.text().trim();
    const thumb = $(li).find('img').attr('src') || '';
    const episode = $(li).find('.epz').text().trim();
    const day = $(li).find('.epzti').text().trim();
    const date = $(li).find('.newepz').text().trim();

    return {
      title,
      thumb,
      episode,
      day,
      date,
      slug: this.extractSlug(url),
    };
  }

  async getHome() {
    const html = await this.fetchHtml(this.baseUrl);
    const $ = cheerio.load(html);
    const venzUl = $('.venz ul');

    const ongoing = [];
    venzUl.eq(0).find('li').each((_, el) => {
      const item = this.parseAnimeLi($, el);
      if (item) ongoing.push(item);
    });

    const complete = [];
    venzUl.eq(1).find('li').each((_, el) => {
      const item = this.parseAnimeLi($, el);
      if (item) complete.push(item);
    });

    return { ongoing, complete };
  }

  async getSchedule() {
    const html = await this.fetchHtml(`${this.baseUrl}/jadwal-rilis/`);
    const $ = cheerio.load(html);

    const schedule = [];
    $('.kglist321').each((_, el) => {
      const day = $(el).find('h2').text().trim();
      const animeList = [];
      $(el).find('ul li a').each((_, a) => {
        const url = $(a).attr('href');
        animeList.push({
          title: $(a).text().trim(),
          slug: this.extractSlug(url),
        });
      });

      if (day && animeList.length > 0) {
        schedule.push({ day, animeList });
      }
    });

    return schedule;
  }

  async search(query) {
    const encoded = encodeURIComponent(query);
    const html = await this.fetchHtml(`${this.baseUrl}/?s=${encoded}&post_type=anime`);
    const $ = cheerio.load(html);

    const results = [];
    $('.chivsrc li').each((_, li) => {
      const titleEl = $(li).find('h2 a');
      if (!titleEl.length) return;

      const url = titleEl.attr('href') || '';
      const sets = $(li).find('.set');
      const genres = [];
      sets.eq(0).find('a').each((_, a) => genres.push($(a).text().trim()));

      results.push({
        title: titleEl.text().trim(),
        thumb: $(li).find('img').attr('src') || '',
        genres,
        status: sets.eq(1).text().replace('Status :', '').trim(),
        rating: sets.eq(2).text().replace('Rating :', '').trim(),
        slug: this.extractSlug(url),
      });
    });

    return results;
  }

  async getDetail(slug) {
    const html = await this.fetchHtml(`${this.baseUrl}/anime/${slug}/`);
    const $ = cheerio.load(html);

    const info = {};
    $('.infozin .infozingle p').each((_, p) => {
      const text = $(p).text().trim();
      if (text.includes('Judul')) info.title = text.replace('Judul:', '').trim();
      else if (text.includes('Japanese')) info.japanese = text.replace('Japanese:', '').trim();
      else if (text.includes('Skor')) info.score = text.replace('Skor:', '').trim();
      else if (text.includes('Produser')) info.producer = text.replace('Produser:', '').trim();
      else if (text.includes('Tipe')) info.type = text.replace('Tipe:', '').trim();
      else if (text.includes('Status')) info.status = text.replace('Status:', '').trim();
      else if (text.includes('Total Episode')) info.episodesCount = text.replace('Total Episode:', '').trim();
      else if (text.includes('Durasi')) info.duration = text.replace('Durasi:', '').trim();
      else if (text.includes('Tanggal Rilis')) info.releaseDate = text.replace('Tanggal Rilis:', '').trim();
      else if (text.includes('Studio')) info.studio = text.replace('Studio:', '').trim();
      else if (text.includes('Genre')) {
        const genres = [];
        $(p).find('a').each((_, a) => genres.push($(a).text().trim()));
        info.genres = genres;
      }
    });

    info.thumb = $('.fotoanime img').attr('src') || '';
    info.synopsis = $('.sinopz').text().trim();

    const episodes = [];
    $('.episodelist ul li').each((_, li) => {
      const a = $(li).find('a').first();
      const url = a.attr('href') || '';
      episodes.push({
        title: a.text().trim(),
        slug: this.extractSlug(url),
        date: $(li).find('.zeebr').text().trim(),
      });
    });

    return { ...info, episodes };
  }

  async getEpisode(slug) {
    const html = await this.fetchHtml(`${this.baseUrl}/episode/${slug}/`);
    const $ = cheerio.load(html);

    const title = $('.venutama .posttl').text().trim();
    const defaultStream = $('#myIframe').attr('src') || $('iframe').attr('src') || '';

    const mirrors = [];
    $('.mirrorstream ul li a').each((_, a) => {
      const name = $(a).text().trim();
      const content = $(a).attr('data-content');
      if (name && content) {
        try {
          const decodedJson = Buffer.from(content, 'base64').toString('utf8');
          const payload = JSON.parse(decodedJson);
          mirrors.push({ name, payload });
        } catch {
          // ignore invalid payload
        }
      }
    });

    return { title, defaultStream, mirrors };
  }

  async getStream(payload) {
    // 1. Fetch Nonce
    const nonceBody = await this.fetchPostForm(this.ajaxUrl, { action: 'aa1208d27f29ca340c92c66d1926f13f' });
    let nonceData;
    try {
      nonceData = JSON.parse(nonceBody);
    } catch {
      throw new Error('Gagal mengambil nonce dari Otakudesu');
    }

    const nonce = nonceData?.data;
    if (!nonce) throw new Error('Nonce Otakudesu tidak ditemukan');

    // 2. Fetch stream iframe html with nonce
    const streamPayload = {
      ...payload,
      nonce,
      action: '2a3505c93b0035d3f455df82bf976b84',
    };

    const streamBody = await this.fetchPostForm(this.ajaxUrl, streamPayload);
    let streamData;
    try {
      streamData = JSON.parse(streamBody);
    } catch {
      throw new Error('Gagal mengambil stream player Otakudesu');
    }

    const encodedHtml = streamData?.data || '';
    const decodedHtml = Buffer.from(encodedHtml, 'base64').toString('utf8');
    const $ = cheerio.load(decodedHtml);
    const iframeSrc = $('iframe').attr('src') || '';

    return { iframe: iframeSrc, html: decodedHtml };
  }
}
