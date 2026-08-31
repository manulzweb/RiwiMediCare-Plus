import { Request, Response } from 'express';
import warehouseService from '../services/warehouse.service.js';

const handleError = (res: Response, error: unknown) => {
  const status = (error as { statusCode?: number }).statusCode || 500;
  const message = error instanceof Error ? error.message : 'Internal server error';
  if (status === 500) console.error(error);
  return res.status(status).json({ success: status < 400, message });
};

export const createWarehouse = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await warehouseService.create(req.body);
    res.status(201).json({ success: true, message: 'Warehouse created', data });
  } catch (e) { handleError(res, e); }
};

export const getWarehouses = async (_req: Request, res: Response): Promise<void> => {
  try { const data = await warehouseService.findAll(); res.json({ success: true, data }); } catch (e) { handleError(res, e); }
};

export const getWarehouseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ success: false, message: 'Invalid id' }); return; }
    const data = await warehouseService.findById(id);
    res.json({ success: true, data });
  } catch (e) { handleError(res, e); }
};

export const updateWarehouse = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ success: false, message: 'Invalid id' }); return; }
    const data = await warehouseService.update(id, req.body);
    res.json({ success: true, message: 'Warehouse updated', data });
  } catch (e) { handleError(res, e); }
};

export const deleteWarehouse = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ success: false, message: 'Invalid id' }); return; }
    await warehouseService.delete(id);
    res.json({ success: true, message: 'Warehouse deleted (logical)' });
  } catch (e) { handleError(res, e); }
};
