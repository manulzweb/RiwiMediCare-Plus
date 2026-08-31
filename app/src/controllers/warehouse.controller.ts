// src/controllers/warehouse.controller.ts
import { Request, Response } from 'express';
import { warehouseService } from '../services/warehouse.service.js';
import { handleHttpError } from '../utils/http-error.util.js';

export const createWarehouse = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await warehouseService.create(req.body);
    res.status(201).json({ success: true, message: 'Warehouse created', data });
  } catch (error) {
    handleHttpError(res, error);
  }
};

export const getWarehouses = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await warehouseService.findAll();
    res.status(200).json({ success: true, data });
  } catch (error) {
    handleHttpError(res, error);
  }
};

export const getWarehouseById = async (req: Request, res: Response): Promise<void> => {
  try {
    // Zod Validation Middleware ya garantizó que req.params.id es un number.
    const data = await warehouseService.findById(req.params.id as unknown as number);
    res.status(200).json({ success: true, data });
  } catch (error) {
    handleHttpError(res, error);
  }
};

export const updateWarehouse = async (req: Request, res: Response): Promise<void> => {
  try {
    // Zod Validation Middleware ya garantizó que req.params.id es un number.
    const data = await warehouseService.update(req.params.id as unknown as number, req.body);
    res.status(200).json({ success: true, message: 'Warehouse updated', data });
  } catch (error) {
    handleHttpError(res, error);
  }
};

export const deleteWarehouse = async (req: Request, res: Response): Promise<void> => {
  try {
    // Zod Validation Middleware ya garantizó que req.params.id es un number.
    await warehouseService.delete(req.params.id as unknown as number);
    res.status(200).json({ success: true, message: 'Warehouse deleted ' });
  } catch (error) {
    handleHttpError(res, error);
  }
};
