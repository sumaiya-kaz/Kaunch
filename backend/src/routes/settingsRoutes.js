import express from 'express';
import { settingsController } from '../controllers/settingsController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/cutoff', authenticate, settingsController.getCutoff);
router.put('/cutoff', authenticate, authorize('admin'), settingsController.updateCutoff);

export default router;
