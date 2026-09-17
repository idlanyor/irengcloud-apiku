import { Router } from 'express';

/**
 * Router Factory for NU Online Download Endpoints
 * @param {Object} container
 * @param {Object} container.nuDownloadController
 */
export function createNuDownloadRouter({ nuDownloadController }) {
  const router = Router();

  // GET /api/v1/nu-download
  router.get('/', nuDownloadController.getDownloadItemsHandler);

  return router;
}
