import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import { latencySimulator } from './middleware/latency.js';
import { errorHandler } from './middleware/errorHandler.js';

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
const uploadDir = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadDir));

// Interactive Swagger UI endpoints with JWT Bearer Auth and Try-It-Out enabled
const swaggerUiMiddleware = swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'ITFreeSource Academy | Interactive Book Store API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    tryItOutEnabled: true,
    displayRequestDuration: true,
    filter: true
  }
});

// Primary interactive Swagger UI routes (/api/swagger & /api/swagger.html)
app.use('/api/swagger', swaggerUi.serve, swaggerUiMiddleware);
app.get('/api/swagger.html', swaggerUi.serve, swaggerUiMiddleware);
app.get('/api/swagger.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Backward compatibility alias for /api/docs
app.use('/api/docs', swaggerUi.serve, swaggerUiMiddleware);
app.get('/api/docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

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

// In production or if client build exists, serve static React frontend
const clientDist = path.resolve(process.cwd(), '../client/dist');
const altClientDist = path.resolve(process.cwd(), 'public');
const clientPath = fs.existsSync(clientDist) ? clientDist : (fs.existsSync(altClientDist) ? altClientDist : null);

if (clientPath) {
  app.use(express.static(clientPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
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
      documentation: '/api/swagger',
      swaggerHtml: '/api/swagger.html',
      swaggerJson: '/api/swagger.json',
      status: 'online',
      systemReset: 'POST /api/v1/system/reset'
    });
  });
}

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 ITFreeSource Academy Book Store API is live!`);
  console.log(`📡 URL:        http://localhost:${PORT}`);
  console.log(`📚 Swagger UI: http://localhost:${PORT}/api/swagger`);
  console.log(`📄 Swagger HTML: http://localhost:${PORT}/api/swagger.html`);
  console.log(`🔄 DB Reset:   POST http://localhost:${PORT}/api/v1/system/reset`);
  console.log(`=======================================================`);
});

export default app;
