import { SupplyRequest } from '../models/request.model.js';
import { RequestStatus } from '../constants/request-status.enum.js';
import requestRepository from '../repositories/request.repository.js';
import clinicRepository from '../repositories/clinic.repository.js';
import medicineRepository from '../repositories/medicine.repository.js';
import warehouseRepository from '../repositories/warehouse.repository.js';
import { CreateSupplyRequestParams, UpdateSupplyRequestStatusParams } from '../interfaces/supply-request.interface.js';
import { IRequestService } from './interfaces/request.service.interface.js';
import { ValidationError, NotFoundError, ConflictError } from '../errors/domain-errors.js';

const ALLOWED_STATUSES = Object.values(RequestStatus) as RequestStatus[];

class RequestService implements IRequestService {
  private validateQuantity(quantity: number): void {
    if (!quantity || quantity <= 0) throw new ValidationError('Quantity must be greater than 0');
  }

  private validateStatus(status: string): void {
    if (!ALLOWED_STATUSES.includes(status as RequestStatus)) {
      throw new ValidationError(`Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`);
    }
  }

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

  private async checkInventory(medicineId: number, warehouseId: number, quantity: number): Promise<void> {
    const medicine = await medicineRepository.findById(medicineId);
    if (!medicine) throw new NotFoundError('Medicine not found');
    if (medicine.warehouseId !== warehouseId) {
      throw new ConflictError('Medicine is not available in the assigned warehouse');
    }
    if (medicine.stock < quantity) {
      throw new ConflictError('Insufficient inventory in warehouse');
    }
  }

  async create(dto: CreateSupplyRequestParams): Promise<SupplyRequest> {
    this.validateQuantity(dto.quantity);
    await this.ensureClinicExists(dto.clinicId);
    await this.ensureMedicineExists(dto.medicineId);
    await this.ensureWarehouseExists(dto.warehouseId);
    await this.checkInventory(dto.medicineId, dto.warehouseId, dto.quantity);
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
    this.validateStatus(dto.status);
    const updated = await requestRepository.updateStatus(id, dto);
    if (!updated) throw new NotFoundError('Request not found');
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    await requestRepository.delete(id);
  }
}

export default new RequestService();
