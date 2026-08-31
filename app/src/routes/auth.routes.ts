// app/src/routes/auth.routes.ts
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, register } from '../controllers/auth.controller.js';
import { envConfig } from '../config/env.js';

const registerLimiter = rateLimit({
  windowMs: envConfig.REGISTER.WINDOW_MS,
  max: envConfig.REGISTER.MAX_REQUESTS,
  message: { error: envConfig.REGISTER.MESSAGE },
  skip: () => envConfig.NODE_ENV === 'test',
});

const router = Router();

/**
 * POST /api/auth/login
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user and generate JWT with { id, email, role }
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: "user@example.com" }
 *               password: { type: string, format: password, example: "Password123!" }
 *     responses:
 *       200:
 *         description: Authentication successful - Returns JWT with id, email, role
 *       400: { description: Invalid data }
 *       401: { description: Invalid credentials }
 */
router.post('/login', login);

/**
 * POST /api/auth/register - No JWT required
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register new user with role assignment (ADMIN | REQUEST_MANAGER)
 *     description: No JWT required. Validates required fields and email format. Allows role assignment via body.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, description: User full name, example: "Ana Garcia" }
 *               email: { type: string, format: email, example: "ana@riwimedicare.com" }
 *               password: { type: string, format: password, example: "Secure123!@" }
 *               confirmPassword: { type: string, example: "Secure123!@" }
 *               role: { type: string, enum: [ADMIN, REQUEST_MANAGER], description: User role, example: "ADMIN" }
 *               status: { type: string, enum: [activo, inactivo], example: "activo" }
 *     responses:
 *       201: { description: User registered successfully }
 *       400: { description: Validation failed }
 *       409: { description: Email already registered }
 */
router.post('/register', registerLimiter, register);

export default router;
