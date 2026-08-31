// app/src/routes/medicine.routes.ts
import { Router } from 'express';
import { UserRole } from '../constants/roles.enum.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { clinicIdParamSchema } from '../schemas/clinic.schema.js';
import {
  createMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
} from '../controllers/medicine.controller.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Medicine:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Paracetamol 500mg
 *         code:
 *           type: string
 *           example: MED-001
 *         description:
 *           type: string
 *           example: Analgésico y antipirético
 *         stock:
 *           type: integer
 *           example: 500
 *         unitPrice:
 *           type: number
 *           example: 2500.50
 *         warehouseId:
 *           type: integer
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     MedicineInput:
 *       type: object
 *       required: [name, code, stock, unitPrice, warehouseId]
 *       properties:
 *         name:
 *           type: string
 *           example: Paracetamol 500mg
 *         code:
 *           type: string
 *           example: MED-001
 *         description:
 *           type: string
 *           example: Analgésico y antipirético
 *         stock:
 *           type: integer
 *           minimum: 0
 *           example: 500
 *         unitPrice:
 *           type: number
 *           minimum: 0
 *           example: 2500.50
 *         warehouseId:
 *           type: integer
 *           example: 1
 *     MedicineUpdateInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: Paracetamol 1000mg
 *         stock:
 *           type: integer
 *           example: 600
 *         unitPrice:
 *           type: number
 *           example: 3000.00
 *         warehouseId:
 *           type: integer
 *           example: 1
 */

/**
 * @swagger
 * /api/v1/medicines:
 *   get:
 *     summary: List all active medicines
 *     tags: [Medicines]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of medicines
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
 *                     $ref: '#/components/schemas/Medicine'
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, getMedicines);

/**
 * @swagger
 * /api/v1/medicines/{id}:
 *   get:
 *     summary: Get medicine by ID
 *     tags: [Medicines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Medicine ID
 *     responses:
 *       200:
 *         description: Medicine found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Medicine'
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Medicine not found
 */
router.get('/:id', authMiddleware, validate(clinicIdParamSchema, 'params'), getMedicineById);

/**
 * @swagger
 * /api/v1/medicines:
 *   post:
 *     summary: Create a new medicine (ADMIN only)
 *     description: Checks that the associated warehouse exists.
 *     tags: [Medicines]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicineInput'
 *     responses:
 *       201:
 *         description: Medicine created
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
 *                   $ref: '#/components/schemas/Medicine'
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — ADMIN only
 *       404:
 *         description: Warehouse not found
 */
router.post('/', authMiddleware, roleMiddleware(UserRole.ADMIN), createMedicine);

/**
 * @swagger
 * /api/v1/medicines/{id}:
 *   put:
 *     summary: Update medicine (ADMIN only)
 *     tags: [Medicines]
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
 *             $ref: '#/components/schemas/MedicineUpdateInput'
 *     responses:
 *       200:
 *         description: Medicine updated
 *       400:
 *         description: Invalid ID or body
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — ADMIN only
 *       404:
 *         description: Medicine not found
 */
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  validate(clinicIdParamSchema, 'params'),
  updateMedicine,
);

/**
 * @swagger
 * /api/v1/medicines/{id}:
 *   delete:
 *     summary: Soft delete medicine (ADMIN only)
 *     tags: [Medicines]
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
 *         description: Medicine deleted
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — ADMIN only
 *       404:
 *         description: Medicine not found
 */
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  validate(clinicIdParamSchema, 'params'),
  deleteMedicine,
);

export default router;
