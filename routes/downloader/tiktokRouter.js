import { Router } from 'express';

export function createTiktokRouter({ tiktokController }) {
  const router = Router();

  router.get('/', tiktokController.handleTikTokDownload);

  return router;
}
