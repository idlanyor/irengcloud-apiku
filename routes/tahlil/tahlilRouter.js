import { Router } from 'express';

/**
 * Router Factory for Tahlil Endpoints
 * @param {Object} container
 * @param {Object} container.tahlilController
 */
export function createTahlilRouter({ tahlilController }) {
  const router = Router();

  // GET /api/v1/tahlil
  router.get('/', tahlilController.handleGetTahlil);

  // GET /api/v1/tahlil/:number
  router.get('/:number', tahlilController.handleGetVerse);

  return router;
}
