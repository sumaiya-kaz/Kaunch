import express from 'express';
import { fineController } from '../controllers/fineController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authenticate, authorize('admin'), fineController.createFine);
router.post('/generate', authenticate, authorize('admin', 'hr'), fineController.generateFromSheet);
router.get('/', authenticate, authorize('admin', 'hr'), fineController.getAllFines);
router.get('/my', authenticate, fineController.getMyFines);
router.get('/daily', authenticate, fineController.getFinesByDate);
router.get('/stats', authenticate, authorize('admin', 'hr'), fineController.getMonthlyStats);
router.get('/:id', authenticate, fineController.getFineById);
router.put('/:id/status', authenticate, authorize('admin'), fineController.updateFineStatus);

export default router;
