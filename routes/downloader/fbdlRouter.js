import { Router } from 'express';

export function createFbdlRouter({ facebookController }) {
  const router = Router();

  router.get('/', facebookController.handleFacebookDownload);

  return router;
}
