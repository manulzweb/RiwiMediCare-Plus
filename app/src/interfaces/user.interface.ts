// app/src/interfaces/user.interface.ts
import { UserRole } from '../constants/roles.enum.js';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateUserParams {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role?: UserRole;
}

export interface LoginUserParams {
  email: string;
  password: string;
}
