import type { AccessTokenPayload } from '../../types/auth.types.js';
import type { UserRole } from '../../constants/roles.enum.js';

export interface ITokenService {
  generateAccessToken(payload: { id: number; email: string; role: UserRole }): string;
  verifyAccessToken(token: string): AccessTokenPayload | null;
  extractTokenFromHeader(authHeader?: string): string | null;
  decodeToken(token: string): AccessTokenPayload | null;
  isTokenExpired(token: string): boolean;
}
