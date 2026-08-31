import { clinicService } from '../services/clinic.service.js';
import clinicRepository from '../repositories/clinic.repository.js';
import { ValidationError, NotFoundError } from '../errors/domain-errors.js';

jest.mock('../repositories/clinic.repository.js', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByNit: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedRepo = clinicRepository as jest.Mocked<typeof clinicRepository>;

describe('ClinicService', () => {
  beforeEach(() => jest.clearAllMocks());

  const validDto = {
    name: 'Clínica Central',
    nit: '900123456-10',
    address: 'Calle 10 # 20-30',
    phone: '+57 3001234567',
    responsibleName: 'Ana García',
    responsibleEmail: 'ana@clinic.com',
  };

  describe('create', () => {
    it('crea clínica válida', async () => {
      mockedRepo.create.mockResolvedValue({ id: 1, ...validDto } as never);
      const result = await clinicService.create(validDto);
      expect(mockedRepo.create).toHaveBeenCalledWith(validDto);
      expect(result).toBeDefined();
    });

    it('lanza ValidationError si falta name', async () => {
      await expect(clinicService.create({ ...validDto, name: '' } as never)).rejects.toBeInstanceOf(
        ValidationError,
      );
    });

    it('lanza ValidationError si falta nit', async () => {
      await expect(clinicService.create({ ...validDto, nit: '  ' } as never)).rejects.toBeInstanceOf(
        ValidationError,
      );
    });
  });

  describe('findAll', () => {
    it('retorna lista de clínicas', async () => {
      mockedRepo.findAll.mockResolvedValue([{ id: 1 } as never]);
      const result = await clinicService.findAll();
      expect(result).toHaveLength(1);
    });
  });

  describe('findById', () => {
    it('retorna clínica por id', async () => {
      mockedRepo.findById.mockResolvedValue({ id: 1, name: 'C' } as never);
      const result = await clinicService.findById(1);
      expect(result.id).toBe(1);
    });

    it('lanza NotFoundError si no existe', async () => {
      mockedRepo.findById.mockResolvedValue(null as never);
      await expect(clinicService.findById(99)).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe('update', () => {
    it('actualiza clínica existente', async () => {
      mockedRepo.findById.mockResolvedValue({ id: 1 } as never);
      mockedRepo.update.mockResolvedValue({ id: 1, name: 'Actualizada' } as never);
      const result = await clinicService.update(1, { name: 'Actualizada' });
      expect(result.name).toBe('Actualizada');
    });

    it('lanza NotFoundError si clínica no existe', async () => {
      mockedRepo.findById.mockResolvedValue(null as never);
      await expect(clinicService.update(99, { name: 'X' })).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe('delete', () => {
    it('elimina lógicamente', async () => {
      mockedRepo.findById.mockResolvedValue({ id: 1 } as never);
      mockedRepo.delete.mockResolvedValue(undefined as never);
      await expect(clinicService.delete(1)).resolves.toBeUndefined();
      expect(mockedRepo.delete).toHaveBeenCalledWith(1);
    });

    it('lanza NotFoundError si no existe', async () => {
      mockedRepo.findById.mockResolvedValue(null as never);
      await expect(clinicService.delete(99)).rejects.toBeInstanceOf(NotFoundError);
    });
  });
});
