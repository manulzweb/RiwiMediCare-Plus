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
 *       properties:
 *         name: { type: string, example: "Clínica Central" }
 *         nit: { type: string, example: "900123456-1" }
 *         address: { type: string, example: "Calle 10 # 20-30" }
 *         phone: { type: string, example: "+57 3001234567" }
 *         responsibleName: { type: string, example: "Ana García" }
 *         responsibleEmail: { type: string, format: email, example: "ana@clinic.com" }
 *     ClinicUpdateInput:
 *       type: object
 *       properties:
 *         name: { type: string }
 *         nit: { type: string }
 *         address: { type: string }
 *         phone: { type: string }
 *         responsibleName: { type: string }
 *         responsibleEmail: { type: string, format: email }
 */

/**
 * @swagger
 * /api/v1/clinics:
 *   get:
 *     summary: List active clinics (ADMIN, REQUEST_MANAGER)
 *     description: Chain — Auth(401) → RoleGuard(403) → Controller. Paranoid filter hides logically deleted clinics.
 *     tags: [Clinics]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of active clinics, content: { application/json: { schema: { type: object, properties: { success:{type:boolean}, data:{type:array, items:{$ref:'#/components/schemas/Clinic'}} } } } } }
 *       401: { description: Unauthorized — missing/invalid JWT }
 *       403: { description: Forbidden — insufficient role }
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
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer, minimum: 1 }, description: Clinic INTEGER id }]
 *     responses:
 *       200: { description: Clinic found, content: { application/json: { schema: { type: object, properties: { success:{type:boolean}, data:{$ref:'#/components/schemas/Clinic'}} } } } }
 *       400: { description: Validation failed — invalid id }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 *       404: { description: Clinic not found }
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
 *     summary: Create clinic (ADMIN only)
 *     description: Chain — Auth(401) → RoleGuard(403) → Zod body(400) → Service NIT unique(409) → Controller(201)
 *     tags: [Clinics]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ClinicInput' }
 *     responses:
 *       201: { description: Clinic created, content: { application/json: { schema: { type: object, properties: { success:{type:boolean}, message:{type:string}, data:{$ref:'#/components/schemas/Clinic'}} } } } }
 *       400: { description: Validation failed — missing/invalid fields }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden — ADMIN only }
 *       409: { description: Duplicate NIT }
 */
router.post(
  '/',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  validate(createClinicSchema, 'body'),
  createClinic,
);

/**
 * @swagger
 * /api/v1/clinics/{id}:
 *   put:
 *     summary: Update clinic (ADMIN only)
 *     description: Chain — Auth(401) → RoleGuard(403) → Validate params(400) → Zod body(400) → Service NIT unique(409) → Controller(200)
 *     tags: [Clinics]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer, minimum: 1 } }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ClinicUpdateInput' }
 *     responses:
 *       200: { description: Clinic updated }
 *       400: { description: Validation failed — invalid id or empty body }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 *       404: { description: Clinic not found }
 *       409: { description: Duplicate NIT }
 */
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  validate(clinicIdParamSchema, 'params'),
  validate(updateClinicSchema, 'body'),
  updateClinic,
);

/**
 * @swagger
 * /api/v1/clinics/{id}:
 *   delete:
 *     summary: Logical delete clinic (ADMIN only) — sets deleted_at/isDeleted
 *     description: Chain — Auth(401) → RoleGuard(403) → Validate params(400) → Controller → Service paranoid destroy (isDeleted=true)
 *     tags: [Clinics]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer, minimum: 1 } }]
 *     responses:
 *       200: { description: Clinic deleted (logical) }
 *       400: { description: Invalid id }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 *       404: { description: Clinic not found }
 */
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  validate(clinicIdParamSchema, 'params'),
  deleteClinic,
);

export default router;
