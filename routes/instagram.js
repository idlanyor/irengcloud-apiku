import { Router } from 'express';
import { handleInstagramDownload } from '../controllers/instagramController.js';

const router = Router();

// GET /api/v1/instagram?url=https://www.instagram.com/p/...
// POST /api/v1/instagram (body: { url: "..." })
router.get('/', handleInstagramDownload);
router.post('/', handleInstagramDownload);

export default router;
