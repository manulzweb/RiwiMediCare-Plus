import Warehouse from '../models/warehouse.model.js';
import { IWarehouseRepository } from './interfaces/warehouse.repository.interface.js';
import { CreateWarehouseParams, UpdateWarehouseParams } from '../interfaces/warehouse.interface.js';

class WarehouseRepository implements IWarehouseRepository {
  async create(data: CreateWarehouseParams): Promise<Warehouse> {
    return Warehouse.create(data);
  }
  async findAll(): Promise<Warehouse[]> {
    return Warehouse.findAll();
  }
  async findById(id: number): Promise<Warehouse | null> {
    return Warehouse.findByPk(id);
  }
  async update(id: number, data: UpdateWarehouseParams): Promise<Warehouse | null> {
    const wh = await Warehouse.findByPk(id);
    if (!wh) return null;
    return wh.update(data);
  }
  async delete(id: number): Promise<void> {
    const wh = await Warehouse.findByPk(id);
    if (wh) await wh.destroy();
  }
}

export default new WarehouseRepository();
