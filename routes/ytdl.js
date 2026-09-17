import { Router } from 'express';

export function createYtdlRouter({ youtubeController }) {
  const router = Router();

  router.get('/', youtubeController.handleYoutubeDownload);

  return router;
}
