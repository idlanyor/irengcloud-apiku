import { Router } from 'express';

/**
 * Router Factory for Maulid Endpoints
 * @param {Object} container
 * @param {Object} container.maulidController
 */
export function createMaulidRouter({ maulidController }) {
  const router = Router();

  // GET /api/v1/maulid/books
  router.get('/books', maulidController.getBooksHandler);

  // GET /api/v1/maulid
  router.get('/', maulidController.getMaulidHandler);

  // GET /api/v1/maulid/:slug
  router.get('/:slug', maulidController.getMaulidBySlugHandler);

  return router;
}
