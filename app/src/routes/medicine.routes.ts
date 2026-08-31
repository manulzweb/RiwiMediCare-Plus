// app/src/routes/medicine.routes.ts
import { Router } from 'express';
import { UserRole } from '../constants/roles.enum.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { createMedicine, getMedicines, getMedicineById, updateMedicine, deleteMedicine } from '../controllers/medicine.controller.js';

const router = Router();

router.get('/', authMiddleware, getMedicines);
router.get('/:id', authMiddleware, getMedicineById);
router.post('/', authMiddleware, roleMiddleware(UserRole.ADMIN), createMedicine);
router.put('/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), updateMedicine);
router.delete('/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), deleteMedicine);

export default router;
