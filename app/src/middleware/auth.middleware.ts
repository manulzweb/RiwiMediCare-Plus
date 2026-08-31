import { Request, Response, NextFunction } from 'express';
import tokenService from '../services/auth-token.service.js';

/**
 * Verifies Bearer token and attaches user payload to request.
 * Fail fast with guard clauses; no nested if/else.
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = tokenService.extractTokenFromHeader(req.headers.authorization);
  if (!token) {
    res.status(401).json({ success: false, message: 'Authorization Bearer token is required' });
    return;
  }

  const payload = tokenService.verifyAccessToken(token);
  if (!payload || payload.type !== 'access' || !payload.sub) {
    res.status(401).json({ success: false, message: 'Invalid or expired access token' });
    return;
  }

  req.user = payload;
  next();
};

export default authMiddleware;
