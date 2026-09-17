import { Router } from 'express';

/**
 * Router Factory for Al-Quran Endpoints
 * @param {Object} container
 * @param {Object} container.quranController
 */
export function createQuranRouter({ quranController }) {
  const router = Router();

  // GET /api/v1/quran/surat
  router.get('/surat', quranController.getSuratListHandler);

  // GET /api/v1/quran/surat/:nomor
  router.get('/surat/:nomor', quranController.getSuratHandler);

  // GET /api/v1/quran/tafsir/:nomor
  router.get('/tafsir/:nomor', quranController.getTafsirHandler);

  // GET /api/v1/quran/search?q=rahmat&page=1&size=10
  router.get('/search', quranController.searchAyatHandler);

  return router;
}
