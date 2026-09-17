import express from 'express';

export function createKomikuRouter({ komikuController }) {
  const router = express.Router();

  // /api/v1/komiku/home
  router.get('/home', komikuController.handleGetHome);

  // /api/v1/komiku/search?q=one+piece
  router.get('/search', komikuController.handleSearch);

  // /api/v1/komiku/detail?slug=one-piece
  router.get('/detail', komikuController.handleGetDetail);
  router.get('/detail/:slug', komikuController.handleGetDetail);

  // /api/v1/komiku/chapter?slug=one-piece-chapter-1120
  router.get('/chapter', komikuController.handleGetChapter);
  router.get('/chapter/:slug', komikuController.handleGetChapter);

  // Image Anti-Hotlink Bypasser Proxy
  // /api/v1/komiku/proxy-image?url=https://img.komiku.org/...
  router.get('/proxy-image', komikuController.handleProxyImage);

  return router;
}
