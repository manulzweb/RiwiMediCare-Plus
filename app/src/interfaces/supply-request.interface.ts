// app/src/interfaces/supply-request.interface.ts
import { RequestStatus } from '../constants/request-status.enum.js';

export interface SupplyRequest {
  id: number;
  clinicId: number;
  warehouseId: number;
  medicineId: number;
  createdById: number;
  quantity: number;
  status: RequestStatus;
  notes?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateSupplyRequestParams {
  clinicId: number;
  warehouseId: number;
  medicineId: number;
  quantity: number;
  notes?: string;
  createdById: number;
  status?: RequestStatus;
}

export interface UpdateSupplyRequestStatusParams {
  status: RequestStatus;
}

export interface SupplyRequestWithRelations extends SupplyRequest {
  clinic?: unknown;
  warehouse?: unknown;
  medicine?: unknown;
}
