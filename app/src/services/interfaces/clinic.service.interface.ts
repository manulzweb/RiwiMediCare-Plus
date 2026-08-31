import { Clinic, CreateClinicParams, UpdateClinicParams } from '../../interfaces/clinic.interface.js';

export interface IClinicService {
  create(params: CreateClinicParams): Promise<Clinic>;
  findAll(): Promise<Clinic[]>;
  findById(id: number): Promise<Clinic>;
  update(id: number, params: UpdateClinicParams): Promise<Clinic>;
  delete(id: number): Promise<void>;
}
