import { Router } from 'express';

/**
 * Router Factory for Wirid & Dzikir Endpoints
 * @param {Object} container
 * @param {Object} container.wiridController
 */
export function createWiridRouter({ wiridController }) {
  const router = Router();

  // GET /api/v1/wirid
  router.get('/', wiridController.getWiridHandler);

  return router;
}
