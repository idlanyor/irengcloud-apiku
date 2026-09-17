import defaultLogger from '../../utils/logger.js';

export function createKciService({ httpClient, logger = defaultLogger } = {}) {
  const BASE_URL = 'https://kci.id/api/krl';
  const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  async function getJson(endpoint, params = {}) {
    const res = await httpClient.get(`${BASE_URL}/${endpoint}`, {
      params,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
      },
    });
    return res.data;
  }

  return {
    async getStations() {
      logger.info('Fetching KCI stations list', 'KCI');
      const response = await getJson('stations');
      const rawData = response?.data || [];
      const stations = rawData
        .filter((s) => s.fg_enable === 1)
        .map((s) => ({
          station_id: s.sta_id,
          name: s.sta_name,
          group_region: s.group_wil,
        }));
      return stations;
    },

    async getSchedules({ stationId, timeFrom = '05:00', timeTo = '23:00' }) {
      if (!stationId) throw new Error('Parameter "stationId" (kode stasiun, contoh: BOO, MRI) wajib diisi');
      logger.info(`Fetching KCI schedules for station: ${stationId}`, 'KCI');

      const response = await getJson('schedules', {
        stationid: stationId,
        timefrom: timeFrom,
        timeto: timeTo,
      });

      const rawData = response?.data || [];
      return rawData.map((item) => ({
        train_id: item.train_id,
        line: item.ka_name,
        route: item.route_name,
        destination: item.dest,
        departure_time: item.time_est,
        destination_arrival_time: item.dest_time,
        color: item.color,
      }));
    },

    async getTrainRoute(trainId) {
      if (!trainId) throw new Error('Parameter "trainId" (nomor KA, contoh: 1009) wajib diisi');
      logger.info(`Fetching KCI train route for train_id: ${trainId}`, 'KCI');

      const response = await getJson('train-schedule', { trainid: trainId });
      const rawData = response?.data || [];

      return rawData.map((st) => ({
        train_id: st.train_id,
        line: st.ka_name,
        station_id: st.station_id,
        station_name: st.station_name,
        arrival_time: st.time_est,
        is_transit_station: st.transit_station,
        transit_lines: st.transit || [],
        color: st.color,
      }));
    },
  };
}
