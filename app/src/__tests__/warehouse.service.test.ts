import { warehouseService } from '../services/warehouse.service.js';
import warehouseRepository from '../repositories/warehouse.repository.js';
import { ValidationError, NotFoundError } from '../errors/domain-errors.js';

jest.mock('../repositories/warehouse.repository.js', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedRepo = warehouseRepository as jest.Mocked<typeof warehouseRepository>;

describe('WarehouseService', () => {
  beforeEach(() => jest.clearAllMocks());

  const validDto = { name: 'Bodega Central', code: 'BOG-001', location: 'Bogotá' };

  it('crea warehouse válido', async () => {
    mockedRepo.create.mockResolvedValue({ id: 1, ...validDto } as never);
    const result = await warehouseService.create(validDto);
    expect(result).toBeDefined();
  });

  it('lanza ValidationError si falta name', async () => {
    await expect(warehouseService.create({ ...validDto, name: '' } as never)).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it('findById lanza NotFound si no existe', async () => {
    mockedRepo.findById.mockResolvedValue(null as never);
    await expect(warehouseService.findById(99)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('update lanza NotFound si no existe', async () => {
    mockedRepo.findById.mockResolvedValue(null as never);
    await expect(warehouseService.update(99, { name: 'X' })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('delete lanza NotFound si no existe', async () => {
    mockedRepo.findById.mockResolvedValue(null as never);
    await expect(warehouseService.delete(99)).rejects.toBeInstanceOf(NotFoundError);
  });
});
