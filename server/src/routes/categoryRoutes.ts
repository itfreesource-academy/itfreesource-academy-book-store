import { Router, Request, Response } from 'express';
import { store } from '../data/store.js';
import { authenticateToken, requirePermission, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/v1/categories
router.get('/', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    categories: store.getCategories()
  });
});

// POST /api/v1/categories
router.post('/', authenticateToken, requirePermission('catalog:create'), (req: AuthenticatedRequest, res: Response): void => {
  const { name, description } = req.body;
  if (!name) {
    res.status(400).json({ success: false, error: 'Category name is required.' });
    return;
  }
  const newCat = store.createCategory(name, description || '');
  res.status(201).json({ success: true, category: newCat });
});

export default router;
