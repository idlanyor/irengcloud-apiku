/**
 * Doa Controller
 */
export function createDoaController({ doaService }) {
  /**
   * GET /api/v1/doa
   * Retrieves list of Doa by category
   */
  async function getDoaHandler(req, res, next) {
    try {
      const { category } = req.query;
      const result = await doaService.getDoaData({ category });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  return {
    getDoaHandler,
  };
}
