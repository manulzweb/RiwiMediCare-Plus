import { NextFunction, Request, Response } from 'express';
import type { UserRole } from '../types/user.types.js';

/**
 * Role-based access control middleware
 * Must be used after authMiddleware (requires req.user to be set)
 *
 * @param rolesAllowed - list of allowed roles, e.g. 'ADMIN', 'REQUEST_MANAGER'
 *
 * @example
 * router.get('/admin', authMiddleware, roleMiddleware('ADMIN'), handler)
 * router.get('/requests', authMiddleware, roleMiddleware('ADMIN', 'REQUEST_MANAGER'), handler)
 */
export const roleMiddleware = (...rolesAllowed: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as unknown as { role?: UserRole; id?: number } | undefined;

    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!user.role) {
      res.status(403).json({ success: false, message: 'Access denied: role not found in token' });
      return;
    }

    if (!rolesAllowed.includes(user.role)) {
      res.status(403).json({
        success: false,
        message: 'Access denied: insufficient permissions',
        details: { required: rolesAllowed, current: user.role },
      });
      return;
    }

    next();
  };
};

export default roleMiddleware;
