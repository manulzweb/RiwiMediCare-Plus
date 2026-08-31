import { RequestStatus } from '../../constants/request-status.enum.js';

export interface CreateRequestDto {
  clinicId: number;
  medicineId: number;
  warehouseId: number;
  quantity: number;
  notes?: string;
}

export interface UpdateRequestStatusDto {
  status: RequestStatus;
}
