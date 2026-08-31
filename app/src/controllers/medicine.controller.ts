// src/controllers/medicine.controller.ts
import { Request, Response } from 'express';
import { medicineService } from '../services/medicine.service.js';
import { handleHttpError } from '../utils/http-error.util.js';

export const createMedicine = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await medicineService.create(req.body);
    res.status(201).json({ success: true, message: 'Medicine created', data });
  } catch (error) {
    handleHttpError(res, error);
  }
};

export const getMedicines = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await medicineService.findAll();
    res.status(200).json({ success: true, data });
  } catch (error) {
    handleHttpError(res, error);
  }
};

export const getMedicineById = async (req: Request, res: Response): Promise<void> => {
  try {
    // Zod Validation Middleware ya garantizó que req.params.id es un number.
    const data = await medicineService.findById(req.params.id as unknown as number);
    res.status(200).json({ success: true, data });
  } catch (error) {
    handleHttpError(res, error);
  }
};

export const updateMedicine = async (req: Request, res: Response): Promise<void> => {
  try {
    // Zod Validation Middleware ya garantizó que req.params.id es un number.
    const data = await medicineService.update(req.params.id as unknown as number, req.body);
    res.status(200).json({ success: true, message: 'Medicine updated', data });
  } catch (error) {
    handleHttpError(res, error);
  }
};

export const deleteMedicine = async (req: Request, res: Response): Promise<void> => {
  try {
    // Zod Validation Middleware ya garantizó que req.params.id es un number.
    await medicineService.delete(req.params.id as unknown as number);
    res.status(200).json({ success: true, message: 'Medicine deleted ' });
  } catch (error) {
    handleHttpError(res, error);
  }
};
