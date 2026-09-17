import express from 'express';

export function createYtdl2Router({ youtube2Controller }) {
  const router = express.Router();

  router.get('/', youtube2Controller.handleYoutubeDownload);

  return router;
}
