/**
 * Lirik Controller
 */
export function createLirikController({ lirikService }) {
  /**
   * GET /api/v1/lirik/search
   * Cari lirik lagu berdasarkan kata kunci bebas atau judul/artis/album spesifik.
   */
  async function searchHandler(req, res, next) {
    try {
      const { q, judul, artis, album } = req.query;
      const data = await lirikService.search({ q, judul, artis, album });

      res.json({
        success: true,
        query: q || { judul, artis, album },
        count: data.length,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/lirik
   * Ambil lirik (plain + synced) untuk lagu spesifik berdasarkan judul & artis.
   */
  async function getHandler(req, res, next) {
    try {
      const { judul, artis, album, durasi } = req.query;

      if (!judul || !artis) {
        return res.status(400).json({
          success: false,
          error: 'Parameter judul dan artis wajib diisi.',
        });
      }

      const data = await lirikService.getBest({ judul, artis, album, durasi });

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'Lirik lagu tidak ditemukan.',
        });
      }

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  return { searchHandler, getHandler };
}
