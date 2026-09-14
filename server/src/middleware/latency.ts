import { Request, Response, NextFunction } from 'express';

let globalLatencyMs = 0;

export function setGlobalLatency(ms: number) {
  globalLatencyMs = Math.max(0, ms);
}

export function getGlobalLatency(): number {
  return globalLatencyMs;
}

export function latencySimulator(req: Request, _res: Response, next: NextFunction): void {
  // Check header 'x-mock-delay' or query param 'delay' or globalLatencyMs
  const headerDelay = req.headers['x-mock-delay'];
  const queryDelay = req.query.delay;

  let delay = globalLatencyMs;

  if (typeof headerDelay === 'string' && !isNaN(parseInt(headerDelay, 10))) {
    delay = parseInt(headerDelay, 10);
  } else if (typeof queryDelay === 'string' && !isNaN(parseInt(queryDelay, 10))) {
    delay = parseInt(queryDelay, 10);
  }

  if (delay > 0) {
    setTimeout(next, Math.min(delay, 10000)); // Capped at 10 seconds
  } else {
    next();
  }
}
