/**
 * Aksara Jawa Controller
 */
export function createAksaraController({ aksaraService }) {
  /**
   * GET /api/v1/aksara/latin-to-jawa
   * Converts Latin text to Javanese Script
   */
  async function latinToJawaHandler(req, res, next) {
    try {
      const { text, murda, space } = req.query;

      if (!text) {
        return res.status(400).json({
          success: false,
          error: 'Parameter "text" wajib diisi. Contoh: ?text=Sugeng Enjang'
        });
      }

      const result = aksaraService.latinToJawa(text, {
        murda: murda === 'true',
        space: space !== 'false'
      });

      res.json({
        success: true,
        method: 'latin_to_jawa',
        input: text,
        output: result,
        options: {
          murda: murda === 'true',
          space: space !== 'false'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/aksara/jawa-to-latin
   * Converts Javanese Script to Latin
   */
  async function jawaToLatinHandler(req, res, next) {
    try {
      const { text } = req.query;

      if (!text) {
        return res.status(400).json({
          success: false,
          error: 'Parameter "text" (Aksara Jawa) wajib diisi.'
        });
      }

      const result = aksaraService.jawaToLatin(text);

      res.json({
        success: true,
        method: 'jawa_to_latin',
        input: text,
        output: result
      });
    } catch (error) {
      next(error);
    }
  }

  return {
    latinToJawaHandler,
    jawaToLatinHandler
  };
}
