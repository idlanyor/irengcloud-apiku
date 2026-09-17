/**
 * Jadwal Sholat Controller
 */
export function createSholatController({ sholatService }) {
  /**
   * GET /api/v1/sholat/kota
   * Retrieves list of supported cities with ID mapping
   */
  async function getKotaListHandler(req, res, next) {
    try {
      const { q } = req.query;
      const cities = await sholatService.getKotaList(q);

      res.json({
        success: true,
        query: q || null,
        total: cities.length,
        data: cities,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/sholat/jadwal
   * Retrieves daily and monthly prayer schedules
   */
  async function getJadwalHandler(req, res, next) {
    try {
      const { id, kota, bulan, tahun } = req.query;
      const result = await sholatService.getJadwalSholat({ id, kota, bulan, tahun });

      res.json({
        success: true,
        source: 'jadwal_sholat_indonesia',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  return {
    getKotaListHandler,
    getJadwalHandler,
  };
}
