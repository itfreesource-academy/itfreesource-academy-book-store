import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { sign, verify } from 'hono/jwt';
import { store } from './server/src/data/store.js';
import {
  ROLE_PERMISSIONS,
  UserRole,
  Permission,
  Currency,
  Timezone,
  OrderStatus
} from './server/src/types/index.js';
import { swaggerDefinition } from './server/src/config/swagger.js';

interface Fetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

type Bindings = {
  ASSETS: Fetcher;
};

interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
  email: string;
  fullName: string;
}

const JWT_SECRET = 'itfreesource-academy-super-secret-key-2026';
let globalLatencyMs = 0;
const serverStartTime = Date.now();

const app = new Hono<{ Bindings: Bindings }>();

// 1. CORS Middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-mock-delay']
}));

// 2. Latency Simulator Middleware for /api/*
app.use('/api/*', async (c, next) => {
  const headerDelay = c.req.header('x-mock-delay');
  let delay = 0;
  if (headerDelay && !isNaN(parseInt(headerDelay, 10))) {
    delay = parseInt(headerDelay, 10);
  } else if (globalLatencyMs > 0) {
    delay = globalLatencyMs;
  }
  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  await next();
});

// Helper: Extract and verify JWT
async function getAuthUser(c: any): Promise<AuthUser | null> {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = await verify(token, JWT_SECRET, 'HS256');
    return decoded as unknown as AuthUser;
  } catch {
    return null;
  }
}

// Helper: Require authenticated user
async function requireAuth(c: any): Promise<{ user: AuthUser } | Response> {
  const user = await getAuthUser(c);
  if (!user) {
    return c.json({
      success: false,
      error: 'Authentication required. Please provide a Bearer token in the Authorization header.',
      code: 'UNAUTHORIZED'
    }, 401);
  }
  const existing = store.getUserById(user.id);
  if (existing && existing.status === 'suspended') {
    return c.json({
      success: false,
      error: 'Your account has been suspended by an administrator.',
      code: 'ACCOUNT_SUSPENDED'
    }, 403);
  }
  return { user };
}

// Helper: Check permissions
function checkPermission(user: AuthUser, ...requiredPermissions: Permission[]): Response | null {
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  const hasAll = requiredPermissions.every((perm) => userPermissions.includes(perm));
  if (!hasAll) {
    return Response.json({
      success: false,
      error: `Forbidden. Role '${user.role}' lacks required permissions: [${requiredPermissions.join(', ')}].`,
      code: 'FORBIDDEN',
      requiredPermissions,
      userRole: user.role
    }, { status: 403 });
  }
  return null;
}

// ==========================================
// Swagger & Documentation Endpoints
// ==========================================
const swaggerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ITFreeSource Academy | Interactive Book Store API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    .swagger-ui .topbar { display: none }
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #fafafa; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/api/swagger.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        persistAuthorization: true,
        tryItOutEnabled: true,
        displayRequestDuration: true,
        filter: true
      });
    };
  </script>
</body>
</html>`;

app.get('/api/swagger', (c) => c.html(swaggerHtml));
app.get('/api/swagger.html', (c) => c.redirect('/api/swagger', 301));
app.get('/api/docs', (c) => c.redirect('/api/swagger', 301));
app.get('/api/docs/', (c) => c.redirect('/api/swagger', 301));
app.get('/api/docs.json', (c) => c.redirect('/api/swagger.json', 301));
app.get('/api/swagger.json', (c) => c.json(swaggerDefinition));

// ==========================================
// Authentication & RBAC Routes (/api/v1/auth)
// ==========================================

// POST /api/v1/auth/login
app.post('/api/v1/auth/login', async (c) => {
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body.', code: 'INVALID_JSON' }, 400);
  }

  const { username, password } = body;
  if (!username || !password) {
    return c.json({
      success: false,
      error: 'Username and password are required.',
      code: 'MISSING_CREDENTIALS'
    }, 400);
  }

  const user = store.getUserByUsername(username);
  if (!user || user.password !== password) {
    return c.json({
      success: false,
      error: 'Invalid username or password. Please use one of the 10 preconfigured test accounts.',
      code: 'INVALID_CREDENTIALS'
    }, 401);
  }

  if (user.status === 'suspended') {
    return c.json({
      success: false,
      error: 'This account has been suspended by an administrator.',
      code: 'ACCOUNT_SUSPENDED'
    }, 403);
  }

  const token = await sign({
    id: user.id,
    username: user.username,
    role: user.role,
    email: user.email,
    fullName: user.fullName,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
  }, JWT_SECRET, 'HS256');

  const permissions = ROLE_PERMISSIONS[user.role] || [];
  const { password: _, ...userSafe } = user;

  const clientIp = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || '127.0.0.1';
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
    ipAddress: clientIp
  });

  return c.json({
    success: true,
    token,
    user: userSafe,
    permissions
  });
});

// GET /api/v1/auth/me
app.get('/api/v1/auth/me', async (c) => {
  const authRes = await requireAuth(c);
  if (authRes instanceof Response) return authRes;
  const { user } = authRes;

  const fullUser = store.getUserById(user.id);
  if (!fullUser) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }

  const { password: _, ...userSafe } = fullUser;
  const permissions = ROLE_PERMISSIONS[fullUser.role] || [];

  return c.json({
    success: true,
    user: userSafe,
    permissions
  });
});

// GET /api/v1/auth/users
app.get('/api/v1/auth/users', (c) => {
  return c.json({
    success: true,
    users: store.getUsers()
  });
});

// PATCH /api/v1/auth/users/:id/status
app.patch('/api/v1/auth/users/:id/status', async (c) => {
  const authRes = await requireAuth(c);
  if (authRes instanceof Response) return authRes;
  const permErr = checkPermission(authRes.user, 'users:manage');
  if (permErr) return permErr;

  const id = c.req.param('id');
  const { status } = await c.req.json();
  if (!status || !['active', 'suspended'].includes(status)) {
    return c.json({ success: false, error: "Status must be 'active' or 'suspended'." }, 400);
  }

  const updated = store.updateUserStatus(id, status);
  if (!updated) {
    return c.json({ success: false, error: 'User not found.' }, 404);
  }

  const clientIp = c.req.header('cf-connecting-ip') || '127.0.0.1';
  store.addAuditLog({
    id: `aud_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    userId: authRes.user.id,
    username: authRes.user.username,
    role: authRes.user.role,
    action: 'USER_STATUS_CHANGE',
    entity: 'User',
    entityId: id,
    details: `Changed status of user ${updated.username} to ${status}.`,
    ipAddress: clientIp
  });

  const { password: _, ...userSafe } = updated;
  return c.json({ success: true, user: userSafe });
});

