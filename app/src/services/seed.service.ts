import sequelize from '../config/database.js';
import { Transaction } from 'sequelize';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import Clinic from '../models/clinic.model.js';
import Warehouse from '../models/warehouse.model.js';
import Medicine from '../models/medicine.model.js';
import { UserRole } from '../constants/roles.enum.js';
import { envConfig } from '../config/env.js';
import { ValidationError } from '../errors/domain-errors.js';

interface SeedPayload {
  users?: Array<{ name: string; email: string; password: string; role?: UserRole }>;
  clinics?: Array<{
    name: string;
    nit: string;
    responsibleName: string;
    responsibleEmail: string;
    address: string;
    phone: string;
  }>;
  warehouses?: Array<{ name: string; code: string; location: string }>;
  medicines?: Array<{
    name: string;
    code: string;
    stock: number;
    unitPrice: number;
    warehouseId: number;
    description?: string;
  }>;
}

class SeedService {
  private parseJson(buffer: Buffer): SeedPayload {
    const text = buffer.toString('utf-8');
    if (!text.trim()) throw new ValidationError('Empty file');
    try {
      return JSON.parse(text);
    } catch {
      throw new ValidationError('Invalid JSON format');
    }
  }

  private async seedUsers(users?: SeedPayload['users'], transaction?: Transaction): Promise<void> {
    if (!users?.length) return;
    for (const u of users) {
      if (!u.email || !u.password || !u.name)
        throw new ValidationError('User requires name,email,password');
      const hash = await bcrypt.hash(u.password, envConfig.BCRYPT.ROUNDS);
      await User.create(
        {
          name: u.name,
          email: u.email,
          password: hash,
          role: u.role ?? UserRole.REQUEST_MANAGER,
          isDeleted: false,
        },
        { transaction },
      );
    }
  }

  private async seedClinics(
    clinics?: SeedPayload['clinics'],
    transaction?: Transaction,
  ): Promise<void> {
    if (!clinics?.length) return;
    for (const c of clinics) {
      await Clinic.create({ ...c, isDeleted: false }, { transaction });
    }
  }

  private async seedWarehouses(
    warehouses?: SeedPayload['warehouses'],
    transaction?: Transaction,
  ): Promise<void> {
    if (!warehouses?.length) return;
    for (const w of warehouses) {
      await Warehouse.create({ ...w, isDeleted: false }, { transaction });
    }
  }

  private async seedMedicines(
    medicines?: SeedPayload['medicines'],
    transaction?: Transaction,
  ): Promise<void> {
    if (!medicines?.length) return;
    for (const m of medicines) {
      await Medicine.create({ ...m, isDeleted: false }, { transaction });
    }
  }

  async seedFromBuffer(
    buffer: Buffer,
  ): Promise<{ users: number; clinics: number; warehouses: number; medicines: number }> {
    const payload = this.parseJson(buffer);
    return sequelize.transaction(async (t) => {
      await this.seedUsers(payload.users, t);
      await this.seedWarehouses(payload.warehouses, t);
      await this.seedClinics(payload.clinics, t);
      await this.seedMedicines(payload.medicines, t);
      return {
        users: payload.users?.length ?? 0,
        clinics: payload.clinics?.length ?? 0,
        warehouses: payload.warehouses?.length ?? 0,
        medicines: payload.medicines?.length ?? 0,
      };
    });
  }
}

export default new SeedService();
