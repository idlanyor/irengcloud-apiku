import { Router } from 'express';

/**
 * Router Factory for MUI Khutbah Endpoints
 * @param {Object} container
 * @param {Object} container.khutbahController
 */
export function createKhutbahRouter({ khutbahController }) {
  const router = Router();

  // GET /api/v1/khutbah
  router.get('/', khutbahController.getKhutbahListHandler);

  // GET /api/v1/khutbah/detail
  router.get('/detail', khutbahController.getKhutbahDetailHandler);

  return router;
}
