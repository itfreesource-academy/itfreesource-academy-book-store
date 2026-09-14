import { Router, Response } from 'express';
import { store } from '../data/store.js';
import { authenticateToken, requirePermission, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/v1/inventory (Requires inventory:read)
router.get('/', authenticateToken, requirePermission('inventory:read'), (_req: AuthenticatedRequest, res: Response): void => {
  const inventory = store.getInventory();
  res.json({ success: true, ...inventory });
});

// PATCH /api/v1/inventory/:id/stock (Requires inventory:update)
router.patch('/:id/stock', authenticateToken, requirePermission('inventory:update'), (req: AuthenticatedRequest, res: Response): void => {
  const id = req.params.id as string;
  const { stock } = req.body;

  if (stock === undefined || isNaN(parseInt(stock, 10))) {
    res.status(400).json({ success: false, error: 'Valid stock number is required.' });
    return;
  }

  const updated = store.updateStock(id, parseInt(stock, 10));
  if (!updated) {
    res.status(404).json({ success: false, error: 'Book not found in inventory.' });
    return;
  }

  store.addAuditLog({
    id: `aud_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    userId: req.user!.id,
    username: req.user!.username,
    role: req.user!.role,
    action: 'INVENTORY_ADJUST',
    entity: 'Inventory',
    entityId: id,
    details: `Updated stock level for "${updated.title}" to ${updated.stock} units.`,
    ipAddress: (req.ip as string) || '127.0.0.1'
  });

  res.json({ success: true, book: updated });
});

export default router;
