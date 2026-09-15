import { Router, Response } from 'express';
import { store } from '../data/store.js';
import { authenticateToken, requirePermission, AuthenticatedRequest } from '../middleware/auth.js';
import { ROLE_PERMISSIONS, Currency, Timezone } from '../types/index.js';
import { kafkaBroker } from '../services/kafkaBroker.js';
import { webhookService } from '../services/webhookService.js';

const router = Router();

// GET /api/v1/borrow (List borrowed books)
router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  const userPerms = ROLE_PERMISSIONS[user.role] || [];
  const canReadAll = userPerms.includes('borrow:read_all');

  const records = store.getBorrowRecords(user.id, canReadAll);
  res.json({ success: true, records, data: records, total: records.length });
});

// POST /api/v1/borrow (Borrow a book for 10 days - $2.00 base fee)
router.post('/', authenticateToken, requirePermission('borrow:create'), (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  const { bookId, timezone, currency } = req.body;

  if (!bookId) {
    res.status(400).json({ success: false, error: 'bookId is required.' });
    return;
  }

  const userPerms = ROLE_PERMISSIONS[user.role] || [];
  const isVip = userPerms.includes('discount:vip');

  const fullUser = store.getUserById(user.id);
  const userTz: Timezone = timezone || (fullUser?.timezone || 'America/New_York');
  const userCurr: Currency = currency || (fullUser?.currency || 'USD');

  const result = store.borrowBook(user.id, user.username, bookId, userTz, userCurr, isVip);

  if ('error' in result) {
    res.status(400).json({ success: false, error: result.error });
    return;
  }

  store.addAuditLog({
    id: `aud_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    username: user.username,
    role: user.role,
    action: 'BOOK_BORROW',
    entity: 'Borrow',
    entityId: result.id,
    details: `User @${user.username} borrowed "${result.bookTitle}". Due Date: ${result.dueDate}. Base Fee: $${result.standardFee.toFixed(2)} (${userCurr}).`,
    ipAddress: (req.ip as string) || '127.0.0.1'
  });

  kafkaBroker.produce(
    'bookstore.borrow.events',
    {
      borrowId: result.id,
      userId: result.userId,
      username: result.username,
      bookId: result.bookId,
      bookTitle: result.bookTitle,
      dueDate: result.dueDate,
      action: 'BOOK_BORROWED',
      fee: result.standardFee
    },
    result.id,
    { 'event-type': 'BORROW_LOAN_OPENED' }
  );

  webhookService.dispatch('borrow:created', {
    borrowId: result.id,
    borrower: result.username,
    bookTitle: result.bookTitle,
    dueDate: result.dueDate,
    fee: result.standardFee
  }).catch(() => {});

  res.status(201).json({ success: true, record: result, data: result });
});

// GET /api/v1/borrow/:id/preview-fee (Real-time fee calculation preview given hypothetical return date or lost status)
router.get('/:id/preview-fee', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const id = req.params.id as string;
  const { returnDate, isLost } = req.query;

  const record = store.getBorrowRecordById(id);
  if (!record) {
    res.status(404).json({ success: false, error: 'Borrow record not found.' });
    return;
  }

  const userPerms = ROLE_PERMISSIONS[req.user!.role] || [];
  const isVip = userPerms.includes('discount:vip');

  const calculation = store.calculateBorrowFee(
    record,
    typeof returnDate === 'string' ? returnDate : undefined,
    isLost === 'true',
    isVip
  );

  const feeSummary = {
    ...calculation,
    daysLate: calculation.overdueDays,
    penaltyFee: calculation.lateFee,
    isOverdue: calculation.overdueDays > 0
  };

  res.json({
    success: true,
    recordId: record.id,
    bookTitle: record.bookTitle,
    calculation,
    feeSummary
  });
});

// POST /api/v1/borrow/:id/return (Return book and finalize settlement fee)
router.post('/:id/return', authenticateToken, requirePermission('borrow:return'), (req: AuthenticatedRequest, res: Response): void => {
  const id = req.params.id as string;
  const { returnDate } = req.body;

  const record = store.getBorrowRecordById(id);
  if (!record) {
    res.status(404).json({ success: false, error: 'Borrow record not found.' });
    return;
  }

  const user = req.user!;
  const userPerms = ROLE_PERMISSIONS[user.role] || [];
  const canReadAll = userPerms.includes('borrow:read_all');

  if (!canReadAll && record.userId !== user.id) {
    res.status(403).json({ success: false, error: 'Forbidden: You cannot return another user’s book loan.' });
    return;
  }

  const isVip = userPerms.includes('discount:vip');
  const result = store.returnBook(id, returnDate, false, isVip);

  if ('error' in result) {
    res.status(400).json({ success: false, error: result.error });
    return;
  }

  store.addAuditLog({
    id: `aud_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    username: user.username,
    role: user.role,
    action: 'BOOK_RETURN',
    entity: 'Borrow',
    entityId: id,
    details: `Returned "${result.bookTitle}". Standard Fee: $${result.standardFee}, Late Fee: $${result.lateFee}, Total Fee: $${result.totalFee}.`,
    ipAddress: (req.ip as string) || '127.0.0.1'
  });

  kafkaBroker.produce(
    'bookstore.borrow.events',
    {
      borrowId: id,
      action: 'BOOK_RETURNED',
      bookTitle: result.bookTitle,
      totalFee: result.totalFee,
      lateFee: result.lateFee
    },
    id,
    { 'event-type': 'BORROW_LOAN_CLOSED' }
  );

  webhookService.dispatch('borrow:returned', {
    borrowId: id,
    bookTitle: result.bookTitle,
    totalFee: result.totalFee,
    lateFee: result.lateFee,
    returnedAt: new Date().toISOString()
  }).catch(() => {});

  res.json({ success: true, record: result, data: result });
});

