import { medicineService } from '../services/medicine.service.js';
import medicineRepository from '../repositories/medicine.repository.js';
import warehouseRepository from '../repositories/warehouse.repository.js';
import { ValidationError, NotFoundError } from '../errors/domain-errors.js';

jest.mock('../repositories/medicine.repository.js', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByCode: jest.fn(),
  },
}));
jest.mock('../repositories/warehouse.repository.js', () => ({
  __esModule: true,
  default: { findById: jest.fn() },
}));

const mockedMedRepo = medicineRepository as jest.Mocked<typeof medicineRepository>;
const mockedWhRepo = warehouseRepository as jest.Mocked<typeof warehouseRepository>;

describe('MedicineService', () => {
  beforeEach(() => jest.clearAllMocks());

  const validDto = { name: 'Paracetamol', code: 'MED-001', stock: 10, unitPrice: 100, warehouseId: 1 };

  it('crea medicina si warehouse existe', async () => {
    mockedWhRepo.findById.mockResolvedValue({ id: 1 } as never);
    mockedMedRepo.create.mockResolvedValue({ id: 1, ...validDto } as never);
    const result = await medicineService.create(validDto);
    expect(result).toBeDefined();
  });

  it('lanza ValidationError si falta code', async () => {
    await expect(medicineService.create({ ...validDto, code: '' } as never)).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it('lanza NotFoundError si warehouse no existe', async () => {
    mockedWhRepo.findById.mockResolvedValue(null as never);
    await expect(medicineService.create(validDto)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('findById lanza NotFound si no existe', async () => {
    mockedMedRepo.findById.mockResolvedValue(null as never);
    await expect(medicineService.findById(99)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('update lanza NotFound si no existe', async () => {
    mockedMedRepo.findById.mockResolvedValue(null as never);
    await expect(medicineService.update(99, { name: 'X' } as never)).rejects.toBeInstanceOf(NotFoundError);
  });
});
