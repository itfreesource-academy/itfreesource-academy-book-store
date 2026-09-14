import { Router, Request, Response } from 'express';
import { store } from '../data/store.js';
import { authenticateToken, optionalAuthenticateToken, requirePermission, AuthenticatedRequest } from '../middleware/auth.js';
import { ROLE_PERMISSIONS } from '../types/index.js';

const router = Router();

// GET /api/v1/books
router.get('/', optionalAuthenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const {
    search,
    categoryId,
    authorId,
    minPrice,
    maxPrice,
    minRating,
    sortBy,
    page,
    limit,
    isFeatured,
    isVipExclusive
  } = req.query;

  const result = store.getBooks({
    search: typeof search === 'string' ? search : undefined,
    categoryId: typeof categoryId === 'string' ? categoryId : undefined,
    authorId: typeof authorId === 'string' ? authorId : undefined,
    minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
    minRating: minRating ? parseFloat(minRating as string) : undefined,
    sortBy: sortBy as any,
    page: page ? parseInt(page as string, 10) : 1,
    limit: limit ? parseInt(limit as string, 10) : 12,
    isFeatured: isFeatured !== undefined ? isFeatured === 'true' : undefined,
    isVipExclusive: isVipExclusive !== undefined ? isVipExclusive === 'true' : undefined
  });

  res.json({
    success: true,
    ...result
  });
});

// GET /api/v1/books/:id
router.get('/:id', (req: Request, res: Response): void => {
  const id = req.params.id as string;
  const book = store.getBookById(id);
  if (!book) {
    res.status(404).json({
      success: false,
      error: `Book with ID '${id}' not found.`,
      code: 'BOOK_NOT_FOUND'
    });
    return;
  }
  res.json({ success: true, book });
});

// POST /api/v1/books (Requires catalog:create)
router.post('/', authenticateToken, requirePermission('catalog:create'), (req: AuthenticatedRequest, res: Response): void => {
  const {
    title,
    isbn,
    authorId,
    authorName,
    categoryId,
    categoryName,
    price,
    originalPrice,
    stock,
    pages,
    publicationDate,
    coverImage,
    description,
    tags,
    isFeatured,
    isVipExclusive
  } = req.body;

  if (!title || !isbn || !authorId || !categoryId || price === undefined) {
    res.status(400).json({
      success: false,
      error: 'Missing required fields: title, isbn, authorId, categoryId, and price are mandatory.',
      code: 'VALIDATION_ERROR'
    });
    return;
  }

  const category = store.getCategories().find(c => c.id === categoryId);
  const author = store.getAuthors().find(a => a.id === authorId);

  const newBook = store.createBook({
    title,
    isbn,
    authorId,
    authorName: authorName || (author ? author.name : 'Unknown Author'),
    categoryId,
    categoryName: categoryName || (category ? category.name : 'General'),
    price: parseFloat(price),
    originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
    stock: stock !== undefined ? parseInt(stock, 10) : 10,
    pages: pages ? parseInt(pages, 10) : 300,
    publicationDate: publicationDate || new Date().toISOString().split('T')[0],
    coverImage: coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
    description: description || '',
    tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : []),
    isFeatured: Boolean(isFeatured),
    isVipExclusive: Boolean(isVipExclusive)
  });

  store.addAuditLog({
    id: `aud_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    userId: req.user!.id,
    username: req.user!.username,
    role: req.user!.role,
    action: 'BOOK_CREATE',
    entity: 'Book',
    entityId: newBook.id,
    details: `Created new book "${newBook.title}" (ISBN: ${newBook.isbn}) at price $${newBook.price}`,
    ipAddress: (req.ip as string) || '127.0.0.1'
  });

  res.status(201).json({ success: true, book: newBook });
});

// PUT /api/v1/books/:id (Requires catalog:update)
router.put('/:id', authenticateToken, requirePermission('catalog:update'), (req: AuthenticatedRequest, res: Response): void => {
  const id = req.params.id as string;
  const existing = store.getBookById(id);

  if (!existing) {
    res.status(404).json({ success: false, error: 'Book not found' });
    return;
  }

  // Check if price is modified and if user has edit_price permission
  const userPermissions = ROLE_PERMISSIONS[req.user!.role] || [];
  if (req.body.price !== undefined && parseFloat(req.body.price) !== existing.price) {
    if (!userPermissions.includes('catalog:edit_price')) {
      res.status(403).json({
        success: false,
        error: `User role '${req.user!.role}' is not allowed to modify book pricing (Requires 'catalog:edit_price').`,
        code: 'FORBIDDEN_PRICE_EDIT'
      });
      return;
    }
  }

  const updates = { ...req.body };
  if (updates.price) updates.price = parseFloat(updates.price);
  if (updates.stock) updates.stock = parseInt(updates.stock, 10);

  const updated = store.updateBook(id, updates);

  store.addAuditLog({
    id: `aud_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    userId: req.user!.id,
    username: req.user!.username,
    role: req.user!.role,
    action: 'BOOK_UPDATE',
    entity: 'Book',
    entityId: id,
    details: `Updated book "${existing.title}". Modified fields: ${Object.keys(updates).join(', ')}`,
    ipAddress: (req.ip as string) || '127.0.0.1'
  });

  res.json({ success: true, book: updated });
});

// DELETE /api/v1/books/:id (Requires catalog:delete)
router.delete('/:id', authenticateToken, requirePermission('catalog:delete'), (req: AuthenticatedRequest, res: Response): void => {
  const id = req.params.id as string;
  const existing = store.getBookById(id);

  if (!existing) {
    res.status(404).json({ success: false, error: 'Book not found' });
    return;
  }

  store.deleteBook(id);

  store.addAuditLog({
    id: `aud_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    userId: req.user!.id,
    username: req.user!.username,
    role: req.user!.role,
    action: 'BOOK_DELETE',
    entity: 'Book',
    entityId: id,
    details: `Deleted book "${existing.title}" (ID: ${id})`,
    ipAddress: (req.ip as string) || '127.0.0.1'
  });

  res.json({ success: true, message: `Book "${existing.title}" deleted successfully.` });
});

export default router;
