import { Router } from 'express';

export function createEnkaRouter({ enkaController }) {
  const router = Router();

  router.get('/profile/:uid', enkaController.handleProfile);
  router.get('/profile', enkaController.handleProfile);

  return router;
}
