import { Router } from 'express';

export function createStatsRouter({ statsController }) {
  const router = Router();

  router.get('/', statsController.handleGetStats);

  return router;
}
