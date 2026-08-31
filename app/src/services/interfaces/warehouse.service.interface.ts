import {
  Warehouse,
  CreateWarehouseParams,
  UpdateWarehouseParams,
} from '../../interfaces/warehouse.interface.js';

export interface IWarehouseService {
  create(params: CreateWarehouseParams): Promise<Warehouse>;
  findAll(): Promise<Warehouse[]>;
  findById(id: number): Promise<Warehouse>;
  update(id: number, params: UpdateWarehouseParams): Promise<Warehouse>;
  delete(id: number): Promise<void>;
}
