import { Router, Request, Response } from 'express';
import { store } from '../data/store.js';
import { authenticateToken, requirePermission, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/v1/authors
router.get('/', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    authors: store.getAuthors()
  });
});

// POST /api/v1/authors
router.post('/', authenticateToken, requirePermission('catalog:create'), (req: AuthenticatedRequest, res: Response): void => {
  const { name, bio, photo, nationality } = req.body;
  if (!name) {
    res.status(400).json({ success: false, error: 'Author name is required.' });
    return;
  }
  const newAuthor = store.createAuthor(
    name,
    bio || '',
    photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    nationality || 'International'
  );
  res.status(201).json({ success: true, author: newAuthor });
});

export default router;
