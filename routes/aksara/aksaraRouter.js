import { Router } from 'express';

/**
 * Router Factory for Aksara Jawa Endpoints
 * @param {Object} container
 * @param {Object} container.aksaraController
 */
export function createAksaraRouter({ aksaraController }) {
  const router = Router();

  // GET /api/v1/aksara/latin-to-jawa
  router.get('/latin-to-jawa', aksaraController.latinToJawaHandler);

  // GET /api/v1/aksara/jawa-to-latin
  router.get('/jawa-to-latin', aksaraController.jawaToLatinHandler);

  return router;
}
