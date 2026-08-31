// app/src/middleware/checknit.middleware.ts
import { Request, Response, NextFunction } from 'express';
import clinicRepository from '../repositories/clinic.repository.js';

/**
 * Chain middleware: verifica duplicado de NIT antes del controller.
 * Se ejecuta DESPUÉS de Zod, por lo que asume que req.body.nit ya está limpio.
 */
export const checkDuplicateNitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const nit = req.body?.nit;

    if (!nit) {
      next();
      return;
    }

    const excludeId = req.params?.id ? Number(req.params.id) : undefined;

    const existing = await clinicRepository.findByNit(nit);

    if (existing && existing.id !== excludeId) {
      res.status(409).json({ success: false, message: 'Clinic with this NIT already exists' });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default checkDuplicateNitMiddleware;
