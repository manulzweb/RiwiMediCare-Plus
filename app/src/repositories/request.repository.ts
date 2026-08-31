import { SupplyRequest } from '../models/request.model.js';
import { RequestStatus } from '../constants/request-status.enum.js';
import { IRequestRepository } from './interfaces/request.repository.interface.js';
import { CreateSupplyRequestParams, UpdateSupplyRequestStatusParams } from '../interfaces/supply-request.interface.js';

class RequestRepository implements IRequestRepository {
  async create(data: CreateSupplyRequestParams): Promise<SupplyRequest> {
    return SupplyRequest.create(data);
  }
  async findAll(): Promise<SupplyRequest[]> {
    return SupplyRequest.findAll({ include: ['clinic', 'medicine', 'warehouse'] });
  }
  async findById(id: number): Promise<SupplyRequest | null> {
    return SupplyRequest.findOne({ where: { id }, include: ['clinic', 'medicine', 'warehouse'] });
  }
  async findByClinic(clinicId: number): Promise<SupplyRequest[]> {
    return SupplyRequest.findAll({ where: { clinicId }, include: ['medicine', 'warehouse'] });
  }
  async findActive(): Promise<SupplyRequest[]> {
    return SupplyRequest.findAll({ where: { status: RequestStatus.PENDING } });
  }
  async updateStatus(id: number, params: UpdateSupplyRequestStatusParams): Promise<SupplyRequest | null> {
    const req = await SupplyRequest.findByPk(id);
    if (!req) return null;
    return req.update({ status: params.status });
  }
  async delete(id: number): Promise<void> {
    const req = await SupplyRequest.findByPk(id);
    if (req) await req.destroy();
  }
}

export default new RequestRepository();
