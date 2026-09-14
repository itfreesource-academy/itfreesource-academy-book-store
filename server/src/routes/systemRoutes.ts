import { Router, Request, Response } from 'express';
import { store } from '../data/store.js';
import { setGlobalLatency, getGlobalLatency } from '../middleware/latency.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure multer for uploads
const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `upload_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// POST /api/v1/system/reset
router.post('/reset', (_req: Request, res: Response): void => {
  store.reset();
  res.json({
    success: true,
    message: 'In-memory database has been reset to initial seed state.',
    timestamp: new Date().toISOString()
  });
});

// GET /api/v1/system/health
router.get('/health', (_req: Request, res: Response): void => {
  res.json({
    status: 'HEALTHY',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    currentLatencyMs: getGlobalLatency()
  });
});

// GET /api/v1/system/stats
router.get('/stats', (_req: Request, res: Response): void => {
  const books = store.getBooks({ limit: 1000 }).books;
  const orders = store.getOrders(undefined, true);
  const users = store.getUsers();
  const reviews = store.getReviews();
  const inventory = store.getInventory();

  const totalRevenue = orders
    .filter(o => !['cancelled', 'refunded'].includes(o.status))
    .reduce((sum, o) => sum + o.total, 0);

  res.json({
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

// POST /api/v1/system/latency
router.post('/latency', (req: Request, res: Response): void => {
  const { delayMs } = req.body;
  if (delayMs === undefined || isNaN(parseInt(delayMs, 10))) {
    res.status(400).json({ success: false, error: 'delayMs parameter is required.' });
    return;
  }
  const ms = parseInt(delayMs, 10);
  setGlobalLatency(ms);
  res.json({ success: true, message: `Global simulated latency set to ${ms}ms.`, latencyMs: ms });
});

// GET /api/v1/system/simulate-error
router.get('/simulate-error', (req: Request, res: Response): void => {
  const statusStr = req.query.status as string;
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

  res.status(statusCode).json({
    success: false,
    ...payload,
    requestedStatusCode: statusCode,
    timestamp: new Date().toISOString()
  });
});

// POST /api/v1/system/upload
router.post('/upload', upload.single('file'), (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ success: false, error: 'No file uploaded.' });
    return;
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    file: {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: fileUrl
    }
  });
});

export default router;
