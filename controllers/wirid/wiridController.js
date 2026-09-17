/**
 * Wirid & Dzikir Controller
 */
export function createWiridController({ wiridService }) {
  /**
   * GET /api/v1/wirid
   * Retrieves complete Wirid, Ratib, Hizib, or Shalawat texts
   */
  async function getWiridHandler(req, res, next) {
    try {
      const { category } = req.query;
      const result = await wiridService.getWiridData({ category });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  return {
    getWiridHandler,
  };
}
