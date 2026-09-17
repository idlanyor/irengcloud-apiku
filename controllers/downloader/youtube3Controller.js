export function createYoutube3Controller({ youtube3Service }) {
  return {
    async handleYoutubeDownload(req, res, next) {
      try {
        const targetUrl = req.query.url;
        const quality = req.query.quality || '720';

        if (!targetUrl) {
          return res.status(400).json({
            success: false,
            error: 'Parameter "url" YouTube wajib diisi. Contoh: ?url=https://youtu.be/...\&quality=720',
          });
        }

        const result = await youtube3Service.convertVideo(targetUrl, quality);
        return res.json(result);
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: err.message || 'Gagal mengonversi video YouTube (Server 3)',
        });
      }
    },
  };
}
