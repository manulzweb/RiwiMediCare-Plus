import { Request, Response } from 'express';
import clinicService from '../services/clinic.service.js';

const handleError = (res: Response, error: unknown) => {
  const status = (error as { statusCode?: number }).statusCode || 500;
  const message = error instanceof Error ? error.message : 'Internal server error';
  if (status === 500) console.error(error);
  return res.status(status).json({ success: status < 400, message });
};

export const createClinic = async (req: Request, res: Response): Promise<void> => {
  try {
    const clinic = await clinicService.create(req.body);
    res.status(201).json({ success: true, message: 'Clinic created', data: clinic });
  } catch (e) {
    handleError(res, e);
  }
};

export const getClinics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await clinicService.findAll();
    res.json({ success: true, data });
  } catch (e) {
    handleError(res, e);
  }
};

export const getClinicById = async (req: Request, res: Response): Promise<void> => {
  try {
    // CoR: Zod eslabón ya validó/coercionó params.id a number (400 si inválido)
    const { id } = req.params as unknown as { id: number };
    const data = await clinicService.findById(id);
    res.json({ success: true, data });
  } catch (e) {
    handleError(res, e);
  }
};

export const updateClinic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as unknown as { id: number };
    const data = await clinicService.update(id, req.body);
    res.json({ success: true, message: 'Clinic updated', data });
  } catch (e) {
    handleError(res, e);
  }
};

export const deleteClinic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as unknown as { id: number };
    await clinicService.delete(id);
    res.json({ success: true, message: 'Clinic deleted (logical)' });
  } catch (e) {
    handleError(res, e);
  }
};