// PUT /api/v1/auth/users/:id
app.put('/api/v1/auth/users/:id', async (c) => {
  const authRes = await requireAuth(c);
  if (authRes instanceof Response) return authRes;
  const permErr = checkPermission(authRes.user, 'users:manage');
  if (permErr) return permErr;

  const id = c.req.param('id');
  const { fullName, email, role, status, currency, timezone } = await c.req.json();

  const existing = store.getUserById(id);
  if (!existing) {
    return c.json({ success: false, error: 'User not found.' }, 404);
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
    return c.json({ success: false, error: 'Failed to update user.' }, 400);
  }

  const clientIp = c.req.header('cf-connecting-ip') || '127.0.0.1';
  store.addAuditLog({
    id: `aud_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    userId: authRes.user.id,
    username: authRes.user.username,
    role: authRes.user.role,
    action: 'USER_UPDATE',
    entity: 'User',
    entityId: id,
    details: `Admin updated user @${updated.username}: Name="${updated.fullName}", Role="${updated.role}", Status="${updated.status}", Timezone="${updated.timezone}", Currency="${updated.currency}".`,
    ipAddress: clientIp
  });

  const { password: _, ...userSafe } = updated;
  return c.json({ success: true, user: userSafe });
});

// GET /api/v1/auth/roles
app.get('/api/v1/auth/roles', (c) => {
  return c.json({
    success: true,
    roles: ROLE_PERMISSIONS
  });
});

// ==========================================
// Books & Catalog Routes (/api/v1/books)
// ==========================================

// GET /api/v1/books
app.get('/api/v1/books', (c) => {
  const q = c.req.query();
  const result = store.getBooks({
    search: q.search,
    categoryId: q.categoryId,
    authorId: q.authorId,
    minPrice: q.minPrice ? parseFloat(q.minPrice) : undefined,
    maxPrice: q.maxPrice ? parseFloat(q.maxPrice) : undefined,
    minRating: q.minRating ? parseFloat(q.minRating) : undefined,
    sortBy: q.sortBy as any,
    page: q.page ? parseInt(q.page, 10) : 1,
    limit: q.limit ? parseInt(q.limit, 10) : 12,
    isFeatured: q.isFeatured !== undefined ? q.isFeatured === 'true' : undefined,
    isVipExclusive: q.isVipExclusive !== undefined ? q.isVipExclusive === 'true' : undefined
  });
  return c.json({ success: true, ...result });
});

// GET /api/v1/books/:id
app.get('/api/v1/books/:id', (c) => {
  const id = c.req.param('id');
  const book = store.getBookById(id);
  if (!book) {
    return c.json({
      success: false,
      error: `Book with ID '${id}' not found.`,
      code: 'BOOK_NOT_FOUND'
    }, 404);
  }
  return c.json({ success: true, book });
});

// POST /api/v1/books
app.post('/api/v1/books', async (c) => {
  const authRes = await requireAuth(c);
  if (authRes instanceof Response) return authRes;
  const permErr = checkPermission(authRes.user, 'catalog:create');
  if (permErr) return permErr;

  const body = await c.req.json();
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
  } = body;

  if (!title || !isbn || !authorId || !categoryId || price === undefined) {
    return c.json({
      success: false,
      error: 'Missing required fields: title, isbn, authorId, categoryId, and price are mandatory.',
      code: 'VALIDATION_ERROR'
    }, 400);
  }

  const category = store.getCategories().find((cat) => cat.id === categoryId);
  const author = store.getAuthors().find((a) => a.id === authorId);

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

  const clientIp = c.req.header('cf-connecting-ip') || '127.0.0.1';
  store.addAuditLog({
    id: `aud_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    userId: authRes.user.id,
    username: authRes.user.username,
    role: authRes.user.role,
    action: 'BOOK_CREATE',
    entity: 'Book',
    entityId: newBook.id,
    details: `Created new book "${newBook.title}" (ISBN: ${newBook.isbn}) at price $${newBook.price}`,
    ipAddress: clientIp
  });

  return c.json({ success: true, book: newBook }, 201);
});

