import express from 'express';
import { menuController } from '../controllers/menuController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/suggest', authenticate, authorize('admin'), menuController.suggestWeeklyMenu);
router.post('/suggest/day', authenticate, authorize('admin'), menuController.suggestDayMenu);
router.post('/week/plan', authenticate, authorize('admin'), menuController.createWeeklyMenuPlan);
router.post('/week', authenticate, authorize('admin'), menuController.createWeeklyMenu);
router.put('/:id', authenticate, authorize('admin'), menuController.updateMenu);
router.get('/today', authenticate, menuController.getTodayMenu);
router.get('/today/options', authenticate, menuController.getTodayMenuOptions);
router.get('/date/:date', authenticate, menuController.getMenuByDate);
router.get('/range', authenticate, menuController.getMenuByDateRange);
router.delete('/:id', authenticate, authorize('admin'), menuController.deleteMenu);

export default router;
