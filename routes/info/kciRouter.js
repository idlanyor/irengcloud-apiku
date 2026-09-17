import { Router } from 'express';

export function createKciRouter({ kciController }) {
  const router = Router();

  router.get('/stations', kciController.handleStations);
  router.get('/schedules', kciController.handleSchedules);
  router.get('/route', kciController.handleTrainRoute);

  return router;
}
