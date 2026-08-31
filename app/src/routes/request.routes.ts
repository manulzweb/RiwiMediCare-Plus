// app/src/routes/request.routes.ts
import { Router } from 'express';
import { UserRole } from '../constants/roles.enum.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { clinicIdParamSchema, requestClinicIdParamSchema } from '../schemas/clinic.schema.js';
import { createRequestSchema, updateRequestStatusSchema } from '../schemas/request.schema.js';
import { checkQuantityMiddleware } from '../middleware/checkQuantity.middleware.js';
import { checkInventoryMiddleware } from '../middleware/checkInventory.middleware.js';
import { checkStatusMiddleware } from '../middleware/checkStatus.middleware.js';
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

/**
 * @swagger
 * components:
 *   schemas:
 *     SupplyRequest:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         clinicId:
 *           type: integer
 *           example: 1
 *         warehouseId:
 *           type: integer
 *           example: 1
 *         medicineId:
 *           type: integer
 *           example: 1
 *         quantity:
 *           type: integer
 *           example: 50
 *         status:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, DISPATCHED, DELIVERED, CANCELLED]
 *           example: PENDING
 *         notes:
 *           type: string
 *           example: Entrega prioritaria para urgencias
 *         createdById:
 *           type: integer
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     SupplyRequestInput:
 *       type: object
 *       required: [clinicId, warehouseId, medicineId, quantity]
 *       properties:
 *         clinicId:
 *           type: integer
 *           example: 1
 *         warehouseId:
 *           type: integer
 *           example: 1
 *         medicineId:
 *           type: integer
 *           example: 1
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           example: 50
 *         notes:
 *           type: string
 *           example: Entrega prioritaria para urgencias
 *     SupplyRequestStatusInput:
 *       type: object
 *       required: [status]
 *       properties:
 *         status:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, DISPATCHED, DELIVERED, CANCELLED]
 *           example: APPROVED
 *           description: "Case-insensitive — approved/Approved → APPROVED"
 */

/**
 * @swagger
 * /api/v1/requests/active:
 *   get:
 *     summary: Get active supply requests
 *     description: Returns all requests that are pending, approved or in_transit.
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SupplyRequest'
 *       401:
 *         description: Unauthorized
 */
router.get('/active', authMiddleware, getActiveRequests);

/**
 * @swagger
 * /api/v1/requests/clinic/{clinicId}:
 *   get:
 *     summary: Get request history by clinic
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: clinicId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Clinic ID
 *     responses:
 *       200:
 *         description: List of requests for the clinic
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SupplyRequest'
 *       400:
 *         description: Invalid clinicId
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Clinic not found
 */
router.get(
  '/clinic/:clinicId',
  authMiddleware,
  validate(requestClinicIdParamSchema, 'params'),
  getRequestsByClinic,
);

/**
 * @swagger
 * /api/v1/requests:
 *   get:
 *     summary: Get all supply requests
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SupplyRequest'
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, getRequests);

/**
 * @swagger
 * /api/v1/requests/{id}:
 *   get:
 *     summary: Get supply request by ID
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Request ID
 *     responses:
 *       200:
 *         description: Request found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/SupplyRequest'
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Request not found
 */
router.get('/:id', authMiddleware, validate(clinicIdParamSchema, 'params'), getRequestById);

/**
 * @swagger
 * /api/v1/requests:
 *   post:
 *     summary: Create a new supply request (ADMIN, REQUEST_MANAGER)
 *     description: Validates quantity > 0, clinic/medicine/warehouse existence and warehouse stock availability.
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SupplyRequestInput'
 *     responses:
 *       201:
 *         description: Request created successfully (status pending)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/SupplyRequest'
 *       400:
 *         description: Validation failed (e.g. quantity <= 0)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Clinic, medicine or warehouse not found
 *       409:
 *         description: Insufficient stock or medicine not in assigned warehouse
 */
router.post(
  '/',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.REQUEST_MANAGER),
  validate(createRequestSchema, 'body'),
  checkQuantityMiddleware,
  checkInventoryMiddleware,
  createRequest,
);

/**
 * @swagger
 * /api/v1/requests/{id}/status:
 *   patch:
 *     summary: Update request status (ADMIN, REQUEST_MANAGER)
 *     description: Transitions request status (pending, approved, rejected, delivered, in_transit).
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SupplyRequestStatusInput'
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid status value
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Request not found
 */
router.patch(
  '/:id/status',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.REQUEST_MANAGER),
  validate(clinicIdParamSchema, 'params'),
  validate(updateRequestStatusSchema, 'body'),
  checkStatusMiddleware,
  updateRequestStatus,
);

/**
 * @swagger
 * /api/v1/requests/{id}:
 *   delete:
 *     summary: Soft delete supply request (ADMIN only)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Request deleted
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — ADMIN only
 *       404:
 *         description: Request not found
 */
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  validate(clinicIdParamSchema, 'params'),
  deleteRequest,
);

export default router;
