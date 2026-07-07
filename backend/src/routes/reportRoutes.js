import express from 'express';
import { reportController } from '../controllers/reportController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/employee', authenticate, authorize('admin', 'hr'), reportController.getEmployeeReport);
router.get('/daily', authenticate, authorize('admin', 'hr'), reportController.getDailyReport);
router.get('/monthly', authenticate, authorize('admin', 'hr'), reportController.getMonthlyReport);
router.get('/dashboard', authenticate, authorize('admin', 'hr'), reportController.getDashboardStats);
router.get('/export', authenticate, authorize('admin', 'hr'), reportController.exportReport);

export default router;
