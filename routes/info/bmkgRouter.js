import express from 'express';

export function createBmkgRouter({ bmkgController }) {
  const router = express.Router();

  // /api/v1/bmkg/gempa (autogempa & gempaterkini)
  router.get('/gempa', bmkgController.handleGetEarthquake);

  // /api/v1/bmkg/gempa-dirasakan
  router.get('/gempa-dirasakan', bmkgController.handleGetFeltEarthquake);

  // /api/v1/bmkg/cuaca?adm4=31.71.01.1001
  router.get('/cuaca', bmkgController.handleGetWeather);
  router.get('/cuaca/:adm4', bmkgController.handleGetWeather);

  return router;
}
