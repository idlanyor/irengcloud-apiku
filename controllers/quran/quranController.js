/**
 * Al-Quran Controller
 */
export function createQuranController({ quranService }) {
  /**
   * GET /api/v1/quran/surat
   */
  async function getSuratListHandler(req, res, next) {
    try {
      const data = await quranService.getSuratList();

      res.json({
        success: true,
        source: 'equran_id',
        total: data.length,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/quran/surat/:nomor
   */
  async function getSuratHandler(req, res, next) {
    try {
      const { nomor } = req.params;
      const data = await quranService.getSurat(nomor);

      res.json({
        success: true,
        source: 'equran_id',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/quran/tafsir/:nomor
   */
  async function getTafsirHandler(req, res, next) {
    try {
      const { nomor } = req.params;
      const data = await quranService.getTafsir(nomor);

      res.json({
        success: true,
        source: 'equran_id',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/quran/search
   */
  async function searchAyatHandler(req, res, next) {
    try {
      const { q, page, size } = req.query;
      const data = await quranService.searchAyat({ q, page, size });

      res.json({
        success: true,
        source: 'quran_com',
        ...data,
      });
    } catch (error) {
      next(error);
    }
  }

  return {
    getSuratListHandler,
    getSuratHandler,
    getTafsirHandler,
    searchAyatHandler,
  };
}
