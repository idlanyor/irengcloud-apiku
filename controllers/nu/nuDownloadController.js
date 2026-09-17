/**
 * NU Online Download Controller
 */
export function createNuDownloadController({ nuDownloadService }) {
  /**
   * GET /api/v1/nu-download
   * Retrieves list of downloadable files from NU Online
   */
  async function getDownloadItemsHandler(req, res, next) {
    try {
      const { category, q } = req.query;
      const result = await nuDownloadService.getDownloadItems({ category, q });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  return {
    getDownloadItemsHandler,
  };
}
