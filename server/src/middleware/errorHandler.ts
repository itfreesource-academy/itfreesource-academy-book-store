import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  console.error('[Error Handler]', err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error occurred.';
  const code = err.code || 'SERVER_ERROR';

  res.status(statusCode).json({
    success: false,
    error: message,
    code,
    timestamp: new Date().toISOString()
  });
}
