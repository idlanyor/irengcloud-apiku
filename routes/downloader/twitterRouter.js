import { Router } from 'express';

export function createTwitterRouter({ twitterController }) {
  const router = Router();

  router.get('/', twitterController.handleTwitterDownload);

  return router;
}
