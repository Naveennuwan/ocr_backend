import express from 'express';
import { HealthController } from '../controllers/healthController.js';

const router = express.Router();

router.get('/', HealthController.getHomePage);
router.get('/health', HealthController.checkHealth);
router.get('/api/test-upload', HealthController.getTestUploadPage);

export default router;