// PUT /api/v1/books/:id
app.put('/api/v1/books/:id', async (c) => {
  const authRes = await requireAuth(c);
  if (authRes instanceof Response) return authRes;
  const permErr = checkPermission(authRes.user, 'catalog:update');
  if (permErr) return permErr;

  const id = c.req.param('id');
  const existing = store.getBookById(id);
  if (!existing) {
    return c.json({ success: false, error: 'Book not found' }, 404);
  }

  const body = await c.req.json();
  const userPerms = ROLE_PERMISSIONS[authRes.user.role] || [];
  if (body.price !== undefined && parseFloat(body.price) !== existing.price) {
    if (!userPerms.includes('catalog:edit_price')) {
      return c.json({
        success: false,
        error: `User role '${authRes.user.role}' is not allowed to modify book pricing (Requires 'catalog:edit_price').`,
        code: 'FORBIDDEN_PRICE_EDIT'
      }, 403);
    }
  }

  const updates = { ...body };
  if (updates.price) updates.price = parseFloat(updates.price);
  if (updates.stock) updates.stock = parseInt(updates.stock, 10);

  const updated = store.updateBook(id, updates);
  const clientIp = c.req.header('cf-connecting-ip') || '127.0.0.1';
  store.addAuditLog({
    id: `aud_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    userId: authRes.user.id,
    username: authRes.user.username,
    role: authRes.user.role,
    action: 'BOOK_UPDATE',
    entity: 'Book',
    entityId: id,
    details: `Updated book "${existing.title}". Modified fields: ${Object.keys(updates).join(', ')}`,
    ipAddress: clientIp
  });

  return c.json({ success: true, book: updated });
});

// DELETE /api/v1/books/:id
app.delete('/api/v1/books/:id', async (c) => {
  const authRes = await requireAuth(c);
  if (authRes instanceof Response) return authRes;
  const permErr = checkPermission(authRes.user, 'catalog:delete');
  if (permErr) return permErr;

  const id = c.req.param('id');
  const existing = store.getBookById(id);
  if (!existing) {
    return c.json({ success: false, error: 'Book not found' }, 404);
  }

  store.deleteBook(id);
  const clientIp = c.req.header('cf-connecting-ip') || '127.0.0.1';
  store.addAuditLog({
    id: `aud_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    userId: authRes.user.id,
    username: authRes.user.username,
    role: authRes.user.role,
    action: 'BOOK_DELETE',
    entity: 'Book',
    entityId: id,
    details: `Deleted book "${existing.title}" (ID: ${id})`,
    ipAddress: clientIp
  });

  return c.json({ success: true, message: `Book "${existing.title}" deleted successfully.` });
});

// ==========================================
// Categories & Authors Routes
// ==========================================

app.get('/api/v1/categories', (c) => c.json({ success: true, categories: store.getCategories() }));

app.post('/api/v1/categories', async (c) => {
  const authRes = await requireAuth(c);
  if (authRes instanceof Response) return authRes;
  const permErr = checkPermission(authRes.user, 'catalog:create');
  if (permErr) return permErr;

  const { name, description } = await c.req.json();
  if (!name) return c.json({ success: false, error: 'Category name is required.' }, 400);

  const newCat = store.createCategory(name, description || '');
  return c.json({ success: true, category: newCat }, 201);
});

app.get('/api/v1/authors', (c) => c.json({ success: true, authors: store.getAuthors() }));

app.post('/api/v1/authors', async (c) => {
  const authRes = await requireAuth(c);
  if (authRes instanceof Response) return authRes;
  const permErr = checkPermission(authRes.user, 'catalog:create');
  if (permErr) return permErr;

  const { name, bio, photo, nationality } = await c.req.json();
  if (!name) return c.json({ success: false, error: 'Author name is required.' }, 400);

  const newAuthor = store.createAuthor(
    name,
    bio || '',
    photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    nationality || 'International'
  );
  return c.json({ success: true, author: newAuthor }, 201);
});

// ==========================================
// Book Borrowing & Loans Routes (/api/v1/borrow)
// ==========================================

app.get('/api/v1/borrow', async (c) => {
  const authRes = await requireAuth(c);
  if (authRes instanceof Response) return authRes;

  const userPerms = ROLE_PERMISSIONS[authRes.user.role] || [];
  const canReadAll = userPerms.includes('borrow:read_all');
  const records = store.getBorrowRecords(authRes.user.id, canReadAll);
  return c.json({ success: true, records, data: records, total: records.length });
});

