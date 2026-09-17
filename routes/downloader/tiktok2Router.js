import { Router } from 'express';

export function createTiktok2Router({ tiktok2Controller }) {
  const router = Router();

  router.get('/', tiktok2Controller.handleTikTokDownload);
  router.post('/', tiktok2Controller.handleTikTokDownload);

  return router;
}