// POST /api/v1/borrow/:id/lost (Report book as lost - charges 2x book price)
router.post('/:id/lost', authenticateToken, requirePermission('borrow:return'), (req: AuthenticatedRequest, res: Response): void => {
  const id = req.params.id as string;
  const record = store.getBorrowRecordById(id);
  if (!record) {
    res.status(404).json({ success: false, error: 'Borrow record not found.' });
    return;
  }

  const user = req.user!;
  const userPerms = ROLE_PERMISSIONS[user.role] || [];
  const canReadAll = userPerms.includes('borrow:read_all');

  if (!canReadAll && record.userId !== user.id) {
    res.status(403).json({ success: false, error: 'Forbidden: You cannot modify another user’s loan.' });
    return;
  }

  const isVip = userPerms.includes('discount:vip');
  const result = store.returnBook(id, undefined, true, isVip);

  if ('error' in result) {
    res.status(400).json({ success: false, error: result.error });
    return;
  }

  store.addAuditLog({
    id: `aud_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    username: user.username,
    role: user.role,
    action: 'BOOK_LOST',
    entity: 'Borrow',
    entityId: id,
    details: `Declared "${result.bookTitle}" lost. Charged 2x book replacement fee of $${result.lostFee}. Total due: $${result.totalFee}.`,
    ipAddress: (req.ip as string) || '127.0.0.1'
  });

  kafkaBroker.produce(
    'bookstore.borrow.events',
    {
      borrowId: id,
      action: 'BOOK_LOST',
      bookTitle: result.bookTitle,
      lostFee: result.lostFee,
      totalFee: result.totalFee
    },
    id,
    { 'event-type': 'BORROW_LOAN_LOST' }
  );

  webhookService.dispatch('borrow:lost', {
    borrowId: id,
    bookTitle: result.bookTitle,
    lostFee: result.lostFee,
    totalFee: result.totalFee
  }).catch(() => {});

  res.json({ success: true, record: result, data: result });
});

export default router;
