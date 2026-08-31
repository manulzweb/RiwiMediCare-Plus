// app/src/routes/seed.routes.ts
import { Router } from 'express';
import { UserRole } from '../constants/roles.enum.js';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import seedService from '../services/seed.service.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) cb(null, true);
    else cb(new Error('Only .json files allowed'));
  },
});

/**
 * @swagger
 * /api/v1/seed/upload:
 *   post:
 *     summary: Seed database from JSON file (ADMIN only)
 *     tags: [Seed]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema: { type: object, properties: { file: { type: string, format: binary } } }
 *     responses:
 *       200: { description: Seeded successfully }
 *       400: { description: Invalid file }
 */
router.post('/upload', authMiddleware, roleMiddleware(UserRole.ADMIN), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) { res.status(400).json({ success: false, message: 'File is required (field name: file)' }); return; }
    const result = await seedService.seedFromBuffer(req.file.buffer);
    res.json({ success: true, message: 'Seed completed', data: result });
  } catch (e) {
    const err = e as { statusCode?: number; message?: string };
    const status = err.statusCode || 400;
    res.status(status).json({ success: false, message: err.message || 'Seed failed' });
  }
});

export default router;
