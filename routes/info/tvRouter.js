import { Router } from 'express';

export function createTvRouter({ tvController }) {
  const router = Router();

  router.get('/channels', tvController.handleListChannels);
  router.get('/schedule', tvController.handleSchedule);
  router.get('/now', tvController.handleNowPlaying);
  router.get('/football', tvController.handleFootball);

  return router;
}
