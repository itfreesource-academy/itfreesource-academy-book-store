import { Router, Response } from 'express';
import { store } from '../data/store.js';
import { authenticateToken, requirePermission, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/v1/audit-logs (Requires audit:read)
router.get('/', authenticateToken, requirePermission('audit:read'), (_req: AuthenticatedRequest, res: Response): void => {
  const logs = store.getAuditLogs();
  res.json({
    success: true,
    total: logs.length,
    logs
  });
});

export default router;
