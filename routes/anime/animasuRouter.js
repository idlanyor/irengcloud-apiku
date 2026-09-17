import express from 'express';

export function createAnimasuRouter({ animasuController }) {
  const router = express.Router();

  // /api/v1/animasu/home?page=1
  router.get('/home', animasuController.handleGetHome);

  // /api/v1/animasu/search?q=naruto
  router.get('/search', animasuController.handleSearch);

  // /api/v1/animasu/detail?slug=one-piece
  router.get('/detail', animasuController.handleGetDetail);
  router.get('/detail/:slug', animasuController.handleGetDetail);

  // /api/v1/animasu/jadwal
  router.get('/jadwal', animasuController.handleGetSchedule);

  // /api/v1/animasu/episode?slug=one-piece-episode-1090-sub-indo
  router.get('/episode', animasuController.handleGetEpisode);
  router.get('/episode/:slug', animasuController.handleGetEpisode);

  return router;
}