app.post('/api/v1/borrow', async (c) => {
  const authRes = await requireAuth(c);
  if (authRes instanceof Response) return authRes;
  const permErr = checkPermission(authRes.user, 'borrow:create');
  if (permErr) return permErr;

  const { bookId, timezone, currency } = await c.req.json();
  if (!bookId) return c.json({ success: false, error: 'bookId is required.' }, 400);

  const userPerms = ROLE_PERMISSIONS[authRes.user.role] || [];
  const isVip = userPerms.includes('discount:vip');

  const fullUser = store.getUserById(authRes.user.id);
  const userTz: Timezone = timezone || (fullUser?.timezone || 'America/New_York');
  const userCurr: Currency = currency || (fullUser?.currency || 'USD');

  const result = store.borrowBook(authRes.user.id, authRes.user.username, bookId, userTz, userCurr, isVip);
  if ('error' in result) {
    return c.json({ success: false, error: result.error }, 400);
  }

  const clientIp = c.req.header('cf-connecting-ip') || '127.0.0.1';
  store.addAuditLog({
    id: `aud_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    userId: authRes.user.id,
    username: authRes.user.username,
    role: authRes.user.role,
    action: 'BOOK_BORROW',
    entity: 'Borrow',
    entityId: result.id,
    details: `User @${authRes.user.username} borrowed "${result.bookTitle}". Due Date: ${result.dueDate}. Base Fee: $${result.standardFee.toFixed(2)} (${userCurr}).`,
    ipAddress: clientIp
  });

  return c.json({ success: true, record: result, data: result }, 201);
});

app.get('/api/v1/borrow/:id/preview-fee', async (c) => {
  const authRes = await requireAuth(c);
  if (authRes instanceof Response) return authRes;

  const id = c.req.param('id');
  const returnDate = c.req.query('returnDate');
  const isLost = c.req.query('isLost');

  const record = store.getBorrowRecordById(id);
  if (!record) return c.json({ success: false, error: 'Borrow record not found.' }, 404);

  const userPerms = ROLE_PERMISSIONS[authRes.user.role] || [];
  const isVip = userPerms.includes('discount:vip');

  const calculation = store.calculateBorrowFee(
    record,
    returnDate,
    isLost === 'true',
    isVip
  );

  const feeSummary = {
    ...calculation,
    daysLate: calculation.overdueDays,
    penaltyFee: calculation.lateFee,
    isOverdue: calculation.overdueDays > 0
  };

  return c.json({
    success: true,
    recordId: record.id,
    bookTitle: record.bookTitle,
    calculation,
    feeSummary
  });
});

app.post('/api/v1/borrow/:id/return', async (c) => {
  const authRes = await requireAuth(c);
  if (authRes instanceof Response) return authRes;
  const permErr = checkPermission(authRes.user, 'borrow:return');
  if (permErr) return permErr;

  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const { returnDate } = body;

  const record = store.getBorrowRecordById(id);
  if (!record) return c.json({ success: false, error: 'Borrow record not found.' }, 404);

  const userPerms = ROLE_PERMISSIONS[authRes.user.role] || [];
  const canReadAll = userPerms.includes('borrow:read_all');
  if (!canReadAll && record.userId !== authRes.user.id) {
    return c.json({ success: false, error: 'Forbidden: You cannot return another user’s book loan.' }, 403);
  }

  const isVip = userPerms.includes('discount:vip');
  const result = store.returnBook(id, returnDate, false, isVip);
  if ('error' in result) {
    return c.json({ success: false, error: result.error }, 400);
  }

  const clientIp = c.req.header('cf-connecting-ip') || '127.0.0.1';
  store.addAuditLog({
    id: `aud_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    userId: authRes.user.id,
    username: authRes.user.username,
    role: authRes.user.role,
    action: 'BOOK_RETURN',
    entity: 'Borrow',
    entityId: id,
    details: `Returned "${result.bookTitle}". Standard Fee: $${result.standardFee}, Late Fee: $${result.lateFee}, Total Fee: $${result.totalFee}.`,
    ipAddress: clientIp
  });

  return c.json({ success: true, record: result, data: result });
});

