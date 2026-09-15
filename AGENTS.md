# AGENTS.md: ITFreeSource Academy Book Store Context Guide

This repository contains the **ITFreeSource Academy Book Store**, a fullstack TypeScript platform engineered as a realistic e-commerce application and a rich test automation workbench for QA, SDETs, and automated testing frameworks.

---

## 🏛️ System Architecture & Tech Stack

- **Frontend**: React 19 Single Page Application (SPA), Vite 6, Tailwind CSS 3.4, Lucide React icons, React Router v7.
- **Backend**: Node.js (v20+ / v22+), Express.js 4.21, TypeScript 5.8 (compiled via `tsc`).
- **Database**: In-memory state store (`server/src/data/store.ts`) seeded with 25+ books, 10 users, reviews, and orders.
- **API Documentation**: OpenAPI 3.0 via `swagger-ui-express` served exclusively at `/api/swagger` (raw JSON at `/api/swagger.json`).
- **Test Engine**: Vitest 5 with v8 coverage provider (`@vitest/coverage-v8`), Supertest for HTTP integration tests.
- **CI/CD**: GitHub Actions workflow at `.github/workflows/ci.yml`.
- **Cloudflare Deployment**: Configured via `wrangler.jsonc` (project name `bookstore`) deploying static SPA assets from `./dist` with SPA routing fallback.

---

## 🚀 How to Run the Project

### Development Mode (Concurrent HMR)
```bash
npm run dev
```
- Frontend runs on `http://localhost:5173` (Vite proxies `/api` and `/uploads` to port 5000).
- Backend runs on `http://localhost:5000`.

### Production / Standalone Mode (Single Port)
```bash
npm run build
npm start
```
- Unified Express server on `http://localhost:5000` serves **both** the React SPA frontend and all backend REST APIs.
- Interactive Swagger UI: `http://localhost:5000/api/swagger`
- Raw OpenAPI JSON: `http://localhost:5000/api/swagger.json`
- In-App QA & Coverage Dashboard: `http://localhost:5000/coverage`
- Static Istanbul HTML Coverage Report: `http://localhost:5000/reports/coverage/index.html`

### Testing & Coverage
```bash
npm test                 # Run 43 Vitest tests across 4 test suites
npm run test:coverage    # Run tests and generate v8 coverage report
```

---

## 👥 10 User Personas & Credentials Matrix

| Username | Password | Role | Currency | Timezone | Permissions / Test Focus |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `admin` | `Admin@Pass123` | `admin` | USD ($) | `America/New_York` | Full system access, user management, audit logs, inventory updates |
| `store_manager` | `Manager@Pass123` | `manager` | USD ($) | `America/New_York` | Catalog management, pricing updates, order status management |
| `dubai_shopper` | `Dubai@Pass123` | `customer` | AED (AED) | `Asia/Dubai` | Regional currency/timezone conversions, book borrowing & penalties |
| `tokyo_reader` | `Tokyo@Pass123` | `customer` | JPY (¥) | `Asia/Tokyo` | Zero-decimal currency exchange (JPY 155), timezone calculations |
| `mumbai_borrower`| `Mumbai@Pass123` | `customer` | INR (₹) | `Asia/Kolkata` | High-frequency book borrowing, rental fee simulation |
| `sydney_collector`| `Sydney@Pass123`| `customer` | AUD (A$) | `Australia/Sydney` | Australian dollar pricing, international order placement |
| `standard_customer`| `User@Pass123` | `customer` | USD ($) | `America/New_York` | Standard purchasing, cart checkout, reviews submission |
| `content_moderator`| `Mod@Pass123`  | `moderator` | USD ($) | `America/New_York` | Review moderation (`approved`, `rejected`), community management |
| `inventory_lead` | `Inventory@Pass123`| `inventory_manager`| USD ($) | `America/New_York`| Stock quantity adjustments, low stock alerts, warehouse audits |
| `suspended_user` | `Suspended@Pass123`| `customer` (suspended) | USD ($) | `America/New_York` | Account suspension testing (403 Forbidden on actions) |

---

## ⏱️ Book Borrowing Engine Rules

- **Loan Duration**: Standard 10-day reading window.
- **Base Fee**: Flat $2.00 upon borrowing (deducted or converted based on active currency).
- **Overdue Penalty**: $0.10 / day for every day overdue beyond day 10.
- **Lost Replacement Fee**: 2x book retail price automatically charged upon declaring a book lost.
- **Stock Management**: Stock decrements by 1 on borrow, increments by 1 upon return.

---

## 🔄 Test Database Reset (Zero-Flake Automation)

- **Endpoint**: `POST /api/v1/system/reset`
- Restores all books, inventory counts, borrow records, user accounts, and reviews back to their pristine seed state. Call this in `beforeEach` or `beforeAll` hooks in E2E automation suites.

---

## 📂 Key Code Locations

- Server Entry & Static Serving: `server/src/index.ts`
- Data Store & Seeding: `server/src/data/store.ts`, `server/src/data/seedData.ts`
- Swagger Specification: `server/src/config/swagger.ts`
- Borrow Logic & Routes: `server/src/routes/borrowRoutes.ts`
- Coverage API Routes: `server/src/routes/coverageRoutes.ts`
- Vitest Test Suites: `server/src/tests/borrow.test.ts`, `server/src/tests/auth.test.ts`, `server/src/tests/store.test.ts`, `server/src/tests/api.test.ts`
- React Navbar & Footer: `client/src/components/layout/Navbar.tsx`, `client/src/components/layout/Footer.tsx`
- Coverage Dashboard Page: `client/src/pages/CoverageDashboardPage.tsx`
- Borrow Hub Page: `client/src/pages/BorrowedBooksPage.tsx`
- QA Sandbox Page: `client/src/pages/PlaygroundPage.tsx`
