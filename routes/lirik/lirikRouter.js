import { Router } from 'express';

/**
 * Router Factory for Lirik Endpoints
 * @param {Object} container
 * @param {Object} container.lirikController
 */
export function createLirikRouter({ lirikController }) {
  const router = Router();

  // GET /api/v1/lirik/search
  router.get('/search', lirikController.searchHandler);

  // GET /api/v1/lirik
  router.get('/', lirikController.getHandler);

  return router;
}