app.post('/api/v1/borrow/:id/lost', async (c) => {
  const authRes = await requireAuth(c);
  if (authRes instanceof Response) return authRes;
  const permErr = checkPermission(authRes.user, 'borrow:return');
  if (permErr) return permErr;

  const id = c.req.param('id');
  const record = store.getBorrowRecordById(id);
  if (!record) return c.json({ success: false, error: 'Borrow record not found.' }, 404);

  const userPerms = ROLE_PERMISSIONS[authRes.user.role] || [];
  const canReadAll = userPerms.includes('borrow:read_all');
  if (!canReadAll && record.userId !== authRes.user.id) {
    return c.json({ success: false, error: 'Forbidden: You cannot modify another user’s loan.' }, 403);
  }

  const isVip = userPerms.includes('discount:vip');
  const result = store.returnBook(id, undefined, true, isVip);
  if ('error' in result) {
    return c.json({ success: false, error: result.error }, 400);
  }

  const clientIp = c.req.header('cf-connecting-ip') || '127.0.0.1';
  store.addAuditLog({
    id: `aud_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    userId: authRes.user.id,
    username: authRes.user.username,
    role: authRes.user.role,
    action: 'BOOK_LOST',
    entity: 'Borrow',
    entityId: id,
    details: `Declared "${result.bookTitle}" lost. Charged 2x book replacement fee of $${result.lostFee}. Total due: $${result.totalFee}.`,
    ipAddress: clientIp
  });

  return c.json({ success: true, record: result, data: result });
});

// ==========================================
// Orders Routes (/api/v1/orders)
// ==========================================

app.get('/api/v1/orders', async (c) => {
  const authRes = await requireAuth(c);
  if (authRes instanceof Response) return authRes;

  const userPerms = ROLE_PERMISSIONS[authRes.user.role] || [];
  const canReadAll = userPerms.includes('orders:read_all');
  const orders = store.getOrders(authRes.user.id, canReadAll);
  return c.json({ success: true, orders });
});

app.get('/api/v1/orders/:id', async (c) => {
  const authRes = await requireAuth(c);
  if (authRes instanceof Response) return authRes;

  const id = c.req.param('id');
  const order = store.getOrderById(id);
  if (!order) return c.json({ success: false, error: 'Order not found.' }, 404);

  const userPerms = ROLE_PERMISSIONS[authRes.user.role] || [];
  const canReadAll = userPerms.includes('orders:read_all');
  if (!canReadAll && order.userId !== authRes.user.id) {
    return c.json({ success: false, error: 'Forbidden: You cannot access other users’ orders.' }, 403);
  }

  return c.json({ success: true, order });
});

app.post('/api/v1/orders', async (c) => {
  const authRes = await requireAuth(c);
  if (authRes instanceof Response) return authRes;

  const body = await c.req.json();
  const { items, shippingAddress, deliveryDate, paymentMethod } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return c.json({ success: false, error: 'Cart must contain at least one item.' }, 400);
  }
  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street) {
    return c.json({ success: false, error: 'Complete shipping address is required.' }, 400);
  }

  let subtotal = 0;
  const verifiedItems = items.map((item: any) => {
    const book = store.getBookById(item.bookId);
    const price = book ? book.price : item.price || 0;
    subtotal += price * (item.quantity || 1);
    return {
      bookId: item.bookId,
      title: book ? book.title : item.title,
      price,
      quantity: item.quantity || 1,
      coverImage: book ? book.coverImage : item.coverImage
    };
  });

  const userPerms = ROLE_PERMISSIONS[authRes.user.role] || [];
  const hasVipDiscount = userPerms.includes('discount:vip');
  const discount = hasVipDiscount ? parseFloat((subtotal * 0.20).toFixed(2)) : 0;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = parseFloat((taxableAmount * 0.08).toFixed(2));
  const total = parseFloat((taxableAmount + tax).toFixed(2));

  const newOrder = store.createOrder({
    userId: authRes.user.id,
    username: authRes.user.username,
    items: verifiedItems,
    subtotal: parseFloat(subtotal.toFixed(2)),
    discount,
    tax,
    total,
    shippingAddress,
    deliveryDate: deliveryDate || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    paymentMethod: paymentMethod || 'Credit Card (Sandbox)',
    status: 'pending'
  });

  const clientIp = c.req.header('cf-connecting-ip') || '127.0.0.1';
  store.addAuditLog({
    id: `aud_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    userId: authRes.user.id,
    username: authRes.user.username,
    role: authRes.user.role,
    action: 'ORDER_PLACED',
    entity: 'Order',
    entityId: newOrder.id,
    details: `Placed order ${newOrder.orderNumber} for $${newOrder.total} (${verifiedItems.length} items). VIP discount: $${discount}`,
    ipAddress: clientIp
  });

  return c.json({ success: true, order: newOrder }, 201);
});

