import {
  Medicine,
  CreateMedicineParams,
  UpdateMedicineParams,
} from '../../interfaces/medicine.interface.js';

export interface IMedicineRepository {
  create(params: CreateMedicineParams): Promise<Medicine>;
  findAll(): Promise<Medicine[]>;
  findById(id: number): Promise<Medicine | null>;
  findByWarehouse(warehouseId: number): Promise<Medicine[]>;
  findByCode(code: string): Promise<Medicine | null>;
  update(id: number, params: UpdateMedicineParams): Promise<Medicine | null>;
  delete(id: number): Promise<void>;
  decrementStock(id: number, quantity: number): Promise<void>;
}
