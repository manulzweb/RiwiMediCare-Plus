import { Request, Response } from 'express';
import medicineService from '../services/medicine.service.js';

const handleError = (res: Response, error: unknown) => {
  const status = (error as { statusCode?: number }).statusCode || 500;
  const message = error instanceof Error ? error.message : 'Internal server error';
  if (status === 500) console.error(error);
  return res.status(status).json({ success: status < 400, message });
};

export const createMedicine = async (req: Request, res: Response): Promise<void> => {
  try { const data = await medicineService.create(req.body); res.status(201).json({ success: true, message: 'Medicine created', data }); } catch (e) { handleError(res, e); }
};

export const getMedicines = async (_req: Request, res: Response): Promise<void> => {
  try { const data = await medicineService.findAll(); res.json({ success: true, data }); } catch (e) { handleError(res, e); }
};

export const getMedicineById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ success: false, message: 'Invalid id' }); return; }
    const data = await medicineService.findById(id);
    res.json({ success: true, data });
  } catch (e) { handleError(res, e); }
};

export const updateMedicine = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ success: false, message: 'Invalid id' }); return; }
    const data = await medicineService.update(id, req.body);
    res.json({ success: true, message: 'Medicine updated', data });
  } catch (e) { handleError(res, e); }
};

export const deleteMedicine = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ success: false, message: 'Invalid id' }); return; }
    await medicineService.delete(id);
    res.json({ success: true, message: 'Medicine deleted (logical)' });
  } catch (e) { handleError(res, e); }
};
