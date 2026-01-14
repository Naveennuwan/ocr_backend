import express from 'express';
import { ExtractController } from '../controllers/extractController.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', uploadSingle('file'), ExtractController.extractText);

export default router;