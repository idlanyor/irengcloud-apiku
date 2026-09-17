import { Router } from 'express';

export function createMediafireRouter({ mediafireController }) {
  const router = Router();

  router.get('/', mediafireController.handleMediafireDownload);

  return router;
}
