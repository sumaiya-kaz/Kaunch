import express from 'express';
import { employeeController } from '../controllers/employeeController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, authorize('admin', 'hr'), employeeController.getAllEmployees);
router.get('/:id', authenticate, authorize('admin', 'hr'), employeeController.getEmployeeById);
router.post('/', authenticate, authorize('admin'), employeeController.createEmployee);
router.put('/:id', authenticate, authorize('admin'), employeeController.updateEmployee);
router.delete('/:id', authenticate, authorize('admin'), employeeController.deleteEmployee);

export default router;
