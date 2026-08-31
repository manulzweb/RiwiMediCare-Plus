import { Request, Response, NextFunction } from 'express';
import { RequestStatus } from '../constants/request-status.enum.js';

const ALLOWED_STATUSES = Object.values(RequestStatus) as string[];

/**
 * Chain middleware: impide actualizar a estado no permitido
 * - 400 si status no está presente o no es un string
 * - 400 si status no se encuentra dentro de los valores permitidos del enum
 */
export const checkStatusMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const rawStatus = (req.body as { status?: unknown })?.status;

  if (!rawStatus || typeof rawStatus !== 'string') {
    res.status(400).json({
      success: false,
      message: `Status is required. Allowed: ${ALLOWED_STATUSES.join(', ')}`,
    });
    return;
  }

  const status = rawStatus.trim().toUpperCase();
  if (!ALLOWED_STATUSES.includes(status)) {
    res.status(400).json({
      success: false,
      message: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`,
    });
    return;
  }

  // Normaliza a UPPER para DB enum (PENDING, APPROVED...)
  (req.body as { status: string }).status = status;
  next();
};

export default checkStatusMiddleware;
