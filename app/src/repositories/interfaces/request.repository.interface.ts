import { SupplyRequest, CreateSupplyRequestParams, UpdateSupplyRequestStatusParams } from '../../interfaces/supply-request.interface.js';

export interface IRequestRepository {
  create(params: CreateSupplyRequestParams): Promise<SupplyRequest>;
  findAll(): Promise<SupplyRequest[]>;
  findById(id: number): Promise<SupplyRequest | null>;
  findByClinic(clinicId: number): Promise<SupplyRequest[]>;
  findActive(): Promise<SupplyRequest[]>;
  updateStatus(id: number, params: UpdateSupplyRequestStatusParams): Promise<SupplyRequest | null>;
  delete(id: number): Promise<void>;
}
