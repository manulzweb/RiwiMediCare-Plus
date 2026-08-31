// src/controllers/clinic.controller.ts
import { Request, Response } from 'express';
import { clinicService } from '../services/clinic.service.js';
import { handleHttpError } from '../utils/http-error.util.js';

export const createClinic = async (req: Request, res: Response): Promise<void> => {
  try {
    const clinic = await clinicService.create(req.body);
    res.status(201).json({ success: true, message: 'Clinic created', data: clinic });
  } catch (error) {
    handleHttpError(res, error);
  }
};

export const getClinics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await clinicService.findAll();
    res.status(200).json({ success: true, data });
  } catch (error) {
    handleHttpError(res, error);
  }
};

export const getClinicById = async (req: Request, res: Response): Promise<void> => {
  try {
    // Zod Validation Middleware ya garantizó que req.params.id es un number.
    const clinic = await clinicService.findById(req.params.id as unknown as number);
    res.status(200).json({ success: true, data: clinic });
  } catch (error) {
    handleHttpError(res, error);
  }
};

export const updateClinic = async (req: Request, res: Response): Promise<void> => {
  try {
    // Zod Validation Middleware ya garantizó que req.params.id es un number.
    const clinic = await clinicService.update(req.params.id as unknown as number, req.body);
    res.status(200).json({ success: true, message: 'Clinic updated', data: clinic });
  } catch (error) {
    handleHttpError(res, error);
  }
};

export const deleteClinic = async (req: Request, res: Response): Promise<void> => {
  try {
    // Zod Validation Middleware ya garantizó que req.params.id es un number.
    await clinicService.delete(req.params.id as unknown as number);
    res.status(200).json({ success: true, message: 'Clinic deleted ' });
  } catch (error) {
    handleHttpError(res, error);
  }
};
