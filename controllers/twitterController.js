export function createTwitterController({ twitterService }) {
  return {
    async handleTwitterDownload(req, res, next) {
      try {
        const targetUrl = req.query.url;

        if (!targetUrl) {
          return res.status(400).json({
            success: false,
            error: 'Parameter "url" Twitter/X Tweet (URL atau Status ID) wajib diisi. Contoh: ?url=https://x.com/user/status/...',
          });
        }

        const result = await twitterService.scrapeTwitter(targetUrl);

        res.json(result);
      } catch (err) {
        res.status(400).json({
          success: false,
          error: err.message || 'Gagal mengekstrak media dari Twitter/X',
        });
      }
    },
  };
}
