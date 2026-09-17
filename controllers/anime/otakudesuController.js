export class OtakudesuController {
  constructor({ otakudesuService }) {
    this.otakudesuService = otakudesuService;
  }

  handleHome = async (req, res) => {
    try {
      const data = await this.otakudesuService.getHome();
      return res.json({ status: 'success', data });
    } catch (err) {
      return res.status(500).json({ status: 'error', message: err.message });
    }
  };

  handleSchedule = async (req, res) => {
    try {
      const data = await this.otakudesuService.getSchedule();
      return res.json({ status: 'success', data });
    } catch (err) {
      return res.status(500).json({ status: 'error', message: err.message });
    }
  };

  handleSearch = async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) return res.status(400).json({ status: 'error', message: 'Parameter query q wajib diisi' });
      const data = await this.otakudesuService.search(q);
      return res.json({ status: 'success', data });
    } catch (err) {
      return res.status(500).json({ status: 'error', message: err.message });
    }
  };

  handleDetail = async (req, res) => {
    try {
      const { slug } = req.query;
      if (!slug) return res.status(400).json({ status: 'error', message: 'Parameter slug wajib diisi' });
      const data = await this.otakudesuService.getDetail(slug);
      return res.json({ status: 'success', data });
    } catch (err) {
      return res.status(500).json({ status: 'error', message: err.message });
    }
  };

  handleEpisode = async (req, res) => {
    try {
      const { slug } = req.query;
      if (!slug) return res.status(400).json({ status: 'error', message: 'Parameter slug wajib diisi' });
      const data = await this.otakudesuService.getEpisode(slug);
      return res.json({ status: 'success', data });
    } catch (err) {
      return res.status(500).json({ status: 'error', message: err.message });
    }
  };

  handleStream = async (req, res) => {
    try {
      const payload = req.body || req.query;
      if (!payload || Object.keys(payload).length === 0) {
        return res.status(400).json({ status: 'error', message: 'Payload mirror stream wajib dikirimkan' });
      }
      const data = await this.otakudesuService.getStream(payload);
      return res.json({ status: 'success', data });
    } catch (err) {
      return res.status(500).json({ status: 'error', message: err.message });
    }
  };
}
