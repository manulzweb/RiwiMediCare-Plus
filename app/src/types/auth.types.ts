// app/src/types/auth.types.ts

/**
 * JWT payload definitions for RiwiMediCare Plus
 * Access token contains full identity: id, email, role
 */
import type { UserRole } from '../constants/roles.enum.js';

export interface AccessTokenPayload {
  /** User id (primary key) */
  id: number;

  /** Alias for sub (stringified id for JWT standard) */
  sub: string;

  /** User email */
  email: string;

  /** User role */
  role: UserRole;

  /** Token type */
  type: 'access';

  /** Issued at */
  iat?: number;

  /** Expiration */
  exp?: number;
}

export interface RefreshTokenPayload {
  /** User id */
  sub: string;

  /** Token type */
  type: 'refresh';

  iat?: number;
  exp?: number;
}

/**
 * Decoded user attached to request after authMiddleware
 */
export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
}
