export function createStatsController({ statsService }) {
  return {
    handleGetStats(req, res) {
      try {
        const data = statsService.getStats();
        return res.json({ status: 'success', data });
      } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
      }
    },
  };
}
