import { Router, Request, Response } from 'express';
import { store } from '../data/store.js';
import { authenticateToken, requirePermission, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/v1/reviews
router.get('/', (req: Request, res: Response): void => {
  const { bookId, status } = req.query;
  const reviews = store.getReviews(
    typeof bookId === 'string' ? bookId : undefined,
    typeof status === 'string' ? (status as any) : undefined
  );
  res.json({ success: true, reviews });
});

// POST /api/v1/reviews
router.post('/', authenticateToken, requirePermission('reviews:create'), (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  const { bookId, rating, title, comment } = req.body;

  if (!bookId || !rating || !title || !comment) {
    res.status(400).json({ success: false, error: 'bookId, rating, title, and comment are required.' });
    return;
  }

  const book = store.getBookById(bookId);
  if (!book) {
    res.status(404).json({ success: false, error: 'Book not found.' });
    return;
  }

  // Auto-approve if written by trusted roles (book_reviewer or admin)
  const isAutoApproved = ['admin', 'book_reviewer', 'store_manager'].includes(user.role);

  const newReview = store.createReview(
    {
      bookId,
      userId: user.id,
      username: user.username,
      userAvatar: store.getUserById(user.id)?.avatar,
      rating: Math.min(5, Math.max(1, parseInt(rating, 10))),
      title,
      comment
    },
    isAutoApproved
  );

  store.addAuditLog({
    id: `aud_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    username: user.username,
    role: user.role,
    action: 'REVIEW_SUBMIT',
    entity: 'Review',
    entityId: newReview.id,
    details: `Submitted ${newReview.rating}-star review for "${book.title}". Status: ${newReview.status}`,
    ipAddress: (req.ip as string) || '127.0.0.1'
  });

  res.status(201).json({ success: true, review: newReview });
});

// PATCH /api/v1/reviews/:id/status (Requires reviews:moderate)
router.patch('/:id/status', authenticateToken, requirePermission('reviews:moderate'), (req: AuthenticatedRequest, res: Response): void => {
  const id = req.params.id as string;
  const { status } = req.body;

  if (!status || !['approved', 'rejected'].includes(status)) {
    res.status(400).json({ success: false, error: "Status must be either 'approved' or 'rejected'." });
    return;
  }

  const updated = store.updateReviewStatus(id, status);
  if (!updated) {
    res.status(404).json({ success: false, error: 'Review not found.' });
    return;
  }

  store.addAuditLog({
    id: `aud_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    userId: req.user!.id,
    username: req.user!.username,
    role: req.user!.role,
    action: 'REVIEW_MODERATE',
    entity: 'Review',
    entityId: id,
    details: `Review ${id} was set to ${status}.`,
    ipAddress: (req.ip as string) || '127.0.0.1'
  });

  res.json({ success: true, review: updated });
});

export default router;
