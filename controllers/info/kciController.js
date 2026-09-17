export function createKciController({ kciService }) {
  return {
    async handleStations(req, res) {
      try {
        const data = await kciService.getStations();
        return res.json({ status: 'success', total: data.length, data });
      } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
      }
    },

    async handleSchedules(req, res) {
      try {
        const stationId = req.query.stationId || req.query.station || req.query.sta_id;
        const timeFrom = req.query.timeFrom || req.query.from || '05:00';
        const timeTo = req.query.timeTo || req.query.to || '23:00';

        if (!stationId) {
          return res.status(400).json({ status: 'error', message: 'Parameter "stationId" (kode stasiun, contoh: BOO, MRI, JAKK) wajib diisi' });
        }

        const data = await kciService.getSchedules({ stationId, timeFrom, timeTo });
        return res.json({ status: 'success', stationId, timeFrom, timeTo, total: data.length, data });
      } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
      }
    },

    async handleTrainRoute(req, res) {
      try {
        const trainId = req.query.trainId || req.query.train_id || req.query.ka;
        if (!trainId) {
          return res.status(400).json({ status: 'error', message: 'Parameter "trainId" (nomor KA, contoh: 1009) wajib diisi' });
        }

        const data = await kciService.getTrainRoute(trainId);
        return res.json({ status: 'success', trainId, total_stations: data.length, data });
      } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
      }
    },
  };
}
