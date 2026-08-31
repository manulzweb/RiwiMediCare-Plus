import Medicine from '../models/medicine.model.js';
import { IMedicineRepository } from './interfaces/medicine.repository.interface.js';
import { CreateMedicineParams, UpdateMedicineParams } from '../interfaces/medicine.interface.js';

class MedicineRepository implements IMedicineRepository {
  async create(data: CreateMedicineParams): Promise<Medicine> {
    return Medicine.create(data);
  }
  async findByCode(code: string): Promise<Medicine | null> {
    return Medicine.findOne({ where: { code } });
  }
  async findAll(): Promise<Medicine[]> {
    return Medicine.findAll({ include: ['warehouse'] });
  }
  async findById(id: number): Promise<Medicine | null> {
    return Medicine.findByPk(id);
  }
  async findByWarehouse(warehouseId: number): Promise<Medicine[]> {
    return Medicine.findAll({ where: { warehouseId } });
  }
  async update(id: number, data: UpdateMedicineParams): Promise<Medicine | null> {
    const med = await Medicine.findByPk(id);
    if (!med) return null;
    return med.update(data);
  }
  async delete(id: number): Promise<void> {
    const med = await Medicine.findByPk(id);
    if (med) await med.destroy();
  }
  async decrementStock(id: number, quantity: number): Promise<void> {
    const med = await Medicine.findByPk(id);
    if (!med) throw new Error('Medicine not found');
    if (med.stock < quantity) throw new Error('Insufficient stock');
    await med.update({ stock: med.stock - quantity });
  }
}

export default new MedicineRepository();
