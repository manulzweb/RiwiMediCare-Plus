import {
  Medicine,
  CreateMedicineParams,
  UpdateMedicineParams,
} from '../../interfaces/medicine.interface.js';

export interface IMedicineService {
  create(params: CreateMedicineParams): Promise<Medicine>;
  findAll(): Promise<Medicine[]>;
  findById(id: number): Promise<Medicine>;
  update(id: number, params: UpdateMedicineParams): Promise<Medicine>;
  delete(id: number): Promise<void>;
}
