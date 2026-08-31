// app/src/routes/request.routes.ts
import { Router } from 'express';
import { UserRole } from '../constants/roles.enum.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import {
  createRequest,
  getRequests,
  getActiveRequests,
  getRequestsByClinic,
  getRequestById,
  updateRequestStatus,
  deleteRequest,
} from '../controllers/request.controller.js';

const router = Router();

// All authenticated can list active and history by clinic
router.get('/active', authMiddleware, getActiveRequests);
router.get('/clinic/:clinicId', authMiddleware, getRequestsByClinic);
router.get('/', authMiddleware, getRequests);
router.get('/:id', authMiddleware, getRequestById);

// Gestor and ADMIN can create and update status
router.post('/', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.REQUEST_MANAGER), createRequest);
router.patch('/:id/status', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.REQUEST_MANAGER), updateRequestStatus);

// Full CRUD for ADMIN
router.delete('/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), deleteRequest);

export default router;
