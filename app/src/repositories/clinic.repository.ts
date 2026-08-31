import Clinic from '../models/clinic.model.js';
import { IClinicRepository } from './interfaces/clinic.repository.interface.js';
import { CreateClinicParams, UpdateClinicParams } from '../interfaces/clinic.interface.js';

class ClinicRepository implements IClinicRepository {
  async create(data: CreateClinicParams): Promise<Clinic> {
    return Clinic.create(data);
  }
  async findAll(): Promise<Clinic[]> {
    return Clinic.findAll();
  }
  async findById(id: number): Promise<Clinic | null> {
    return Clinic.findByPk(id);
  }
  async findByNit(nit: string): Promise<Clinic | null> {
    return Clinic.findOne({ where: { nit } });
  }
  async update(id: number, data: UpdateClinicParams): Promise<Clinic | null> {
    const clinic = await Clinic.findByPk(id);
    if (!clinic) return null;
    return clinic.update(data);
  }
  async delete(id: number): Promise<void> {
    const clinic = await Clinic.findByPk(id);
    if (clinic) await clinic.destroy();
  }
}

export default new ClinicRepository();
