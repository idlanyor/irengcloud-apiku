export function createHaditsController({ haditsService }) {
  return {
    getBooks(req, res) {
      const summary = haditsService.getBooksSummary();
      res.json({ success: true, data: summary });
    },

    getHaditsByNumber(req, res) {
      const { imam, number } = req.params;
      const hadits = haditsService.getHaditsByNumber(imam, number);

      if (!hadits) {
        return res.status(404).json({
          success: false,
          message: `Hadits ${imam} no ${number} tidak ditemukan.`,
        });
      }

      res.json({ success: true, data: hadits });
    },

    getHaditsList(req, res) {
      const { imam } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 100);

      const result = haditsService.getHaditsList(imam, page, limit);

      res.json({
        success: true,
        ...result,
      });
    },

    searchHadits(req, res) {
      const query = req.query.q;
      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Masukkan kata kunci pencarian pada parameter ?q=...',
        });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 100);

      const result = haditsService.searchHadits(query, page, limit);

      res.json({
        success: true,
        ...result,
      });
    },
  };
}
