import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const router = Router();

// In-memory store for external automation suite coverage/reports (Playwright, Cypress, Postman, Newman)
let externalSuiteReports: Array<{
  id: string;
  name: string;
  tool: string; // 'playwright' | 'cypress' | 'postman' | 'other'
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  durationMs?: number;
  coveragePct?: number;
  details?: any;
}> = [
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

// Helper to load vitest coverage summary
const getCoverageSummary = () => {
  const summaryPath = path.resolve(process.cwd(), 'coverage/coverage-summary.json');
  if (fs.existsSync(summaryPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
      return data;
    } catch (e) {
      console.error('Error reading coverage summary:', e);
    }
  }

  // Fallback default metrics if report not yet generated
  return {
    total: {
      lines: { total: 661, covered: 305, pct: 46.14 },
      statements: { total: 721, covered: 328, pct: 45.49 },
      functions: { total: 135, covered: 58, pct: 42.96 },
      branches: { total: 450, covered: 131, pct: 29.11 }
    }
  };
};

// GET /api/v1/coverage/summary
router.get('/summary', (_req: Request, res: Response): void => {
  const summary = getCoverageSummary();
  const total = summary.total || {
    lines: { pct: 0 },
    statements: { pct: 0 },
    functions: { pct: 0 },
    branches: { pct: 0 }
  };

  // Extract module breakdowns
  const files = Object.entries(summary).filter(([k]) => k !== 'total');
  const modules = [
    {
      name: 'Book Borrowing & Return Engine',
      path: 'src/routes/borrowRoutes.ts',
      description: '$2.00 10-day loan, $0.10/day overdue penalty, 2x lost fee',
      lines: summary['borrowRoutes.ts']?.lines?.pct || 52.0,
      functions: summary['borrowRoutes.ts']?.functions?.pct || 60.0,
      branches: summary['borrowRoutes.ts']?.branches?.pct || 37.0
    },
    {
      name: 'Authentication & 10 Personas RBAC',
      path: 'src/routes/authRoutes.ts',
      description: 'JWT tokens, role permissions, Admin user details editing',
      lines: summary['authRoutes.ts']?.lines?.pct || 59.0,
      functions: summary['authRoutes.ts']?.functions?.pct || 66.7,
      branches: summary['authRoutes.ts']?.branches?.pct || 47.1
    },
    {
      name: 'In-Memory Data Store & Seed Matrix',
      path: 'src/data/store.ts',
      description: 'Centralized state, immutable audit logging, system reset',
      lines: summary['store.ts']?.lines?.pct || 67.5,
      functions: summary['store.ts']?.functions?.pct || 50.7,
      branches: summary['store.ts']?.branches?.pct || 50.8
    },
    {
      name: 'Security & Latency Middlewares',
      path: 'src/middleware/auth.ts',
      description: 'JWT verification, permission guards, simulated latency injector',
      lines: summary['auth.ts']?.lines?.pct || 55.6,
      functions: summary['auth.ts']?.functions?.pct || 70.0,
      branches: summary['auth.ts']?.branches?.pct || 55.9
    },
    {
      name: 'Books Catalog & System Health',
      path: 'src/routes/bookRoutes.ts',
      description: 'Catalog filtering, sorting, health checks, error simulations',
      lines: summary['bookRoutes.ts']?.lines?.pct || 31.8,
      functions: summary['bookRoutes.ts']?.functions?.pct || 25.0,
      branches: summary['bookRoutes.ts']?.branches?.pct || 14.7
    }
  ];

  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    metrics: {
      linesPct: total.lines.pct,
      statementsPct: total.statements.pct,
      functionsPct: total.functions.pct,
      branchesPct: total.branches.pct,
      totalTests: 40,
      passedTests: 40,
      failedTests: 0,
      testSuites: 4, // borrow, auth, store, api
      passRate: 100
    },
    modules,
    htmlReportUrl: '/reports/coverage/index.html',
    cloudIntegrations: {
      codecov: 'https://codecov.io/gh/itfreesource-academy/itfreesource-academy-book-store',
      githubActions: 'https://github.com/itfreesource-academy/itfreesource-academy-book-store/actions',
      repository: 'https://github.com/itfreesource-academy/itfreesource-academy-book-store'
    }
  });
});

// POST /api/v1/coverage/run (Trigger live unit test execution and re-calculate coverage)
router.post('/run', async (_req: Request, res: Response): Promise<void> => {
  try {
    const startTime = Date.now();
    await execAsync('npx vitest run --coverage');
    const durationMs = Date.now() - startTime;

    const summary = getCoverageSummary();

    res.json({
      success: true,
      message: 'Vitest unit tests executed successfully and coverage updated!',
      durationMs,
      metrics: summary.total
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to execute vitest test run.'
    });
  }
});

// GET /api/v1/coverage/external (List external automation test runs)
router.get('/external', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    reports: externalSuiteReports
  });
});

// POST /api/v1/coverage/external (Import an external automation run result)
router.post('/external', (req: Request, res: Response): void => {
  const { name, tool, totalTests, passedTests, failedTests, durationMs, coveragePct, details } = req.body;

  if (!name || totalTests === undefined || passedTests === undefined) {
    res.status(400).json({ success: false, error: 'name, totalTests, and passedTests are required.' });
    return;
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

  res.status(201).json({
    success: true,
    message: 'External automation report imported successfully.',
    report: newReport
  });
});

export default router;
