/**
 * MUI Khutbah Controller
 */
export function createKhutbahController({ khutbahService }) {
  /**
   * GET /api/v1/khutbah
   * Retrieves list of Friday Sermons from MUI
   */
  async function getKhutbahListHandler(req, res, next) {
    try {
      const { page, per_page } = req.query;
      const result = await khutbahService.getKhutbahList({ page, per_page });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/khutbah/detail
   * Retrieves full text content of a specific Khutbah article
   */
  async function getKhutbahDetailHandler(req, res, next) {
    try {
      const { url } = req.query;
      const result = await khutbahService.getKhutbahDetail(url);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  return {
    getKhutbahListHandler,
    getKhutbahDetailHandler,
  };
}
