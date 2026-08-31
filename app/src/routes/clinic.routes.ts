// app/src/routes/clinic.routes.ts
import { Router } from 'express';
import { UserRole } from '../constants/roles.enum.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createClinicSchema,
  updateClinicSchema,
  clinicIdParamSchema,
} from '../schemas/clinic.schema.js';
import {
  createClinic,
  getClinics,
  getClinicById,
  updateClinic,
  deleteClinic,
} from '../controllers/clinic.controller.js';
import { checkDuplicateNitMiddleware } from '../middleware/checkNit.middleware.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Clinic:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         name: { type: string, example: "Clínica Central" }
 *         nit: { type: string, example: "900123456-1" }
 *         address: { type: string, example: "Calle 10 # 20-30" }
 *         phone: { type: string, example: "+57 3001234567" }
 *         responsibleName: { type: string, example: "Ana García" }
 *         responsibleEmail: { type: string, format: email, example: "ana@clinic.com" }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     ClinicInput:
 *       type: object
 *       required: [name, nit, address, phone, responsibleName, responsibleEmail]
 *       example:
 *         name: "Clínica Norte"
 *         nit: "900123456-10"
 *         address: "Carrera 15 # 85-20, Bogotá"
 *         phone: "+57 301 4567890"
 *         responsibleName: "Laura Méndez"
 *         responsibleEmail: "laura.mendez@clinic.com"
 *       properties:
 *         name: { type: string, example: "Clínica Norte" }
 *         nit: { type: string, example: "900123456-10" }
 *         address: { type: string, example: "Carrera 15 # 85-20, Bogotá" }
 *         phone: { type: string, example: "+57 301 4567890" }
 *         responsibleName: { type: string, example: "Laura Méndez" }
 *         responsibleEmail: { type: string, format: email, example: "laura.mendez@clinic.com" }
 *     ClinicUpdateInput:
 *       type: object
 *       description: "Todos los campos opcionales — envía solo lo que quieres cambiar. NIT único validado por middleware (409 si ya existe en otra clínica)."
 *       example:
 *         name: "Clínica Norte Actualizada"
 *         nit: "900123456-11"
 *         address: "Calle 15 # 30-45, Medellín"
 *         phone: "+57 3019876543"
 *         responsibleName: "Carlos Pérez"
 *         responsibleEmail: "carlos.perez@clinic.com"
 *       properties:
 *         name: { type: string, example: "Clínica Norte Actualizada" }
 *         nit: { type: string, example: "900123456-11" }
 *         address: { type: string, example: "Calle 15 # 30-45, Medellín" }
 *         phone: { type: string, example: "+57 3019876543" }
 *         responsibleName: { type: string, example: "Carlos Pérez" }
 *         responsibleEmail: { type: string, format: email, example: "carlos.perez@clinic.com" }
 */

/**
 * @swagger
 * /api/v1/clinics:
 *   get:
 *     summary: List active clinics (ADMIN, REQUEST_MANAGER)
 *     description: Chain — Auth(401) → RoleGuard(403) → Controller. Paranoid filter hides logically deleted clinics.
 *     tags: [Clinics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active clinics
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
 *                     $ref: '#/components/schemas/Clinic'
 *       401:
 *         description: Unauthorized — missing/invalid JWT
 *       403:
 *         description: Forbidden — insufficient role
 */
router.get(
  '/',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.REQUEST_MANAGER),
  getClinics,
);

/**
 * @swagger
 * /api/v1/clinics/{id}:
 *   get:
 *     summary: Get clinic by ID (ADMIN, REQUEST_MANAGER)
 *     description: Chain — Auth(401) → RoleGuard(403) → Validate params(400) → Controller(404)
 *     tags: [Clinics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Clinic INTEGER id
 *     responses:
 *       200:
 *         description: Clinic found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Clinic'
 *       400:
 *         description: Validation failed — invalid id
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Clinic not found
 */
router.get(
  '/:id',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.REQUEST_MANAGER),
  validate(clinicIdParamSchema, 'params'),
  getClinicById,
);

/**
 * @swagger
 * /api/v1/clinics:
 *   post:
 *     summary: Create clinic (ADMIN only) — prueba con NIT 900123456-10
 *     description: Chain — Auth(401) → RoleGuard(403) → Zod body(400) → checkDuplicateNitMiddleware(409) → Controller(201). **Tip:** El ejemplo ya trae NIT libre `900123456-10` (DB tiene `900123456-1` y `900123356-1`). Si ves `409`, cambia el NIT a otro `90012345X-X`.
 *     tags: [Clinics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClinicInput'
 *     responses:
 *       201:
 *         description: Clinic created
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
 *                   $ref: '#/components/schemas/Clinic'
 *       400:
 *         description: Validation failed — missing/invalid fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — ADMIN only
 *       409:
 *         description: Duplicate NIT
 */
router.post(
  '/',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  validate(createClinicSchema, 'body'),
  checkDuplicateNitMiddleware,
  createClinic,
);

/**
 * @swagger
 * /api/v1/clinics/{id}:
 *   put:
 *     summary: Update clinic (ADMIN only) — envía solo 1 campo si quieres
 *     description: Chain — Auth(401) → RoleGuard(403) → Validate params(400) → Zod body(400) → checkDuplicateNitMiddleware(409) → Controller(200). **Tip:** Puedes enviar solo `{"name":"Nuevo nombre"}`. Si cambias NIT usa uno libre `900123456-11` (no `900123456-1` que ya existe).
 *     tags: [Clinics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClinicUpdateInput'
 *     responses:
 *       200:
 *         description: Clinic updated
 *       400:
 *         description: Validation failed — invalid id or empty body
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Clinic not found
 *       409:
 *         description: Duplicate NIT
 */
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  validate(clinicIdParamSchema, 'params'),
  validate(updateClinicSchema, 'body'),
  checkDuplicateNitMiddleware,
  updateClinic,
);

/**
 * @swagger
 * /api/v1/clinics/{id}:
 *   delete:
 *     summary: Logical delete clinic (ADMIN only) — sets deleted_at/isDeleted
 *     description: Chain — Auth(401) → RoleGuard(403) → Validate params(400) → Controller → Service paranoid destroy (isDeleted=true)
 *     tags: [Clinics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Clinic deleted
 *       400:
 *         description: Invalid id
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Clinic not found
 */
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  validate(clinicIdParamSchema, 'params'),
  deleteClinic,
);

export default router;
