import { Router } from 'express';

/**
 * Router Factory for Doa Endpoints
 * @param {Object} container
 * @param {Object} container.doaController
 */
export function createDoaRouter({ doaController }) {
  const router = Router();

  // GET /api/v1/doa
  router.get('/', doaController.getDoaHandler);

  return router;
}
