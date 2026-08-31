import { requestService } from '../services/request.service.js';
import requestRepository from '../repositories/request.repository.js';
import clinicRepository from '../repositories/clinic.repository.js';
import medicineRepository from '../repositories/medicine.repository.js';
import warehouseRepository from '../repositories/warehouse.repository.js';
import { NotFoundError } from '../errors/domain-errors.js';
import { RequestStatus } from '../constants/request-status.enum.js';

jest.mock('../repositories/request.repository.js', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findAll: jest.fn(),
    findActive: jest.fn(),
    findByClinic: jest.fn(),
    findById: jest.fn(),
    updateStatus: jest.fn(),
    delete: jest.fn(),
  },
}));
jest.mock('../repositories/clinic.repository.js', () => ({
  __esModule: true,
  default: { findById: jest.fn() },
}));
jest.mock('../repositories/medicine.repository.js', () => ({
  __esModule: true,
  default: { findById: jest.fn() },
}));
jest.mock('../repositories/warehouse.repository.js', () => ({
  __esModule: true,
  default: { findById: jest.fn() },
}));

const mockedRequestRepo = requestRepository as jest.Mocked<typeof requestRepository>;
const mockedClinicRepo = clinicRepository as jest.Mocked<typeof clinicRepository>;
const mockedMedicineRepo = medicineRepository as jest.Mocked<typeof medicineRepository>;
const mockedWarehouseRepo = warehouseRepository as jest.Mocked<typeof warehouseRepository>;

describe('RequestService', () => {
  beforeEach(() => jest.clearAllMocks());

  const baseDto = {
    clinicId: 1,
    medicineId: 1,
    warehouseId: 1,
    quantity: 5,
    createdById: 1,
  };

  describe('create', () => {
    it('crea solicitud cuando clínica, medicina y almacén existen', async () => {
      mockedClinicRepo.findById.mockResolvedValue({ id: 1 } as never);
      mockedMedicineRepo.findById.mockResolvedValue({ id: 1 } as never);
      mockedWarehouseRepo.findById.mockResolvedValue({ id: 1 } as never);
      mockedRequestRepo.create.mockResolvedValue({
        id: 1,
        ...baseDto,
        status: RequestStatus.PENDING,
      } as never);

      const result = await requestService.create(baseDto);
      expect(result.status).toBe(RequestStatus.PENDING);
      expect(mockedRequestRepo.create).toHaveBeenCalled();
    });

    it('lanza NotFoundError si clínica no existe', async () => {
      mockedClinicRepo.findById.mockResolvedValue(null as never);
      await expect(requestService.create(baseDto)).rejects.toBeInstanceOf(NotFoundError);
    });

    it('lanza NotFoundError si medicina no existe', async () => {
      mockedClinicRepo.findById.mockResolvedValue({ id: 1 } as never);
      mockedMedicineRepo.findById.mockResolvedValue(null as never);
      await expect(requestService.create(baseDto)).rejects.toBeInstanceOf(NotFoundError);
    });

    it('lanza NotFoundError si almacén no existe', async () => {
      mockedClinicRepo.findById.mockResolvedValue({ id: 1 } as never);
      mockedMedicineRepo.findById.mockResolvedValue({ id: 1 } as never);
      mockedWarehouseRepo.findById.mockResolvedValue(null as never);
      await expect(requestService.create(baseDto)).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe('findById', () => {
    it('retorna solicitud por id', async () => {
      mockedRequestRepo.findById.mockResolvedValue({ id: 1 } as never);
      const result = await requestService.findById(1);
      expect(result.id).toBe(1);
    });

    it('lanza NotFoundError si no existe', async () => {
      mockedRequestRepo.findById.mockResolvedValue(null as never);
      await expect(requestService.findById(99)).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe('findByClinic', () => {
    it('retorna solicitudes por clínica', async () => {
      mockedClinicRepo.findById.mockResolvedValue({ id: 1 } as never);
      mockedRequestRepo.findByClinic.mockResolvedValue([{ id: 1 } as never]);
      const result = await requestService.findByClinic(1);
      expect(result).toHaveLength(1);
    });

    it('lanza NotFoundError si clínica no existe', async () => {
      mockedClinicRepo.findById.mockResolvedValue(null as never);
      await expect(requestService.findByClinic(99)).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe('updateStatus', () => {
    it('actualiza estado válido', async () => {
      mockedRequestRepo.updateStatus.mockResolvedValue({ id: 1, status: RequestStatus.APPROVED } as never);
      const result = await requestService.updateStatus(1, { status: RequestStatus.APPROVED });
      expect(result.status).toBe(RequestStatus.APPROVED);
    });

    it('lanza NotFoundError si solicitud no existe', async () => {
      mockedRequestRepo.updateStatus.mockResolvedValue(null as never);
      await expect(requestService.updateStatus(99, { status: RequestStatus.APPROVED })).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });
  });

  describe('findAll / findActive / delete', () => {
    it('findAll retorna todas', async () => {
      mockedRequestRepo.findAll.mockResolvedValue([{ id: 1 } as never]);
      expect(await requestService.findAll()).toHaveLength(1);
    });

    it('findActive retorna activas', async () => {
      mockedRequestRepo.findActive.mockResolvedValue([{ id: 1 } as never]);
      expect(await requestService.findActive()).toHaveLength(1);
    });

    it('delete elimina lógicamente', async () => {
      mockedRequestRepo.findById.mockResolvedValue({ id: 1 } as never);
      mockedRequestRepo.delete.mockResolvedValue(undefined as never);
      await expect(requestService.delete(1)).resolves.toBeUndefined();
    });
  });
});
