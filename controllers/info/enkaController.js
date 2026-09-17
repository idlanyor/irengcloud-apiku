export function createEnkaController({ enkaService }) {
  return {
    async handleProfile(req, res) {
      try {
        const uid = req.params.uid || req.query.uid;
        if (!uid) {
          return res.status(400).json({ status: 'error', message: 'Parameter "uid" Genshin Impact / HSR wajib diisi' });
        }
        const data = await enkaService.getProfile(uid);
        return res.json({ status: 'success', data });
      } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
      }
    },
  };
}
