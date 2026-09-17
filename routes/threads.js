import { Router } from 'express';

export function createThreadsRouter({ threadsController }) {
  const router = Router();

  router.get('/', threadsController.handleThreadsDownload);

  return router;
}
