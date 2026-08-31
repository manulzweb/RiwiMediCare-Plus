import Medicine from '../models/medicine.model.js';
import medicineRepository from '../repositories/medicine.repository.js';
import warehouseRepository from '../repositories/warehouse.repository.js';
import { CreateMedicineParams, UpdateMedicineParams } from '../interfaces/medicine.interface.js';
import { IMedicineService } from './interfaces/medicine.service.interface.js';
import { ValidationError, NotFoundError } from '../errors/domain-errors.js';

class MedicineService implements IMedicineService {
  private validateDto(dto: CreateMedicineParams): void {
    if (!dto.name?.trim()) throw new ValidationError('Name is required');
    if (!dto.code?.trim()) throw new ValidationError('Code is required');
    if (dto.stock === undefined || dto.stock < 0) throw new ValidationError('Stock must be >= 0');
    if (dto.unitPrice === undefined || dto.unitPrice < 0) throw new ValidationError('Unit price must be >= 0');
    if (!dto.warehouseId) throw new ValidationError('warehouseId is required');
  }

  private async ensureWarehouseExists(warehouseId: number): Promise<void> {
    const wh = await warehouseRepository.findById(warehouseId);
    if (!wh) throw new NotFoundError('Warehouse not found');
  }

  async create(dto: CreateMedicineParams): Promise<Medicine> {
    this.validateDto(dto);
    await this.ensureWarehouseExists(dto.warehouseId);
    return medicineRepository.create(dto);
  }

  async findAll(): Promise<Medicine[]> {
    return medicineRepository.findAll();
  }

  async findById(id: number): Promise<Medicine> {
    const med = await medicineRepository.findById(id);
    if (!med) throw new NotFoundError('Medicine not found');
    return med;
  }

  async update(id: number, dto: UpdateMedicineParams): Promise<Medicine> {
    await this.findById(id);
    if (dto.warehouseId) await this.ensureWarehouseExists(dto.warehouseId);
    const updated = await medicineRepository.update(id, dto);
    return updated!;
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    await medicineRepository.delete(id);
  }
}

export default new MedicineService();
