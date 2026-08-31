// app/src/types/user.types.ts
export { UserRole } from '../constants/roles.enum.js';
import { UserRole } from '../constants/roles.enum.js';

export const ALLOWED_ROLES: readonly UserRole[] = [UserRole.ADMIN, UserRole.REQUEST_MANAGER] as const;

export function isValidUserRole(role: unknown): role is UserRole {
  return typeof role === 'string' && (ALLOWED_ROLES as readonly string[]).includes(role);
}

// Legacy status kept for backward compat but User model now uses isDeleted
export type UserStatus = 'activo' | 'inactivo';
export const ALLOWED_STATUS: readonly UserStatus[] = ['activo', 'inactivo'] as const;
export function isValidUserStatus(status: unknown): status is UserStatus {
  return typeof status === 'string' && (ALLOWED_STATUS as readonly string[]).includes(status);
}

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type Usuario = User;
