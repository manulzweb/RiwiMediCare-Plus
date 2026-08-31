import jwt, { type SignOptions } from 'jsonwebtoken';
import { envConfig } from '../config/env.js';
import type { AccessTokenPayload } from '../types/auth.types.js';
import type { UserRole } from '../constants/roles.enum.js';
import { ITokenService } from './interfaces/token.service.interface.js';

/**
 * Service responsible for generating and verifying JWT tokens.
 * RiwiMediCare Plus: access token payload is { id, email, role }
 */
export class TokenService implements ITokenService {
  generateAccessToken(payload: { id: number; email: string; role: UserRole }): string {
    const jwtPayload = {
      id: payload.id,
      sub: String(payload.id),
      email: payload.email,
      role: payload.role,
      type: 'access' as const,
    };
    return jwt.sign(jwtPayload, envConfig.JWT.ACCESS_SECRET, {
      expiresIn: envConfig.JWT.ACCESS_EXPIRES_IN,
      issuer: envConfig.JWT.ISSUER,
      audience: envConfig.JWT.AUDIENCE,
      algorithm: 'HS256',
    } as SignOptions);
  }

  verifyAccessToken(token: string): AccessTokenPayload | null {
    try {
      const decoded = jwt.verify(token, envConfig.JWT.ACCESS_SECRET, {
        issuer: envConfig.JWT.ISSUER,
        audience: envConfig.JWT.AUDIENCE,
        algorithms: ['HS256'],
      }) as AccessTokenPayload;
      if (decoded.type !== 'access' || !decoded.sub) return null;
      return decoded;
    } catch {
      return null;
    }
  }

  extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) return null;
    const [scheme, token] = authHeader.trim().split(/\s+/);
    if (scheme !== 'Bearer' || !token) return null;
    return token;
  }

  decodeToken(token: string): AccessTokenPayload | null {
    const decoded = jwt.decode(token);
    if (!decoded || typeof decoded !== 'object') return null;
    return decoded as AccessTokenPayload;
  }

  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded?.exp) return true;
    return decoded.exp <= Math.floor(Date.now() / 1000);
  }
}

const tokenService = new TokenService();
export default tokenService;
