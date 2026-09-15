import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { swaggerSpec } from './config/swagger.js';
import { latencySimulator } from './middleware/latency.js';
import { errorHandler } from './middleware/errorHandler.js';

const serverDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import authorRoutes from './routes/authorRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import systemRoutes from './routes/systemRoutes.js';
import borrowRoutes from './routes/borrowRoutes.js';
import coverageRoutes from './routes/coverageRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-mock-delay']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
const candidateUploadDirs = [
  path.resolve(process.cwd(), 'uploads'),
  path.resolve(process.cwd(), 'server/uploads'),
  path.resolve(serverDir, '../uploads'),
  path.resolve(serverDir, '../../uploads')
];
const uploadDir = candidateUploadDirs.find(dir => fs.existsSync(dir)) || path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  try { fs.mkdirSync(uploadDir, { recursive: true }); } catch { /* ignore */ }
}
app.use('/uploads', express.static(uploadDir));

// Serve interactive Istanbul HTML Coverage Reports at /reports/coverage
const candidateCoverageDirs = [
  path.resolve(process.cwd(), 'server/coverage'),
  path.resolve(process.cwd(), 'coverage'),
  path.resolve(serverDir, '../coverage'),
  path.resolve(serverDir, '../../server/coverage')
];
const coverageDir = candidateCoverageDirs.find(dir => fs.existsSync(dir)) || path.resolve(process.cwd(), 'coverage');
app.use('/reports/coverage', express.static(coverageDir));

// Self-contained Swagger UI HTML with CDN assets (guarantees zero missing asset 404 errors)
const swaggerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ITFreeSource Academy | Interactive Book Store API Documentation</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui.min.css" />
  <style>
    .swagger-ui .topbar { display: none }
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #fafafa; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-bundle.min.js" crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-standalone-preset.min.js" crossorigin="anonymous"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/api/swagger.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "StandaloneLayout",
        persistAuthorization: true,
        tryItOutEnabled: true,
        displayRequestDuration: true,
        filter: true
      });
    };
  </script>
</body>
</html>`;

app.get('/api/swagger.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.get(['/api/swagger', '/api/swagger/'], (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(swaggerHtml);
});

// 301 Permanent Redirects for legacy aliases (/api/swagger.html, /api/docs) to /api/swagger
app.get(['/api/swagger.html', '/api/docs', '/api/docs/'], (_req, res) => res.redirect(301, '/api/swagger'));
app.get('/api/docs.json', (_req, res) => res.redirect(301, '/api/swagger.json'));

// Network latency simulator middleware for all /api routes
app.use('/api', latencySimulator);

// API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/books', bookRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/authors', authorRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/borrow', borrowRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/audit-logs', auditRoutes);
app.use('/api/v1/system', systemRoutes);
app.use('/api/v1/coverage', coverageRoutes);

// In production or if client build exists, serve static React frontend
const candidateClientDirs = [
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), '../client/dist'),
  path.resolve(serverDir, '../../client/dist'),
  path.resolve(serverDir, '../../../client/dist'),
  path.resolve(process.cwd(), 'public'),
  path.resolve(process.cwd(), 'server/public'),
  path.resolve(serverDir, '../public')
];
const clientPath = candidateClientDirs.find(dir => fs.existsSync(dir) && fs.existsSync(path.join(dir, 'index.html'))) || null;

if (clientPath) {
  console.log(`📦 Serving React frontend from: ${clientPath}`);
  app.use(express.static(clientPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/reports')) {
      return next();
    }
    res.sendFile(path.join(clientPath, 'index.html'));
  });
} else {
  // Root health & info redirect when client is not built
  app.get('/', (_req, res) => {
    res.json({
      name: 'ITFreeSource Academy Book Store API',
      version: '1.0.0',
      swaggerUi: '/api/swagger',
      swaggerJson: '/api/swagger.json',
      status: 'online',
      systemReset: 'POST /api/v1/system/reset'
    });
  });
}

// Error handling middleware
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 ITFreeSource Academy Book Store API is live!`);
    console.log(`📡 URL:          http://localhost:${PORT}`);
    console.log(`📚 Swagger UI:   http://localhost:${PORT}/api/swagger`);
    console.log(`📄 Swagger JSON: http://localhost:${PORT}/api/swagger.json`);
    console.log(`🔄 DB Reset:     POST http://localhost:${PORT}/api/v1/system/reset`);
    console.log(`=======================================================`);
  });
}

export default app;
