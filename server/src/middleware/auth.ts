import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole, Permission, ROLE_PERMISSIONS } from '../types/index.js';
import { store } from '../data/store.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'itfreesource-academy-super-secret-key-2026';

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
  email: string;
  fullName: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function generateToken(user: { id: string; username: string; role: UserRole; email: string; fullName: string }): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
      fullName: user.fullName
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. Please provide a Bearer token in the Authorization header.',
      code: 'UNAUTHORIZED'
    });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err || !decoded) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired authentication token.',
        code: 'INVALID_TOKEN'
      });
      return;
    }

    const payload = decoded as AuthUser;
    const existing = store.getUserById(payload.id);
    if (existing && existing.status === 'suspended') {
      res.status(403).json({
        success: false,
        error: 'Your account has been suspended by an administrator.',
        code: 'ACCOUNT_SUSPENDED'
      });
      return;
    }

    req.user = payload;
    next();
  });
}

export function optionalAuthenticateToken(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    next();
    return;
  }

  jwt.verify(token, JWT_SECRET, (_err, decoded) => {
    if (decoded) {
      req.user = decoded as AuthUser;
    }
    next();
  });
}

export function requirePermission(...requiredPermissions: Permission[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized. Please login first.',
        code: 'UNAUTHORIZED'
      });
      return;
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    const hasAll = requiredPermissions.every(perm => userPermissions.includes(perm));

    if (!hasAll) {
      res.status(403).json({
        success: false,
        error: `Forbidden. Role '${req.user.role}' lacks required permissions: [${requiredPermissions.join(', ')}].`,
        code: 'FORBIDDEN',
        requiredPermissions,
        userRole: req.user.role
      });
      return;
    }

    next();
  };
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized. Please login first.',
        code: 'UNAUTHORIZED'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Forbidden. User role '${req.user.role}' is not authorized. Allowed roles: [${allowedRoles.join(', ')}].`,
        code: 'FORBIDDEN'
      });
      return;
    }

    next();
  };
}
