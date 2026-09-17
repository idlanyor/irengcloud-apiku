import express from 'express';

export function createYtdl3Router({ youtube3Controller }) {
  const router = express.Router();

  router.get('/', youtube3Controller.handleYoutubeDownload);

  return router;
}
