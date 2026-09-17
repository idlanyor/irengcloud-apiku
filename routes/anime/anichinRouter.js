import express from 'express';

export function createAnichinRouter({ anichinController }) {
  const router = express.Router();

  // /api/v1/anichin/home
  router.get('/home', anichinController.handleGetHome);

  // /api/v1/anichin/search?q=soul+land
  router.get('/search', anichinController.handleSearch);

  // /api/v1/anichin/detail?slug=soul-land-2-the-unrivaled-tang-sect
  router.get('/detail', anichinController.handleGetDetail);
  router.get('/detail/:slug', anichinController.handleGetDetail);

  // /api/v1/anichin/jadwal
  router.get('/jadwal', anichinController.handleGetSchedule);

  // /api/v1/anichin/episode?slug=soul-land-2-the-unrivaled-tang-sect-episode-164-subtitle-indonesia
  router.get('/episode', anichinController.handleGetEpisode);
  router.get('/episode/:slug', anichinController.handleGetEpisode);

  return router;
}
