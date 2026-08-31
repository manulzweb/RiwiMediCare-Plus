import { SupplyRequest } from '../models/request.model.js';
import { RequestStatus } from '../constants/request-status.enum.js';
import requestRepository from '../repositories/request.repository.js';
import clinicRepository from '../repositories/clinic.repository.js';
import medicineRepository from '../repositories/medicine.repository.js';
import warehouseRepository from '../repositories/warehouse.repository.js';
import {
  CreateSupplyRequestParams,
  UpdateSupplyRequestStatusParams,
} from '../interfaces/supply-request.interface.js';
import { IRequestService } from './interfaces/request.service.interface.js';
import { NotFoundError } from '../errors/domain-errors.js';

class RequestService implements IRequestService {
  private async ensureClinicExists(clinicId: number): Promise<void> {
    const clinic = await clinicRepository.findById(clinicId);
    if (!clinic) throw new NotFoundError('Clinic not found');
  }

  private async ensureMedicineExists(medicineId: number): Promise<void> {
    const med = await medicineRepository.findById(medicineId);
    if (!med) throw new NotFoundError('Medicine not found');
  }

  private async ensureWarehouseExists(warehouseId: number): Promise<void> {
    const wh = await warehouseRepository.findById(warehouseId);
    if (!wh) throw new NotFoundError('Warehouse not found');
  }

  async create(dto: CreateSupplyRequestParams): Promise<SupplyRequest> {
    await this.ensureClinicExists(dto.clinicId);
    await this.ensureMedicineExists(dto.medicineId);
    await this.ensureWarehouseExists(dto.warehouseId);
    const request = await requestRepository.create({
      clinicId: dto.clinicId,
      medicineId: dto.medicineId,
      warehouseId: dto.warehouseId,
      quantity: dto.quantity,
      status: RequestStatus.PENDING,
      createdById: dto.createdById ?? 1,
      notes: dto.notes,
    });
    return request;
  }

  async findAll(): Promise<SupplyRequest[]> {
    return requestRepository.findAll();
  }

  async findActive(): Promise<SupplyRequest[]> {
    return requestRepository.findActive();
  }

  async findByClinic(clinicId: number): Promise<SupplyRequest[]> {
    await this.ensureClinicExists(clinicId);
    return requestRepository.findByClinic(clinicId);
  }

  async findById(id: number): Promise<SupplyRequest> {
    const req = await requestRepository.findById(id);
    if (!req) throw new NotFoundError('Request not found');
    return req;
  }

  async updateStatus(id: number, dto: UpdateSupplyRequestStatusParams): Promise<SupplyRequest> {
    const existing = await requestRepository.findById(id);
    if (!existing) throw new NotFoundError('Request not found');

    // Descuenta inventario solo en la primera transición a APPROVED/DISPATCHED/DELIVERED
    const shouldDecrement =
      [RequestStatus.APPROVED, RequestStatus.DISPATCHED, RequestStatus.DELIVERED].includes(
        dto.status as RequestStatus,
      ) && existing.status === RequestStatus.PENDING;

    if (shouldDecrement) {
      await medicineRepository.decrementStock(existing.medicineId, existing.quantity);
    }

    const updated = await requestRepository.updateStatus(id, dto);
    if (!updated) throw new NotFoundError('Request not found');
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    await requestRepository.delete(id);
  }
}

const requestService = new RequestService();
export { requestService };
export default requestService;
