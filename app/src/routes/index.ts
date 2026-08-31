// app/src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth.routes.js';
import clinicRoutes from './clinic.routes.js';
import warehouseRoutes from './warehouse.routes.js';
import medicineRoutes from './medicine.routes.js';
import requestRoutes from './request.routes.js';
import seedRoutes from './seed.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/clinics', clinicRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/medicines', medicineRoutes);
router.use('/requests', requestRoutes);
router.use('/seed', seedRoutes);

export default router as Router;
