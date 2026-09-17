import express from 'express';

export function createCheckHostRouter({ checkHostController }) {
  const router = express.Router();

  // /api/v1/checkhost/ip-info?host=google.com
  router.get('/ip-info', checkHostController.handleGetIpInfo);
  router.get('/ip-info/:host', checkHostController.handleGetIpInfo);

  // /api/v1/checkhost/ping?host=google.com
  router.get('/ping', checkHostController.handlePingCheck);
  router.get('/ping/:host', checkHostController.handlePingCheck);

  // /api/v1/checkhost/whois?domain=google.com
  router.get('/whois', checkHostController.handleWhoisLookup);
  router.get('/whois/:domain', checkHostController.handleWhoisLookup);

  return router;
}