app.patch('/api/v1/orders/:id/status', async (c) => {
  const authRes = await requireAuth(c);
  if (authRes instanceof Response) return authRes;
  const permErr = checkPermission(authRes.user, 'orders:update_status');
  if (permErr) return permErr;

  const id = c.req.param('id');
  const { status, trackingNumber } = await c.req.json();
  const validStatuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
  if (!status || !validStatuses.includes(status)) {
    return c.json({ success: false, error: `Invalid status. Must be one of: [${validStatuses.join(', ')}]` }, 400);
  }

  const updated = store.updateOrderStatus(id, status, trackingNumber);
  if (!updated) return c.json({ success: false, error: 'Order not found.' }, 404);

  const clientIp = c.req.header('cf-connecting-ip') || '127.0.0.1';
  store.addAuditLog({
    id: `aud_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    userId: authRes.user.id,
    username: authRes.user.username,
    role: authRes.user.role,
    action: 'ORDER_STATUS_UPDATE',
    entity: 'Order',
    entityId: id,
    details: `Updated order ${updated.orderNumber} status to "${status}". Tracking: ${trackingNumber || 'N/A'}`,
    ipAddress: clientIp
  });

  return c.json({ success: true, order: updated });
});

app.post('/api/v1/orders/:id/cancel', async (c) => {
  const authRes = await requireAuth(c);
  if (authRes instanceof Response) return authRes;

  const id = c.req.param('id');
  const order = store.getOrderById(id);
  if (!order) return c.json({ success: false, error: 'Order not found.' }, 404);

  const userPerms = ROLE_PERMISSIONS[authRes.user.role] || [];
  const canCancelAny = userPerms.includes('orders:cancel');
  if (!canCancelAny && order.userId !== authRes.user.id) {
    return c.json({ success: false, error: 'Forbidden: You cannot cancel another customer’s order.' }, 403);
  }

  if (['shipped', 'delivered', 'refunded'].includes(order.status)) {
    return c.json({ success: false, error: `Cannot cancel an order that is already in '${order.status}' status.` }, 400);
  }

  const updated = store.updateOrderStatus(id, 'cancelled');
  const clientIp = c.req.header('cf-connecting-ip') || '127.0.0.1';
  store.addAuditLog({
    id: `aud_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    userId: authRes.user.id,
    username: authRes.user.username,
    role: authRes.user.role,
    action: 'ORDER_CANCELLED',
    entity: 'Order',
    entityId: id,
    details: `Order ${order.orderNumber} was cancelled by ${authRes.user.username}.`,
    ipAddress: clientIp
  });

  return c.json({ success: true, order: updated });
});

app.post('/api/v1/orders/:id/refund', async (c) => {
  const authRes = await requireAuth(c);
  if (authRes instanceof Response) return authRes;
  const permErr = checkPermission(authRes.user, 'orders:refund');
  if (permErr) return permErr;

  const id = c.req.param('id');
  const order = store.getOrderById(id);
  if (!order) return c.json({ success: false, error: 'Order not found.' }, 404);

  const updated = store.updateOrderStatus(id, 'refunded');
  const clientIp = c.req.header('cf-connecting-ip') || '127.0.0.1';
  store.addAuditLog({
    id: `aud_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    userId: authRes.user.id,
    username: authRes.user.username,
    role: authRes.user.role,
    action: 'ORDER_REFUNDED',
    entity: 'Order',
    entityId: id,
    details: `Issued full refund of $${order.total} for order ${order.orderNumber}.`,
    ipAddress: clientIp
  });

  return c.json({ success: true, order: updated });
});

// ==========================================
// Inventory Routes (/api/v1/inventory)
// ==========================================

app.get('/api/v1/inventory', async (c) => {
  const authRes = await requireAuth(c);
  if (authRes instanceof Response) return authRes;
  const permErr = checkPermission(authRes.user, 'inventory:read');
  if (permErr) return permErr;

  return c.json({ success: true, ...store.getInventory() });
});

app.patch('/api/v1/inventory/:id/stock', async (c) => {
  const authRes = await requireAuth(c);
  if (authRes instanceof Response) return authRes;
  const permErr = checkPermission(authRes.user, 'inventory:update');
  if (permErr) return permErr;

  const id = c.req.param('id');
  const { stock } = await c.req.json();
  if (stock === undefined || isNaN(parseInt(stock, 10))) {
    return c.json({ success: false, error: 'Valid stock number is required.' }, 400);
  }

  const updated = store.updateStock(id, parseInt(stock, 10));
  if (!updated) return c.json({ success: false, error: 'Book not found in inventory.' }, 404);

  const clientIp = c.req.header('cf-connecting-ip') || '127.0.0.1';
  store.addAuditLog({
    id: `aud_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    userId: authRes.user.id,
    username: authRes.user.username,
    role: authRes.user.role,
    action: 'INVENTORY_ADJUST',
    entity: 'Inventory',
    entityId: id,
    details: `Updated stock level for "${updated.title}" to ${updated.stock} units.`,
    ipAddress: clientIp
  });

  return c.json({ success: true, book: updated });
});

// ==========================================
// Reviews Routes (/api/v1/reviews)
// ==========================================

app.get('/api/v1/reviews', (c) => {
  const bookId = c.req.query('bookId');
  const status = c.req.query('status');
  return c.json({ success: true, reviews: store.getReviews(bookId, status as any) });
});

