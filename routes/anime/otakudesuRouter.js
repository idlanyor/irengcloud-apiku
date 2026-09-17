import { Router } from 'express';

export function createOtakudesuRouter(otakudesuController) {
  const router = Router();

  router.get('/home', otakudesuController.handleHome);
  router.get('/schedule', otakudesuController.handleSchedule);
  router.get('/search', otakudesuController.handleSearch);
  router.get('/detail', otakudesuController.handleDetail);
  router.get('/episode', otakudesuController.handleEpisode);
  router.all('/stream', otakudesuController.handleStream);

  return router;
}
