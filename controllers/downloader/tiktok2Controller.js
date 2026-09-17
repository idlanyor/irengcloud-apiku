export function createTiktok2Controller({ tiktok2Service }) {
  return {
    async handleTikTokDownload(req, res, next) {
      try {
        const targetUrl = req.query.url || req.body?.url;

        if (!targetUrl) {
          return res.status(400).json({
            success: false,
            error: 'Parameter "url" TikTok Video wajib diisi. Contoh: ?url=https://www.tiktok.com/@.../video/...',
          });
        }

        const result = await tiktok2Service.scrapeTikTokVideo(targetUrl);

        if (!result || !result.success) {
          return res.status(400).json(result || { success: false, error: 'Gagal mengekstrak data TikTok' });
        }

        res.json(result);
      } catch (err) {
        next(err);
      }
    },
  };
}
