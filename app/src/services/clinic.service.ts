import Clinic from '../models/clinic.model.js';
import clinicRepository from '../repositories/clinic.repository.js';
import { CreateClinicParams, UpdateClinicParams } from '../interfaces/clinic.interface.js';
import { IClinicService } from './interfaces/clinic.service.interface.js';
import { ValidationError, NotFoundError } from '../errors/domain-errors.js';

class ClinicService implements IClinicService {
  private validateCreateDto(dto: CreateClinicParams): void {
    if (!dto.name?.trim()) throw new ValidationError('Name is required');
    if (!dto.nit?.trim()) throw new ValidationError('NIT is required');
    if (!dto.responsibleName?.trim()) throw new ValidationError('Responsible name is required');
    if (!dto.responsibleEmail?.trim()) throw new ValidationError('Responsible email is required');
    if (!dto.address?.trim()) throw new ValidationError('Address is required');
    if (!dto.phone?.trim()) throw new ValidationError('Phone is required');
  }

  async create(dto: CreateClinicParams): Promise<Clinic> {
    this.validateCreateDto(dto);
    return clinicRepository.create(dto);
  }

  async findAll(): Promise<Clinic[]> {
    return clinicRepository.findAll();
  }

  async findById(id: number): Promise<Clinic> {
    const clinic = await clinicRepository.findById(id);
    if (!clinic) throw new NotFoundError('Clinic not found');
    return clinic;
  }

  async update(id: number, dto: UpdateClinicParams): Promise<Clinic> {
    const clinic = await this.findById(id);
    const updated = await clinicRepository.update(clinic.id, dto);
    return updated!;
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    await clinicRepository.delete(id);
  }
}

const clinicService = new ClinicService();
export { clinicService };
export default clinicService;
