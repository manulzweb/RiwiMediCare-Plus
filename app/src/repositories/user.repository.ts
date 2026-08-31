// app/src/repositories/user.repository.ts
import { Transaction } from 'sequelize';
import User, { UserCreationAttributes } from '../models/user.model.js';
import { IUserRepository } from './interfaces/user.repository.interface.js';
import bcrypt from 'bcryptjs';
import { envConfig } from '../config/env.js';

class UserRepository implements IUserRepository {
  async create(data: UserCreationAttributes, transaction?: Transaction): Promise<User> {
    // Hash password if not already hashed (service may have already hashed)
    if (data.password && !data.password.startsWith('$2a$') && !data.password.startsWith('$2b$')) {
      data.password = await bcrypt.hash(data.password, envConfig.BCRYPT.ROUNDS);
    }
    return User.create(data, { transaction });
  }

  async findAll(): Promise<User[]> {
    return User.findAll();
  }

  async findByEmail(email: string): Promise<User | null> {
    return User.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return User.findByPk(id);
  }

  async updatePassword(id: number, password: string): Promise<void> {
    const hash =
      password.startsWith('$2a$') || password.startsWith('$2b$')
        ? password
        : await bcrypt.hash(password, envConfig.BCRYPT.ROUNDS);
    await User.update({ password: hash }, { where: { id } });
  }
}

export default new UserRepository();
