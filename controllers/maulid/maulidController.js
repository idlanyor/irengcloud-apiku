/**
 * Maulid Controller
 */
export function createMaulidController({ maulidService }) {
  /**
   * GET /api/v1/maulid
   * Retrieves complete Maulid text (Arabic, Latin, Terjemah) or list of books
   */
  async function getMaulidHandler(req, res, next) {
    try {
      const { category, slug } = req.query;
      const result = await maulidService.getMaulidData({ category, slug });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/maulid/books
   * Retrieves list of available Maulid books
   */
  async function getBooksHandler(req, res, next) {
    try {
      const books = maulidService.getBooksList();
      res.json({
        success: true,
        total: books.length,
        data: books,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/maulid/:slug
   * Retrieves specific Maulid book by URL parameter
   */
  async function getMaulidBySlugHandler(req, res, next) {
    try {
      const { slug } = req.params;
      const result = await maulidService.getMaulidData({ slug });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  return {
    getMaulidHandler,
    getBooksHandler,
    getMaulidBySlugHandler,
  };
}
