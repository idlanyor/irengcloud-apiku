export function createThreadsController({ threadsService }) {
  return {
    async handleThreadsDownload(req, res, next) {
      try {
        const targetUrl = req.query.url;

        if (!targetUrl) {
          return res.status(400).json({
            success: false,
            error: 'Parameter "url" Threads Post wajib diisi. Contoh: ?url=https://www.threads.net/@user/post/...',
          });
        }

        const result = await threadsService.scrapeThreads(targetUrl);

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
