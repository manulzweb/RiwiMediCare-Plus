import {
  Warehouse,
  CreateWarehouseParams,
  UpdateWarehouseParams,
} from '../../interfaces/warehouse.interface.js';

export interface IWarehouseRepository {
  create(params: CreateWarehouseParams): Promise<Warehouse>;
  findAll(): Promise<Warehouse[]>;
  findById(id: number): Promise<Warehouse | null>;
  update(id: number, params: UpdateWarehouseParams): Promise<Warehouse | null>;
  delete(id: number): Promise<void>;
}
