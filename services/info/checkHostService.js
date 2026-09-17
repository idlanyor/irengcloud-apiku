import defaultAxios from 'axios';
import * as cheerio from 'cheerio';
import defaultLogger from '../../utils/logger.js';

export function createCheckHostService({ httpClient = defaultAxios, logger = defaultLogger } = {}) {
  const CHECKHOST_IP_URL = 'https://check-host.net/ip-info';
  const CHECKHOST_API_URL = 'https://api.check-host.cc';
  const WHOIS_URL = 'https://www.whois.com/whois';
  const DEFAULT_UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

  return {
    async getIpInfo(host) {
      if (!host) throw new Error('Parameter "host" atau IP address wajib diisi');
      logger.info(`Fetching IP info for ${host}`, 'CHECK_HOST');

      const url = `${CHECKHOST_IP_URL}?host=${encodeURIComponent(host)}`;
      const { data } = await httpClient.get(url, {
        headers: { 'User-Agent': DEFAULT_UA },
        timeout: 10000,
      });

      const $ = cheerio.load(data);
      const tables = $('table.ipinfo-table');
      const results = [];

      tables.each((_, table) => {
        const item = {};
        $(table)
          .find('tr')
          .each((_, tr) => {
            const tds = $(tr).find('td');
            if (tds.length === 2) {
              const label = $(tds[0])
                .text()
                .trim()
                .toLowerCase()
                .replace(/\s+\/\s+/g, '_')
                .replace(/\s+/g, '_');
              const value = $(tds[1]).text().trim();
              if (label) item[label] = value;
            }
          });
        if (Object.keys(item).length > 0) {
          results.push(item);
        }
      });

      if (results.length === 0) {
        throw new Error(`Tidak ada informasi IP ditemukan untuk host: ${host}`);
      }

      return {
        host,
        primary_info: results[0],
        all_databases: results,
      };
    },

    async pingCheck(host) {
      if (!host) throw new Error('Parameter "host" target ping wajib diisi');
      logger.info(`Dispatching ping check for ${host}`, 'CHECK_HOST');

      const dispatchUrl = `${CHECKHOST_API_URL}/ping`;
      const { data: dispatchRes } = await httpClient.post(
        dispatchUrl,
        { target: host },
        {
          headers: { 'User-Agent': DEFAULT_UA, 'Content-Type': 'application/json' },
          timeout: 10000,
        }
      );

      const uuid = dispatchRes?.uuid;
      if (!uuid) {
        throw new Error(dispatchRes?.message || 'Gagal memulai pemeriksaan ping');
      }

      // Poll results max 5 times (total ~10s)
      const reportUrl = `${CHECKHOST_API_URL}/report/${uuid}`;
      for (let attempt = 1; attempt <= 5; attempt++) {
        await new Promise((r) => setTimeout(r, 2000));
        try {
          const { data: reportRes } = await httpClient.get(reportUrl, {
            headers: { 'User-Agent': DEFAULT_UA },
            timeout: 5000,
          });

          if (reportRes?.data && Object.keys(reportRes.data).length > 0) {
            return reportRes;
          }
        } catch (e) {
          // Keep polling
        }
      }

      throw new Error('Waktu habis menunggu hasil ping check dari server global');
    },

    async whoisLookup(query) {
      if (!query) throw new Error('Parameter "domain" atau IP untuk WHOIS lookup wajib diisi');
      logger.info(`Performing WHOIS lookup for ${query}`, 'WHOIS');

      const url = `${WHOIS_URL}/${encodeURIComponent(query)}`;
      const { data } = await httpClient.get(url, {
        headers: {
          'User-Agent': DEFAULT_UA,
          Referer: 'https://www.whois.com/',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(data);

      if ($('pre#registryData').length) {
        const rawText = $('pre#registryData').text().trim();
        return {
          status: true,
          type: 'ip',
          query,
          raw: rawText,
        };
      }

      if ($('.df-block .df-row').length) {
        const structuredData = {};
        $('.df-block').each((_, block) => {
          const heading = $(block).find('.df-heading').text().trim();
          const rows = {};
          $(block)
            .find('.df-row')
            .each((_, row) => {
              const label = $(row).find('.df-label').text().replace(':', '').trim();
              const value = $(row).find('.df-value').text().trim();
              if (label) rows[label] = value;
            });
          if (heading) structuredData[heading] = rows;
        });

        return {
          status: true,
          type: 'domain',
          query,
          records: structuredData,
        };
      }

      throw new Error(`WHOIS record tidak ditemukan atau format tidak dikenali untuk: ${query}`);
    },
  };
}

const defaultCheckHostService = createCheckHostService();
export const getIpInfo = defaultCheckHostService.getIpInfo;
export const pingCheck = defaultCheckHostService.pingCheck;
export const whoisLookup = defaultCheckHostService.whoisLookup;
