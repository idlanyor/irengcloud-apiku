export function createPinterestController({ pinterestService }) {
  return {
    async handleFetch(req, res) {
      try {
        const url = req.query.url;
        if (!url) {
          return res.status(400).json({ status: 'error', message: 'Parameter "url" Pinterest wajib diisi' });
        }
        const data = await pinterestService.fetch(url);
        return res.json({ status: 'success', data });
      } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
      }
    },
  };
}
