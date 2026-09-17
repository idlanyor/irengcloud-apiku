import { Router } from 'express';

/**
 * Router Factory for Jadwal Sholat Endpoints
 * @param {Object} container
 * @param {Object} container.sholatController
 */
export function createSholatRouter({ sholatController }) {
  const router = Router();

  // GET /api/v1/sholat/kota
  router.get('/kota', sholatController.getKotaListHandler);

  // GET /api/v1/sholat/jadwal
  router.get('/jadwal', sholatController.getJadwalHandler);

  return router;
}
