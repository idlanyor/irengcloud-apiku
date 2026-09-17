export function createTiktokController({ tiktokService }) {
  return {
    async handleTikTokDownload(req, res, next) {
      try {
        const targetUrl = req.query.url;

        if (!targetUrl) {
          return res.status(400).json({
            success: false,
            error: 'Parameter "url" TikTok Video wajib diisi. Contoh: ?url=https://vt.tiktok.com/...',
          });
        }

        const result = await tiktokService.scrapeTikTokVideo(targetUrl);

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
