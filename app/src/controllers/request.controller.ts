import { Request, Response } from 'express';
import requestService from '../services/request.service.js';

const handleError = (res: Response, error: unknown) => {
  const status = (error as { statusCode?: number }).statusCode || 500;
  const message = error instanceof Error ? error.message : 'Internal server error';
  if (status === 500) console.error(error);
  return res.status(status).json({ success: status < 400, message });
};

export const createRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as unknown as { id?: number })?.id ?? null;
    const data = await requestService.create({ ...req.body, createdById: userId });
    res.status(201).json({ success: true, message: 'Request created', data });
  } catch (e) { handleError(res, e); }
};

export const getRequests = async (_req: Request, res: Response): Promise<void> => {
  try { const data = await requestService.findAll(); res.json({ success: true, data }); } catch (e) { handleError(res, e); }
};

export const getActiveRequests = async (_req: Request, res: Response): Promise<void> => {
  try { const data = await requestService.findActive(); res.json({ success: true, data }); } catch (e) { handleError(res, e); }
};

export const getRequestsByClinic = async (req: Request, res: Response): Promise<void> => {
  try {
    const clinicId = Number(req.params.clinicId);
    if (Number.isNaN(clinicId)) { res.status(400).json({ success: false, message: 'Invalid clinicId' }); return; }
    const data = await requestService.findByClinic(clinicId);
    res.json({ success: true, data });
  } catch (e) { handleError(res, e); }
};

export const getRequestById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ success: false, message: 'Invalid id' }); return; }
    const data = await requestService.findById(id);
    res.json({ success: true, data });
  } catch (e) { handleError(res, e); }
};

export const updateRequestStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ success: false, message: 'Invalid id' }); return; }
    const data = await requestService.updateStatus(id, req.body);
    res.json({ success: true, message: 'Status updated', data });
  } catch (e) { handleError(res, e); }
};

export const deleteRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ success: false, message: 'Invalid id' }); return; }
    await requestService.delete(id);
    res.json({ success: true, message: 'Request deleted (logical)' });
  } catch (e) { handleError(res, e); }
};
