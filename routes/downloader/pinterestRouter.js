import { Router } from 'express';

export function createPinterestRouter({ pinterestController }) {
  const router = Router();

  router.get('/', pinterestController.handleFetch);

  return router;
}
