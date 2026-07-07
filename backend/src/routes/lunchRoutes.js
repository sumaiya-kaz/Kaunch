import express from 'express';
import { lunchController } from '../controllers/lunchController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/confirm', authenticate, lunchController.confirmLunch);
router.get('/today', authenticate, lunchController.getTodayConfirmation);
router.get('/history', authenticate, lunchController.getHistory);
router.get('/all', authenticate, authorize('admin', 'hr'), lunchController.getAllTodayConfirmations);
router.get('/pending', authenticate, authorize('admin', 'hr'), lunchController.getPendingConfirmations);
router.get('/stats', authenticate, authorize('admin', 'hr'), lunchController.getStats);
router.get('/sheet', authenticate, authorize('admin', 'hr'), lunchController.getDailySheet);
router.post('/sheet', authenticate, authorize('admin', 'hr'), lunchController.saveDailySheet);

export default router;
