/**
 * Tahlil Controller
 */
export function createTahlilController({ tahlilService }) {
  /**
   * GET /api/v1/tahlil
   * Retrieves complete 56 Bacaan Tahlil or filtered/paginated verses
   */
  async function handleGetTahlil(req, res, next) {
    try {
      const { page, limit, number } = req.query;
      const result = await tahlilService.getTahlilData({ page, limit, number });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/tahlil/:number
   * Retrieves a single Tahlil verse by number
   */
  async function handleGetVerse(req, res, next) {
    try {
      const { number } = req.params;
      const result = await tahlilService.getVerse(number);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  return {
    handleGetTahlil,
    handleGetVerse,
  };
}
