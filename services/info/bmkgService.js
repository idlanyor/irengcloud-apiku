import defaultAxios from 'axios';
import defaultLogger from '../../utils/logger.js';

export function createBmkgService({ httpClient = defaultAxios, logger = defaultLogger } = {}) {
  const DATA_URL = 'https://data.bmkg.go.id/DataMKG/TEWS';
  const DEFAULT_UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

  return {
    async getEarthquake() {
      logger.info('Fetching BMKG earthquake data', 'BMKG');
      const [autoRes, listRes] = await Promise.all([
        httpClient.get(`${DATA_URL}/autogempa.json`, { headers: { 'User-Agent': DEFAULT_UA } }),
        httpClient.get(`${DATA_URL}/gempaterkini.json`, { headers: { 'User-Agent': DEFAULT_UA } }),
      ]);

      const latestRaw = autoRes.data?.Infogempa?.gempa || null;
      const recentRaw = listRes.data?.Infogempa?.gempa || [];

      if (latestRaw && latestRaw.Shakemap) {
        latestRaw.ShakemapUrl = `${DATA_URL}/${latestRaw.Shakemap}`;
      }

      return {
        latest: latestRaw,
        recent: recentRaw,
      };
    },

    async getFeltEarthquake() {
      logger.info('Fetching BMKG felt earthquake data', 'BMKG');
      const { data } = await httpClient.get(`${DATA_URL}/gempadirasakan.json`, {
        headers: { 'User-Agent': DEFAULT_UA },
      });
      return data?.Infogempa?.gempa || [];
    },

    async getWeatherByDesa(adm4Code = '31.71.01.1001') {
      logger.info(`Fetching BMKG weather forecast by desa adm4=${adm4Code}`, 'BMKG');
      const url = `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${encodeURIComponent(adm4Code)}`;
      const { data } = await httpClient.get(url, {
        headers: {
          'User-Agent': DEFAULT_UA,
          Accept: 'application/json',
        },
        timeout: 10000,
      });

      return data;
    },
  };
}

const defaultBmkgService = createBmkgService();
export const getEarthquake = defaultBmkgService.getEarthquake;
export const getFeltEarthquake = defaultBmkgService.getFeltEarthquake;
export const getWeatherByDesa = defaultBmkgService.getWeatherByDesa;
