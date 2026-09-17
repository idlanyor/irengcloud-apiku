export function createCheckHostController({ checkHostService }) {
  return {
    async handleGetIpInfo(req, res, next) {
      try {
        const host = req.query.host || req.query.ip || req.params.host || 'google.com';
        const data = await checkHostService.getIpInfo(host);
        return res.json({ success: true, data });
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: err.message || 'Gagal mengambil informasi IP/Host',
        });
      }
    },

    async handlePingCheck(req, res, next) {
      try {
        const host = req.query.host || req.query.target || req.params.host || 'google.com';
        const data = await checkHostService.pingCheck(host);
        return res.json({ success: true, data });
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: err.message || 'Gagal melakukan pemeriksaan ping global',
        });
      }
    },

    async handleWhoisLookup(req, res, next) {
      try {
        const domain = req.query.domain || req.query.host || req.params.domain || 'google.com';
        const data = await checkHostService.whoisLookup(domain);
        return res.json({ success: true, data });
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: err.message || 'Gagal melakukan WHOIS lookup',
        });
      }
    },
  };
}
