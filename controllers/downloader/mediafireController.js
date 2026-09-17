export function createMediafireController({ mediafireService }) {
  return {
    async handleMediafireDownload(req, res, next) {
      try {
        const targetUrl = req.query.url;

        if (!targetUrl) {
          return res.status(400).json({
            success: false,
            error: 'Parameter "url" Mediafire File wajib diisi. Contoh: ?url=https://www.mediafire.com/file/...',
          });
        }

        const result = await mediafireService.scrapeMediafire(targetUrl);

        res.json(result);
      } catch (err) {
        res.status(400).json({
          success: false,
          error: err.message || 'Gagal mengekstrak link unduhan Mediafire',
        });
      }
    },
  };
}
