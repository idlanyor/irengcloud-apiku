import { Router } from 'express';

export function createInstagramRouter({ instagramController }) {
  const router = Router();

  router.get('/', instagramController.handleInstagramDownload);

  return router;
}
