// app/src/dto/request/register-user.dto.ts

import type { UserRole, UserStatus } from '../../types/user.types.js';

/**
 * Input DTO for user registration - RiwiMediCare Plus
 * Allows explicit role assignment: ADMIN | REQUEST_MANAGER
 */
export interface RegisterUserRequestDto {
  /** User full name */
  name?: string;

  /** User email - must be valid format */
  email: string;

  /** Email confirmation (optional) */
  confirmEmail?: string;

  /** User password (plain) */
  password: string;

  /** Password confirmation */
  confirmPassword?: string;

  /** Role assignment - ADMIN | REQUEST_MANAGER */
  role?: UserRole;

  /** Logical status - activo/inactivo, defaults to activo */
  status?: UserStatus;

  /** Phone example extensible */
  phone?: string;

  [key: string]: unknown;
}