app.post('/api/v1/reviews', async (c) => {
  const authRes = await requireAuth(c);
  if (authRes instanceof Response) return authRes;
  const permErr = checkPermission(authRes.user, 'reviews:create');
  if (permErr) return permErr;

  const { bookId, rating, title, comment } = await c.req.json();
  if (!bookId || !rating || !title || !comment) {
    return c.json({ success: false, error: 'bookId, rating, title, and comment are required.' }, 400);
  }

  const book = store.getBookById(bookId);
  if (!book) return c.json({ success: false, error: 'Book not found.' }, 404);

  const isAutoApproved = ['admin', 'book_reviewer', 'store_manager'].includes(authRes.user.role);
  const newReview = store.createReview(
    {
      bookId,
      userId: authRes.user.id,
      username: authRes.user.username,
      userAvatar: store.getUserById(authRes.user.id)?.avatar,
      rating: Math.min(5, Math.max(1, parseInt(rating, 10))),
      title,
      comment
    },
    isAutoApproved
  );

  const clientIp = c.req.header('cf-connecting-ip') || '127.0.0.1';
  store.addAuditLog({
    id: `aud_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    userId: authRes.user.id,
    username: authRes.user.username,
    role: authRes.user.role,
    action: 'REVIEW_SUBMIT',
    entity: 'Review',
    entityId: newReview.id,
    details: `Submitted ${newReview.rating}-star review for "${book.title}". Status: ${newReview.status}`,
    ipAddress: clientIp
  });

  return c.json({ success: true, review: newReview }, 201);
});

app.patch('/api/v1/reviews/:id/status', async (c) => {
  const authRes = await requireAuth(c);
  if (authRes instanceof Response) return authRes;
  const permErr = checkPermission(authRes.user, 'reviews:moderate');
  if (permErr) return permErr;

  const id = c.req.param('id');
  const { status } = await c.req.json();
  if (!status || !['approved', 'rejected'].includes(status)) {
    return c.json({ success: false, error: "Status must be either 'approved' or 'rejected'." }, 400);
  }

  const updated = store.updateReviewStatus(id, status);
  if (!updated) return c.json({ success: false, error: 'Review not found.' }, 404);

  const clientIp = c.req.header('cf-connecting-ip') || '127.0.0.1';
  store.addAuditLog({
    id: `aud_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    userId: authRes.user.id,
    username: authRes.user.username,
    role: authRes.user.role,
    action: 'REVIEW_MODERATE',
    entity: 'Review',
    entityId: id,
    details: `Review ${id} was set to ${status}.`,
    ipAddress: clientIp
  });

  return c.json({ success: true, review: updated });
});

// ==========================================
// Audit Logs Routes (/api/v1/audit-logs)
// ==========================================

app.get('/api/v1/audit-logs', async (c) => {
  const authRes = await requireAuth(c);
  if (authRes instanceof Response) return authRes;
  const permErr = checkPermission(authRes.user, 'audit:read');
  if (permErr) return permErr;

  const logs = store.getAuditLogs();
  return c.json({ success: true, total: logs.length, logs });
});

// ==========================================
// System & Sandbox Routes (/api/v1/system)
// ==========================================

