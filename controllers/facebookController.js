export function createFacebookController({ facebookService }) {
  return {
    async handleFacebookDownload(req, res, next) {
      try {
        const targetUrl = req.query.url;

        if (!targetUrl) {
          return res.status(400).json({
            success: false,
            error: 'Parameter "url" Facebook Video wajib diisi. Contoh: ?url=https://www.facebook.com/watch/?v=...',
          });
        }

        const result = await facebookService.scrapeFB(targetUrl);

        if (!result.success) {
          return res.status(400).json(result);
        }

        res.json(result);
      } catch (err) {
        next(err);
      }
    },
  };
}
