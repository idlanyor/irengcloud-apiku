import { Router } from 'express';
import multer from 'multer';

const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB max

export function createTempMailRouter({ tempMailController }) {
  const router = Router();

  router.get('/create', tempMailController.handleCreateEmail);
  router.get('/messages', tempMailController.handleGetMessages);
  router.get('/message/:id', tempMailController.handleReadMessage);

  return router;
}

export function createUploadRouter({ uploadController }) {
  const router = Router();

  router.post('/', upload.single('file'), uploadController.handleUpload);

  return router;
}
