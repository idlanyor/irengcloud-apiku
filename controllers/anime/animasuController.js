export function createAnimasuController({ animasuService }) {
  return {
    async handleGetHome(req, res, next) {
      try {
        const page = req.query.page || 1;
        const data = await animasuService.getHome(page);
        return res.json({ success: true, data });
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: err.message || 'Gagal mengambil data beranda Animasu',
        });
      }
    },

    async handleSearch(req, res, next) {
      try {
        const query = req.query.q || req.query.query;
        if (!query) {
          return res.status(400).json({
            success: false,
            error: 'Parameter "q" (kata kunci pencarian) wajib diisi. Contoh: ?q=naruto',
          });
        }
        const data = await animasuService.search(query);
        return res.json({ success: true, count: data.length, data });
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: err.message || 'Gagal mencari anime di Animasu',
        });
      }
    },

    async handleGetDetail(req, res, next) {
      try {
        const slug = req.query.slug || req.params.slug;
        if (!slug) {
          return res.status(400).json({
            success: false,
            error: 'Parameter "slug" anime wajib diisi. Contoh: ?slug=one-piece',
          });
        }
        const data = await animasuService.getDetail(slug);
        return res.json({ success: true, data });
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: err.message || 'Gagal mengambil detail anime Animasu',
        });
      }
    },

    async handleGetSchedule(req, res, next) {
      try {
        const data = await animasuService.getSchedule();
        return res.json({ success: true, data });
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: err.message || 'Gagal mengambil jadwal rilis Animasu',
        });
      }
    },

    async handleGetEpisode(req, res, next) {
      try {
        const slug = req.query.slug || req.params.slug;
        if (!slug) {
          return res.status(400).json({
            success: false,
            error: 'Parameter "slug" episode wajib diisi. Contoh: ?slug=one-piece-episode-1090-sub-indo',
          });
        }
        const data = await animasuService.getEpisode(slug);
        return res.json({ success: true, data });
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: err.message || 'Gagal mengambil data episode Animasu',
        });
      }
    },
  };
}
