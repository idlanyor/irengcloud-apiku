import defaultLogger from '../../utils/logger.js';

export function createTvService({ httpClient, cheerio, logger = defaultLogger } = {}) {
  const BASE_URL = 'https://www.jadwaltv.net';
  const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  async function fetchHtml(urlPath) {
    const fullUrl = urlPath.startsWith('http') ? urlPath : `${BASE_URL}${urlPath}`;
    const res = await httpClient.get(fullUrl, {
      headers: { 'User-Agent': USER_AGENT },
    });
    return res.data;
  }

  return {
    async listChannels() {
      logger.info('Fetching TV channels list', 'TV');
      const html = await fetchHtml('/');
      const $ = cheerio.load(html);

      const channels = [];
      $('#menu-jadwaltv li a').each((_, a) => {
        const href = $(a).attr('href') || '';
        const name = $(a).text().trim();

        if (href && href.includes('/channel/')) {
          const parts = href.split('/channel/');
          const id = (parts[parts.length - 1] || '').replace(/\/$/, '').trim();

          if (id && !['acara-tv-nasional-saat-ini', 'acara'].includes(id)) {
            channels.push({ id, name });
          }
        }
      });

      // Deduplicate by ID
      const uniqueMap = new Map();
      for (const ch of channels) {
        if (!uniqueMap.has(ch.id)) uniqueMap.set(ch.id, ch);
      }

      return Array.from(uniqueMap.values());
    },

    async getSchedule(channelId) {
      if (!channelId) throw new Error('Parameter "channel" ID wajib diisi');
      logger.info(`Fetching TV schedule for channel: ${channelId}`, 'TV');

      try {
        const html = await fetchHtml(`/channel/${channelId}`);
        const $ = cheerio.load(html);

        const schedule = [];
        $('table.table-bordered tr').each((_, tr) => {
          const tds = $(tr).find('td');
          if (tds.length === 2) {
            const time = $(tds[0]).text().trim();
            const event = $(tds[1]).text().trim();

            if (time && time !== 'Jam' && !event.includes('JadwalTV.Net')) {
              schedule.push({ time, event });
            }
          }
        });

        if (schedule.length === 0) {
          throw new Error(`Jadwal tidak ditemukan untuk channel: ${channelId}`);
        }

        return schedule;
      } catch (err) {
        if (err.response && err.response.status === 404) {
          throw new Error(`Channel TV "${channelId}" tidak ditemukan`);
        }
        throw err;
      }
    },

    async getNowPlaying() {
      logger.info('Fetching TV now playing schedule', 'TV');
      const html = await fetchHtml('/channel/acara-tv-nasional-saat-ini');
      const $ = cheerio.load(html);

      const nowPlaying = [];
      let currentChannel = null;

      $('table.table-bordered tr').each((_, tr) => {
        const tds = $(tr).find('td');
        if (tds.length === 1 && $(tds[0]).attr('colspan') === '2') {
          currentChannel = $(tds[0]).text().trim();
        } else if (tds.length === 2 && currentChannel) {
          const time = $(tds[0]).text().trim();
          const event = $(tds[1]).text().trim();

          if (time && time !== 'Jam') {
            nowPlaying.push({ time, channel: currentChannel, event });
          }
        }
      });

      return nowPlaying;
    },

    async getFootballSchedule() {
      logger.info('Fetching football schedule from JadwalTV', 'TV');
      const html = await fetchHtml('/jadwal-sepakbola');
      const $ = cheerio.load(html);

      const matches = [];
      $('table.table.table-bordered tr').each((_, tr) => {
        const tds = $(tr).find('td');
        if (tds.length === 4) {
          const date = $(tds[0]).text().trim();
          const time = $(tds[1]).text().trim();
          const match = $(tds[2]).text().trim();
          const competition = $(tds[3]).text().trim();

          if (date && date !== 'Tanggal' && time !== 'Jam') {
            matches.push({ date, time, match, competition });
          }
        }
      });

      return matches;
    },
  };
}
