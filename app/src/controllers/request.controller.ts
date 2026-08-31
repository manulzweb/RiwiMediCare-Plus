// src/controllers/request.controller.ts
import { Request, Response } from 'express';
import { requestService } from '../services/request.service.js';
import { handleHttpError } from '../utils/http-error.util.js';

export const createRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    // req.user es inyectado por authMiddleware; id proviene del JWT.
    const userId = (req.user as unknown as { id: number }).id;
    const data = await requestService.create({ ...req.body, createdById: userId });
    res.status(201).json({ success: true, message: 'Request created', data });
  } catch (error) {
    handleHttpError(res, error);
  }
};

export const getRequests = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await requestService.findAll();
    res.status(200).json({ success: true, data });
  } catch (error) {
    handleHttpError(res, error);
  }
};

export const getActiveRequests = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await requestService.findActive();
    res.status(200).json({ success: true, data });
  } catch (error) {
    handleHttpError(res, error);
  }
};

export const getRequestsByClinic = async (req: Request, res: Response): Promise<void> => {
  try {
    // Zod Validation Middleware ya garantizó que req.params.clinicId es un number.
    const data = await requestService.findByClinic(req.params.clinicId as unknown as number);
    res.status(200).json({ success: true, data });
  } catch (error) {
    handleHttpError(res, error);
  }
};

export const getRequestById = async (req: Request, res: Response): Promise<void> => {
  try {
    // Zod Validation Middleware ya garantizó que req.params.id es un number.
    const data = await requestService.findById(req.params.id as unknown as number);
    res.status(200).json({ success: true, data });
  } catch (error) {
    handleHttpError(res, error);
  }
};

export const updateRequestStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    // Zod Validation Middleware ya garantizó que req.params.id es un number.
    const data = await requestService.updateStatus(req.params.id as unknown as number, req.body);
    res.status(200).json({ success: true, message: 'Status updated', data });
  } catch (error) {
    handleHttpError(res, error);
  }
};

export const deleteRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    // Zod Validation Middleware ya garantizó que req.params.id es un number.
    await requestService.delete(req.params.id as unknown as number);
    res.status(200).json({ success: true, message: 'Request deleted ' });
  } catch (error) {
    handleHttpError(res, error);
  }
};
