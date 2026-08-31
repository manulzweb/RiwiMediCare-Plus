// app/src/routes/warehouse.routes.ts
import { Router } from 'express';
import { UserRole } from '../constants/roles.enum.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { createWarehouse, getWarehouses, getWarehouseById, updateWarehouse, deleteWarehouse } from '../controllers/warehouse.controller.js';

const router = Router();

router.get('/', authMiddleware, getWarehouses);
router.get('/:id', authMiddleware, getWarehouseById);
router.post('/', authMiddleware, roleMiddleware(UserRole.ADMIN), createWarehouse);
router.put('/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), updateWarehouse);
router.delete('/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), deleteWarehouse);

export default router;
