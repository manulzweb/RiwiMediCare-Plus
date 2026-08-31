import { Request, Response, NextFunction } from 'express';

/**
 * Chain middleware: impide registrar cantidades <=0
 * - 400 si quantity es null/undefined
 * - 400 si quantity no es un número válido o es <= 0
 */
export const checkQuantityMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const quantity = (req.body as { quantity?: unknown })?.quantity;

  if (quantity === undefined || quantity === null) {
    res.status(400).json({ success: false, message: 'Quantity is required' });
    return;
  }

  const num = Number(quantity);
  if (!Number.isFinite(num) || num <= 0) {
    res.status(400).json({ success: false, message: 'Quantity must be greater than 0' });
    return;
  }

  next();
};

export default checkQuantityMiddleware;
