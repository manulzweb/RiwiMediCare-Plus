import {
  Clinic,
  CreateClinicParams,
  UpdateClinicParams,
} from '../../interfaces/clinic.interface.js';

export interface IClinicRepository {
  create(params: CreateClinicParams): Promise<Clinic>;
  findAll(): Promise<Clinic[]>;
  findById(id: number): Promise<Clinic | null>;
  findByNit(nit: string): Promise<Clinic | null>;
  update(id: number, params: UpdateClinicParams): Promise<Clinic | null>;
  delete(id: number): Promise<void>;
}
