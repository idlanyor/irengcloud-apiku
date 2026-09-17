export function createYoutubeController({ youtubeService }) {
  return {
    async handleYoutubeDownload(req, res, next) {
      try {
        const targetUrl = req.query.url;
        const quality = req.query.quality || '360';

        if (!targetUrl) {
          return res.status(400).json({
            success: false,
            error: 'Parameter "url" YouTube (URL / Video ID / Shorts) wajib diisi. Contoh: ?url=https://youtu.be/...&quality=360',
          });
        }

        const result = await youtubeService.convertVideo(targetUrl, quality);

        res.json(result);
      } catch (err) {
        res.status(400).json({
          success: false,
          error: err.message || 'Gagal mengonversi video YouTube',
        });
      }
    },
  };
}
