export function createTvController({ tvService }) {
  return {
    async handleListChannels(req, res) {
      try {
        const data = await tvService.listChannels();
        return res.json({ status: 'success', data });
      } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
      }
    },

    async handleSchedule(req, res) {
      try {
        const channelId = req.query.channel || req.query.id;
        if (!channelId) {
          return res.status(400).json({ status: 'error', message: 'Parameter "channel" ID wajib diisi' });
        }
        const data = await tvService.getSchedule(channelId);
        return res.json({ status: 'success', channel: channelId, data });
      } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
      }
    },

    async handleNowPlaying(req, res) {
      try {
        const data = await tvService.getNowPlaying();
        return res.json({ status: 'success', data });
      } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
      }
    },

    async handleFootball(req, res) {
      try {
        const data = await tvService.getFootballSchedule();
        return res.json({ status: 'success', data });
      } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
      }
    },
  };
}
