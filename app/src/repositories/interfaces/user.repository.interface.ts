// app/src/repositories/interfaces/user.repository.interface.ts
import { Transaction } from 'sequelize';
import User, { UserCreationAttributes } from '../../models/user.model.js';

export interface IUserRepository {
  create(data: UserCreationAttributes, transaction?: Transaction): Promise<User>;
  findAll(): Promise<User[]>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  updatePassword(userId: number, password: string): Promise<void>;
}
