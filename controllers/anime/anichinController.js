export function createAnichinController({ anichinService }) {
  return {
    async handleGetHome(req, res, next) {
      try {
        const data = await anichinService.getHome();
        return res.json({ success: true, data });
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: err.message || 'Gagal mengambil data beranda AniChin',
        });
      }
    },

    async handleSearch(req, res, next) {
      try {
        const query = req.query.q || req.query.query;
        if (!query) {
          return res.status(400).json({
            success: false,
            error: 'Parameter "q" (kata kunci pencarian Donghua) wajib diisi. Contoh: ?q=soul+land',
          });
        }
        const data = await anichinService.search(query);
        return res.json({ success: true, count: data.length, data });
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: err.message || 'Gagal mencari Donghua di AniChin',
        });
      }
    },

    async handleGetDetail(req, res, next) {
      try {
        const slug = req.query.slug || req.params.slug;
        if (!slug) {
          return res.status(400).json({
            success: false,
            error: 'Parameter "slug" Donghua wajib diisi. Contoh: ?slug=soul-land-2-the-unrivaled-tang-sect',
          });
        }
        const data = await anichinService.getDetail(slug);
        return res.json({ success: true, data });
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: err.message || 'Gagal mengambil detail Donghua AniChin',
        });
      }
    },

    async handleGetSchedule(req, res, next) {
      try {
        const data = await anichinService.getSchedule();
        return res.json({ success: true, data });
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: err.message || 'Gagal mengambil jadwal rilis Donghua AniChin',
        });
      }
    },

    async handleGetEpisode(req, res, next) {
      try {
        const slug = req.query.slug || req.params.slug;
        if (!slug) {
          return res.status(400).json({
            success: false,
            error:
              'Parameter "slug" episode Donghua wajib diisi. Contoh: ?slug=soul-land-2-the-unrivaled-tang-sect-episode-164-subtitle-indonesia',
          });
        }
        const data = await anichinService.getEpisode(slug);
        return res.json({ success: true, data });
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: err.message || 'Gagal mengambil episode Donghua AniChin',
        });
      }
    },
  };
}
