export function createInstagramController({ instagramService }) {
  return {
    async handleInstagramDownload(req, res, next) {
      try {
        const targetUrl = req.query.url;

        if (!targetUrl) {
          return res.status(400).json({
            success: false,
            error: 'Parameter "url" Instagram (Post/Reel) wajib diisi. Contoh: ?url=https://www.instagram.com/p/...',
          });
        }

        const result = await instagramService.scrapeIG(targetUrl);

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
