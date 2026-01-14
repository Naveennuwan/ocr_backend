import express from 'express';
import { DownloadController } from '../controllers/downloadController.js';

const router = express.Router();

router.get('/excel/:filename', DownloadController.downloadExcel);
router.get('/csv/:filename', DownloadController.downloadCSV);
router.get('/text/:filename', DownloadController.downloadText);

export default router;