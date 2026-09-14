import { Router, Request, Response } from 'express';
import { store } from '../data/store.js';
import { generateToken, authenticateToken, requirePermission, AuthenticatedRequest } from '../middleware/auth.js';
import { ROLE_PERMISSIONS, UserRole } from '../types/index.js';

const router = Router();

// POST /api/v1/auth/login
router.post('/login', (req: Request, res: Response): void => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({
      success: false,
      error: 'Username and password are required.',
      code: 'MISSING_CREDENTIALS'
    });
    return;
  }

  const user = store.getUserByUsername(username);

  if (!user || user.password !== password) {
    res.status(401).json({
      success: false,
      error: 'Invalid username or password. Please use one of the 10 preconfigured test accounts.',
      code: 'INVALID_CREDENTIALS'
    });
    return;
  }

  if (user.status === 'suspended') {
    res.status(403).json({
      success: false,
      error: 'This account has been suspended by an administrator.',
      code: 'ACCOUNT_SUSPENDED'
    });
    return;
  }

  const token = generateToken({
    id: user.id,
    username: user.username,
    role: user.role,
    email: user.email,
    fullName: user.fullName
  });

  const permissions = ROLE_PERMISSIONS[user.role] || [];
  const { password: _, ...userSafe } = user;

  // Log login audit
  store.addAuditLog({
    id: `aud_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    username: user.username,
    role: user.role,
    action: 'USER_LOGIN',
    entity: 'Auth',
    entityId: user.id,
    details: `User ${user.username} logged in with role ${user.role}.`,
    ipAddress: req.ip || '127.0.0.1'
  });

  res.json({
    success: true,
    token,
    user: userSafe,
    permissions
  });
});

// GET /api/v1/auth/me
router.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const user = store.getUserById(req.user.id);
  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }

  const { password: _, ...userSafe } = user;
  const permissions = ROLE_PERMISSIONS[user.role] || [];

  res.json({
    success: true,
    user: userSafe,
    permissions
  });
});

// GET /api/v1/auth/users
router.get('/users', (req: Request, res: Response): void => {
  const users = store.getUsers();
  res.json({
    success: true,
    users
  });
});

// PATCH /api/v1/auth/users/:id/status
router.patch('/users/:id/status', authenticateToken, requirePermission('users:manage'), (req: AuthenticatedRequest, res: Response): void => {
  const id = req.params.id as string;
  const { status } = req.body;

  if (!status || !['active', 'suspended'].includes(status)) {
    res.status(400).json({ success: false, error: "Status must be 'active' or 'suspended'." });
    return;
  }

  const updated = store.updateUserStatus(id, status);
  if (!updated) {
    res.status(404).json({ success: false, error: 'User not found.' });
    return;
  }

  store.addAuditLog({
    id: `aud_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    userId: req.user!.id,
    username: req.user!.username,
    role: req.user!.role,
    action: 'USER_STATUS_CHANGE',
    entity: 'User',
    entityId: id,
    details: `Changed status of user ${updated.username} to ${status}.`,
    ipAddress: (req.ip as string) || '127.0.0.1'
  });

  const { password: _, ...userSafe } = updated;
  res.json({ success: true, user: userSafe });
});

// PUT /api/v1/auth/users/:id (Admin User Management: edit full name, email, role, timezone, currency, status)
router.put('/users/:id', authenticateToken, requirePermission('users:manage'), (req: AuthenticatedRequest, res: Response): void => {
  const id = req.params.id as string;
  const { fullName, email, role, status, currency, timezone } = req.body;

  const existing = store.getUserById(id);
  if (!existing) {
    res.status(404).json({ success: false, error: 'User not found.' });
    return;
  }

  const updated = store.updateUserDetails(id, {
    fullName,
    email,
    role,
    status,
    currency,
    timezone
  });

  if (!updated) {
    res.status(400).json({ success: false, error: 'Failed to update user.' });
    return;
  }

  store.addAuditLog({
    id: `aud_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    userId: req.user!.id,
    username: req.user!.username,
    role: req.user!.role,
    action: 'USER_UPDATE',
    entity: 'User',
    entityId: id,
    details: `Admin updated user @${updated.username}: Name="${updated.fullName}", Role="${updated.role}", Status="${updated.status}", Timezone="${updated.timezone}", Currency="${updated.currency}".`,
    ipAddress: (req.ip as string) || '127.0.0.1'
  });

  const { password: _, ...userSafe } = updated;
  res.json({ success: true, user: userSafe });
});

// GET /api/v1/auth/roles
router.get('/roles', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    roles: ROLE_PERMISSIONS
  });
});

export default router;
