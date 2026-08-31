import { Request, Response, NextFunction } from 'express';
import medicineRepository from '../repositories/medicine.repository.js';

/**
 * Chain middleware: verifica duplicado de code en medicines (409)
 * Dedicado como checkDuplicateNitMiddleware — evita SequelizeUniqueConstraintError 500
 */
export const checkDuplicateMedicineCodeMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const code = (req.body as { code?: unknown })?.code;
    if (!code || typeof code !== 'string' || !code.trim()) {
      next();
      return;
    }

    const trimmedCode = code.trim();
    const excludeId = req.params?.id ? Number(req.params.id) : undefined;

    const existing = await medicineRepository.findByCode(trimmedCode);
    if (existing && existing.id !== excludeId) {
      res.status(409).json({ success: false, message: 'Medicine with this code already exists' });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default checkDuplicateMedicineCodeMiddleware;
