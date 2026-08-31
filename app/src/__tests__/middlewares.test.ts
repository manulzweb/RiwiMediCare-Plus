import { checkDuplicateNitMiddleware } from '../middleware/checkNit.middleware.js';
import { checkQuantityMiddleware } from '../middleware/checkQuantity.middleware.js';
import { checkStatusMiddleware } from '../middleware/checkStatus.middleware.js';
import clinicRepository from '../repositories/clinic.repository.js';
import { RequestStatus } from '../constants/request-status.enum.js';

jest.mock('../repositories/clinic.repository.js', () => ({
  __esModule: true,
  default: { findByNit: jest.fn() },
}));
jest.mock('../models/medicine.model.js', () => ({
  __esModule: true,
  default: { findByPk: jest.fn() },
}));

import { checkInventoryMiddleware } from '../middleware/checkInventory.middleware.js';
import Medicine from '../models/medicine.model.js';

const mockedClinicRepo = clinicRepository as jest.Mocked<typeof clinicRepository>;
const mockedMedicineModel = Medicine as unknown as { findByPk: jest.Mock<number> };

const mockRes = () => {
  const res: Record<string, jest.Mock> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as unknown as { status: jest.Mock; json: jest.Mock };
};

describe('Middlewares de Validación', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('checkDuplicateNitMiddleware', () => {
    it('avanza si no hay nit en body', async () => {
      const req = { body: {}, params: {} } as never;
      const res = mockRes() as never;
      const next = jest.fn();
      await checkDuplicateNitMiddleware(req, res, next);
      expect(next).toHaveBeenCalled();
      expect((res as unknown as { status: jest.Mock }).status).not.toHaveBeenCalled();
    });

    it('avanza si NIT no existe en DB', async () => {
      mockedClinicRepo.findByNit.mockResolvedValue(null as never);
      const req = { body: { nit: '900123456-99' }, params: {} } as never;
      const res = mockRes() as never;
      const next = jest.fn();
      await checkDuplicateNitMiddleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('responde 409 si NIT duplicado en otra clínica', async () => {
      mockedClinicRepo.findByNit.mockResolvedValue({ id: 1 } as never);
      const req = { body: { nit: '900123456-1' }, params: { id: '2' } } as never;
      const res = mockRes() as never;
      const next = jest.fn();
      await checkDuplicateNitMiddleware(req, res, next);
      expect((res as unknown as { status: jest.Mock }).status).toHaveBeenCalledWith(409);
      expect(next).not.toHaveBeenCalled();
    });

    it('avanza si NIT duplicado pero es la misma clínica (PUT self)', async () => {
      mockedClinicRepo.findByNit.mockResolvedValue({ id: 3 } as never);
      const req = { body: { nit: '900123456-1' }, params: { id: '3' } } as never;
      const res = mockRes() as never;
      const next = jest.fn();
      await checkDuplicateNitMiddleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('checkQuantityMiddleware', () => {
    it('responde 400 si quantity es 0', () => {
      const req = { body: { quantity: 0 } } as never;
      const res = mockRes() as never;
      const next = jest.fn();
      checkQuantityMiddleware(req as never, res as never, next);
      expect((res as unknown as { status: jest.Mock }).status).toHaveBeenCalledWith(400);
    });

    it('responde 400 si quantity es negativa', () => {
      const req = { body: { quantity: -5 } } as never;
      const res = mockRes() as never;
      const next = jest.fn();
      checkQuantityMiddleware(req as never, res as never, next);
      expect((res as unknown as { status: jest.Mock }).status).toHaveBeenCalledWith(400);
    });

    it('avanza si quantity válida', () => {
      const req = { body: { quantity: 5 } } as never;
      const res = mockRes() as never;
      const next = jest.fn();
      checkQuantityMiddleware(req as never, res as never, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('checkStatusMiddleware', () => {
    it('responde 400 si status inválido', () => {
      const req = { body: { status: 'INVALID' } } as never;
      const res = mockRes() as never;
      const next = jest.fn();
      checkStatusMiddleware(req as never, res as never, next);
      expect((res as unknown as { status: jest.Mock }).status).toHaveBeenCalledWith(400);
    });

    it('avanza si status válido', () => {
      const req = { body: { status: RequestStatus.APPROVED } } as never;
      const res = mockRes() as never;
      const next = jest.fn();
      checkStatusMiddleware(req as never, res as never, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('checkInventoryMiddleware', () => {
    it('avanza si faltan campos (deja a Zod 400)', async () => {
      const req = { body: {} } as never;
      const res = mockRes() as never;
      const next = jest.fn();
      await checkInventoryMiddleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('responde 409 si stock insuficiente', async () => {
      (mockedMedicineModel.findByPk as jest.Mock).mockResolvedValue({ warehouseId: 1, stock: 5 } as never);
      const req = { body: { medicineId: 1, warehouseId: 1, quantity: 99 } } as never;
      const res = mockRes() as never;
      const next = jest.fn();
      await checkInventoryMiddleware(req, res, next);
      expect((res as unknown as { status: jest.Mock }).status).toHaveBeenCalledWith(409);
    });

    it('responde 409 si medicine no pertenece al warehouse', async () => {
      (mockedMedicineModel.findByPk as jest.Mock).mockResolvedValue({ warehouseId: 2, stock: 100 } as never);
      const req = { body: { medicineId: 1, warehouseId: 1, quantity: 5 } } as never;
      const res = mockRes() as never;
      const next = jest.fn();
      await checkInventoryMiddleware(req, res, next);
      expect((res as unknown as { status: jest.Mock }).status).toHaveBeenCalledWith(409);
    });

    it('avanza si inventario suficiente y warehouse coincide', async () => {
      (mockedMedicineModel.findByPk as jest.Mock).mockResolvedValue({ warehouseId: 1, stock: 10 } as never);
      const req = { body: { medicineId: 1, warehouseId: 1, quantity: 5 } } as never;
      const res = mockRes() as never;
      const next = jest.fn();
      await checkInventoryMiddleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
