import express from 'express';
import { subscriptionController } from '../controllers/subscriptionController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authenticate, subscriptionController.createSubscription);
router.put('/food-choice', authenticate, subscriptionController.updateMonthlyFoodChoice);
router.get('/my', authenticate, subscriptionController.getMySubscription);
router.get('/', authenticate, authorize('admin', 'hr'), subscriptionController.getAllSubscriptions);
router.put('/:id/deactivate', authenticate, authorize('admin'), subscriptionController.deactivateSubscription);

export default router;
