import { Request, Response, NextFunction } from 'express';
import Medicine from '../models/medicine.model.js';

/**
 * Chain middleware: impide registrar solicitudes cuando el almacén no tiene inventario
 * - 409 si el medicamento no pertenece al almacén asignado
 * - 409 si el stock disponible es menor a la cantidad solicitada
 * Asume que validate(createRequestSchema) ya garantizó tipos, pero hace guard extra para cast seguro.
 */
export const checkInventoryMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { medicineId, warehouseId, quantity } = req.body as {
      medicineId?: unknown;
      warehouseId?: unknown;
      quantity?: unknown;
    };

    // Si faltan campos, deja que validate/Zod responda 400 — no duplicar error
    if (medicineId === undefined || warehouseId === undefined || quantity === undefined) {
      next();
      return;
    }

    const mId = Number(medicineId);
    const wId = Number(warehouseId);
    const qty = Number(quantity);

    if (!Number.isFinite(mId) || !Number.isFinite(wId) || !Number.isFinite(qty)) {
      next();
      return;
    }

    const medicine = await Medicine.findByPk(mId);
    if (!medicine) {
      // No existe -> deja que service responda 404, middleware solo cubre inventario
      next();
      return;
    }

    if (medicine.warehouseId !== wId) {
      res
        .status(409)
        .json({ success: false, message: 'Medicine is not available in the assigned warehouse' });
      return;
    }

    if (medicine.stock < qty) {
      res.status(409).json({ success: false, message: 'Insufficient inventory in warehouse' });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default checkInventoryMiddleware;
