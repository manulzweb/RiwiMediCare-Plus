// app/src/routes/warehouse.routes.ts
import { Router } from 'express';
import { UserRole } from '../constants/roles.enum.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import {
  createWarehouse,
  getWarehouses,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse,
} from '../controllers/warehouse.controller.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Warehouse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Bodega Central
 *         code:
 *           type: string
 *           example: BOG-001
 *         location:
 *           type: string
 *           example: Bogotá D.C.
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     WarehouseInput:
 *       type: object
 *       required: [name, code, location]
 *       properties:
 *         name:
 *           type: string
 *           example: Bodega Central
 *         code:
 *           type: string
 *           example: BOG-001
 *         location:
 *           type: string
 *           example: Bogotá D.C.
 *     WarehouseUpdateInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: Bodega Principal
 *         code:
 *           type: string
 *           example: BOG-001-A
 *         location:
 *           type: string
 *           example: Bogotá - Fontibón
 */

/**
 * @swagger
 * /api/v1/warehouses:
 *   get:
 *     summary: List all active warehouses
 *     description: Returns all warehouses that have not been logically deleted.
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of warehouses
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
 *                     $ref: '#/components/schemas/Warehouse'
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, getWarehouses);

/**
 * @swagger
 * /api/v1/warehouses/{id}:
 *   get:
 *     summary: Get warehouse by ID
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Warehouse ID
 *     responses:
 *       200:
 *         description: Warehouse found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Warehouse'
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Warehouse not found
 */
router.get('/:id', authMiddleware, getWarehouseById);

/**
 * @swagger
 * /api/v1/warehouses:
 *   post:
 *     summary: Create a new warehouse (ADMIN only)
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WarehouseInput'
 *     responses:
 *       201:
 *         description: Warehouse created
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
 *                   $ref: '#/components/schemas/Warehouse'
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — ADMIN only
 */
router.post('/', authMiddleware, roleMiddleware(UserRole.ADMIN), createWarehouse);

/**
 * @swagger
 * /api/v1/warehouses/{id}:
 *   put:
 *     summary: Update warehouse (ADMIN only)
 *     tags: [Warehouses]
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
 *             $ref: '#/components/schemas/WarehouseUpdateInput'
 *     responses:
 *       200:
 *         description: Warehouse updated
 *       400:
 *         description: Invalid ID or body
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — ADMIN only
 *       404:
 *         description: Warehouse not found
 */
router.put('/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), updateWarehouse);

/**
 * @swagger
 * /api/v1/warehouses/{id}:
 *   delete:
 *     summary: Soft delete warehouse (ADMIN only)
 *     tags: [Warehouses]
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
 *         description: Warehouse deleted (logical)
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — ADMIN only
 *       404:
 *         description: Warehouse not found
 */
router.delete('/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), deleteWarehouse);

export default router;

