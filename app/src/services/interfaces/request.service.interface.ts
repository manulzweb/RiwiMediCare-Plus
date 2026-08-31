import {
  SupplyRequest,
  CreateSupplyRequestParams,
  UpdateSupplyRequestStatusParams,
} from '../../interfaces/supply-request.interface.js';

export interface IRequestService {
  create(params: CreateSupplyRequestParams): Promise<SupplyRequest>;
  findAll(): Promise<SupplyRequest[]>;
  findActive(): Promise<SupplyRequest[]>;
  findByClinic(clinicId: number): Promise<SupplyRequest[]>;
  findById(id: number): Promise<SupplyRequest>;
  updateStatus(id: number, params: UpdateSupplyRequestStatusParams): Promise<SupplyRequest>;
  delete(id: number): Promise<void>;
}
