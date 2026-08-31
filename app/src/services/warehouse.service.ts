import Warehouse from '../models/warehouse.model.js';
import warehouseRepository from '../repositories/warehouse.repository.js';
import { CreateWarehouseParams, UpdateWarehouseParams } from '../interfaces/warehouse.interface.js';
import { IWarehouseService } from './interfaces/warehouse.service.interface.js';
import { ValidationError, NotFoundError } from '../errors/domain-errors.js';

class WarehouseService implements IWarehouseService {
  private validateDto(dto: CreateWarehouseParams): void {
    if (!dto.name?.trim()) throw new ValidationError('Name is required');
    if (!dto.code?.trim()) throw new ValidationError('Code is required');
    if (!dto.location?.trim()) throw new ValidationError('Location is required');
  }

  async create(dto: CreateWarehouseParams): Promise<Warehouse> {
    this.validateDto(dto);
    return warehouseRepository.create(dto);
  }

  async findAll(): Promise<Warehouse[]> {
    return warehouseRepository.findAll();
  }

  async findById(id: number): Promise<Warehouse> {
    const wh = await warehouseRepository.findById(id);
    if (!wh) throw new NotFoundError('Warehouse not found');
    return wh;
  }

  async update(id: number, dto: UpdateWarehouseParams): Promise<Warehouse> {
    await this.findById(id);
    const updated = await warehouseRepository.update(id, dto);
    return updated!;
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    await warehouseRepository.delete(id);
  }
}

const warehouseService = new WarehouseService();
export { warehouseService };
export default warehouseService;
