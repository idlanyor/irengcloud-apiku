export function createYoutubeController({ youtubeService }) {
  return {
    async handleYoutubeDownload(req, res, next) {
      try {
        const targetUrl = req.query.url;
        const format = req.query.format || req.query.quality || 'mp4';

        if (!targetUrl) {
          return res.status(400).json({
            success: false,
            error: 'Parameter "url" YouTube (URL / Video ID / Shorts) wajib diisi. Contoh: ?url=https://youtu.be/...&format=mp3 atau ?format=mp4',
          });
        }

        const result = await youtubeService.convertVideo(targetUrl, format);

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
