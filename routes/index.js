import { Router } from 'express';
import haditsRouter from './hadits.js';
import instagramRouter from './instagram.js';

const router = Router();

// Modul Hadits: /api/v1/hadits/...
router.use('/hadits', haditsRouter);

// Modul Instagram Scraper: /api/v1/instagram
router.use('/instagram', instagramRouter);

export default router;