app.post('/api/v1/system/reset', (c) => {
  store.reset();
  return c.json({
    success: true,
    message: 'In-memory database has been reset to initial seed state.',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/v1/system/health', (c) => {
  return c.json({
    status: 'HEALTHY',
    uptimeSeconds: Math.floor((Date.now() - serverStartTime) / 1000),
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    currentLatencyMs: globalLatencyMs
  });
});

app.get('/api/v1/system/stats', (c) => {
  const books = store.getBooks({ limit: 1000 }).books;
  const orders = store.getOrders(undefined, true);
  const users = store.getUsers();
  const reviews = store.getReviews();
  const inventory = store.getInventory();

  const totalRevenue = orders
    .filter((o) => !['cancelled', 'refunded'].includes(o.status))
    .reduce((sum, o) => sum + o.total, 0);

  return c.json({
    success: true,
    stats: {
      totalBooks: books.length,
      totalOrders: orders.length,
      totalUsers: users.length,
      totalReviews: reviews.length,
      totalStockUnits: inventory.totalStock,
      lowStockCount: inventory.lowStockCount,
      totalRevenue: parseFloat(totalRevenue.toFixed(2))
    }
  });
});

app.post('/api/v1/system/latency', async (c) => {
  const { delayMs } = await c.req.json();
  if (delayMs === undefined || isNaN(parseInt(delayMs, 10))) {
    return c.json({ success: false, error: 'delayMs parameter is required.' }, 400);
  }
  globalLatencyMs = parseInt(delayMs, 10);
  return c.json({
    success: true,
    message: `Global simulated latency set to ${globalLatencyMs}ms.`,
    latencyMs: globalLatencyMs
  });
});

app.get('/api/v1/system/simulate-error', (c) => {
  const statusStr = c.req.query('status');
  const statusCode = statusStr ? parseInt(statusStr, 10) : 500;

  const errorMap: Record<number, { error: string; code: string }> = {
    400: { error: 'Simulated 400 Bad Request: Malformed test payload.', code: 'SIMULATED_BAD_REQUEST' },
    401: { error: 'Simulated 401 Unauthorized: Missing test session credentials.', code: 'SIMULATED_UNAUTHORIZED' },
    403: { error: 'Simulated 403 Forbidden: Test persona does not possess adequate role permissions.', code: 'SIMULATED_FORBIDDEN' },
    404: { error: 'Simulated 404 Not Found: The requested test resource was not located.', code: 'SIMULATED_NOT_FOUND' },
    429: { error: 'Simulated 429 Too Many Requests: Rate limit quota exceeded (100 req/min).', code: 'SIMULATED_RATE_LIMIT' },
    500: { error: 'Simulated 500 Internal Server Error: Unhandled backend fault in test harness.', code: 'SIMULATED_INTERNAL_ERROR' },
    503: { error: 'Simulated 503 Service Unavailable: Database connection pool currently saturated.', code: 'SIMULATED_SERVICE_UNAVAILABLE' }
  };

  const payload = errorMap[statusCode] || {
    error: `Simulated error with status code ${statusCode}`,
    code: 'SIMULATED_ERROR'
  };

  return c.json({
    success: false,
    ...payload,
    requestedStatusCode: statusCode,
    timestamp: new Date().toISOString()
  }, (statusCode >= 400 && statusCode <= 599 ? statusCode : 500) as any);
});

app.post('/api/v1/system/upload', (c) => {
  return c.json({
    success: true,
    file: {
      originalName: 'uploaded_file.png',
      mimeType: 'image/png',
      size: 1024,
      url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80'
    }
  });
});

// ==========================================
// Coverage Endpoints (/api/v1/coverage)
// ==========================================

app.get('/api/v1/coverage/summary', (c) => {
  return c.json({
    success: true,
    timestamp: new Date().toISOString(),
    metrics: {
      linesPct: 88.5,
      statementsPct: 87.2,
      functionsPct: 89.0,
      branchesPct: 78.4,
      totalTests: 40,
      passedTests: 40,
      failedTests: 0,
      testSuites: 4,
      passRate: 100
    },
    modules: [
      {
        name: 'Book Borrowing & Return Engine',
        path: 'src/routes/borrowRoutes.ts',
        description: '$2.00 10-day loan, $0.10/day overdue penalty, 2x lost fee',
        lines: 92.0,
        functions: 90.0,
        branches: 85.0
      },
      {
        name: 'Authentication & 10 Personas RBAC',
        path: 'src/routes/authRoutes.ts',
        description: 'JWT tokens, role permissions, Admin user details editing',
        lines: 95.0,
        functions: 94.0,
        branches: 88.0
      },
      {
        name: 'In-Memory Data Store & Seed Matrix',
        path: 'src/data/store.ts',
        description: 'Centralized state, immutable audit logging, system reset',
        lines: 98.0,
        functions: 95.0,
        branches: 92.0
      }
    ],
    htmlReportUrl: '/reports/coverage/index.html',
    cloudIntegrations: {
      codecov: 'https://codecov.io/gh/itfreesource-academy/itfreesource-academy-book-store',
      githubActions: 'https://github.com/itfreesource-academy/itfreesource-academy-book-store/actions',
      repository: 'https://github.com/itfreesource-academy/itfreesource-academy-book-store'
    }
  });
});

const externalSuiteReports: any[] = [
  {
    id: 'ext_pw_01',
    name: 'Playwright E2E Regression Suite',
    tool: 'playwright',
    timestamp: new Date().toISOString(),
    totalTests: 45,
    passedTests: 45,
    failedTests: 0,
    durationMs: 14200,
    coveragePct: 88.5,
    details: {
      suites: ['User RBAC Matrix', 'Borrowing Calculator', 'VIP Cart Discounts', 'Shadow DOM Piercing']
    }
  },
  {
    id: 'ext_postman_01',
    name: 'Postman / Newman API Collection Run',
    tool: 'postman',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    totalTests: 32,
    passedTests: 32,
    failedTests: 0,
    durationMs: 3850,
    coveragePct: 94.0,
    details: {
      collection: 'ITFreeSource Academy Book Store API v1'
    }
  }
];

app.get('/api/v1/coverage/external', (c) => {
  return c.json({ success: true, reports: externalSuiteReports });
});

app.post('/api/v1/coverage/external', async (c) => {
  const { name, tool, totalTests, passedTests, failedTests, durationMs, coveragePct, details } = await c.req.json();
  if (!name || totalTests === undefined || passedTests === undefined) {
    return c.json({ success: false, error: 'name, totalTests, and passedTests are required.' }, 400);
  }
  const newReport = {
    id: `ext_${Date.now().toString(36)}`,
    name,
    tool: tool || 'playwright',
    timestamp: new Date().toISOString(),
    totalTests: Number(totalTests),
    passedTests: Number(passedTests),
    failedTests: Number(failedTests || 0),
    durationMs: durationMs ? Number(durationMs) : undefined,
    coveragePct: coveragePct ? Number(coveragePct) : undefined,
    details
  };
  externalSuiteReports.unshift(newReport);
  return c.json({
    success: true,
    message: 'External automation report imported successfully.',
    report: newReport
  }, 201);
});

// ==========================================
// Static Assets & Single Page App Fallback
// ==========================================
app.all('*', async (c) => {
  if (c.env && c.env.ASSETS) {
    const res = await c.env.ASSETS.fetch(c.req.raw);
    if (res.status === 404 && !c.req.path.startsWith('/api')) {
      const url = new URL(c.req.url);
      url.pathname = '/index.html';
      return await c.env.ASSETS.fetch(new Request(url.toString(), c.req.raw));
    }
    return res;
  }
  return c.text('Not Found', 404);
});

export default app;
