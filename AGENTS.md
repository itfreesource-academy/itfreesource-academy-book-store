# AGENTS.md: ITFreeSource Academy Book Store Context Guide

This repository contains the **ITFreeSource Academy Book Store**, an enterprise-grade fullstack TypeScript & Android platform engineered as a realistic e-commerce application and a rich test automation workbench for QA engineers, SDETs, and automated testing frameworks (Playwright, Cypress, Vitest, Appium, REST Assured).

---

## 🏛️ System Architecture & Tech Stack

- **Frontend (Web)**: React 19 Single Page Application (SPA), Vite 6, Tailwind CSS 3.4, Lucide React icons, React Router v7. Features a high-contrast **Light vs. Dark Theme System** (defaulting to Light Mode).
- **Backend (API)**: Node.js (v20+ / v22+ LTS), Express.js 4.21, TypeScript 5.8 (`server/src/index.ts`).
- **Companion Mobile App**: Native Android companion app in `android/` (Kotlin 2.2, Jetpack Compose, Material Design, Coil image loading, AGP 9.3, Gradle 9.5, Target SDK 34).
- **Database & State**: In-memory state store (`server/src/data/store.ts`) seeded with 25+ books, 11 protected personas, reviews, orders, rentals, and audit logs.
- **API Documentation**: OpenAPI 3.0 via `swagger-ui-express` served at `/api/swagger` (raw JSON at `/api/swagger.json`, interactive in-app viewer at `/swagger`).
- **Event Streaming & Kafka Broker**: In-memory Apache Kafka broker simulation (`server/src/services/kafkaBroker.ts`) tracking 6 partitions, real-time consumer lag calculation, offset commits, and Dead-Letter Queue (DLQ) poison pill quarantine.
- **Enterprise Webhooks**: Cryptographic HMAC-SHA256 dispatcher (`server/src/services/webhookService.ts`) with in-app zero-config mock receiver (`/api/v1/webhooks/mock-receiver`), latency telemetry, and 503 outage retry simulations.
- **Test Engine**: Vitest 5 with v8 coverage provider (`@vitest/coverage-v8`), Supertest for HTTP integration tests (56 tests across 6 suites).
- **CI/CD & Deployment**:
  - GitHub Actions workflow at `.github/workflows/ci.yml`.
  - Cloudflare Pages / Workers deployment via `wrangler.toml` (project `bookstore`) serving SPA assets from `./dist` with edge SSR/routing fallback.
  - Live Canonical Production URL: `https://bookstore.itfreesource.workers.dev`
  - Ephemeral Branch Previews: `https://<branch>-bookstore.itfreesource.workers.dev`

---

## 📜 CRITICAL AGENT RULES: Non-Negotiable Engineering Standards

All AI agents and engineers contributing to this repository **MUST STRICTLY FOLLOW** these rules:

### Rule 1: Web-to-Mobile Feature Parity Protocol
- The Express backend (`server/src/routes/`) is the central source of truth for both Web and Mobile.
- Whenever a new endpoint, query parameter, or JSON response field is created or modified in `server/`, you **MUST** update:
  1. The TypeScript schemas in `server/src/types/index.ts` and `client/src/types/`.
  2. The Kotlin data models in `android/app/src/main/java/com/itfreesource/bookstore/model/Models.kt`.
  3. The Android REST client in `android/app/src/main/java/com/itfreesource/bookstore/data/ApiClient.kt`.
- **Never implement a customer-facing feature on Web without its equivalent on Android Compose.**

### Rule 2: Theme System & High-Contrast Light Mode Default
- The platform uses `ThemeProvider` (`client/src/context/ThemeContext.tsx`) with dynamic `light` and `dark` classes toggled on `document.documentElement`.
- **Default Theme is Light Mode** (`localStorage.getItem('itfreesource_theme') || 'light'`).
- `client/src/index.css` contains high-contrast light mode rules (`html.light .bg-slate-900`, `html.light .border-slate-800`, text contrasts).
- Ensure all new components support both themes using Tailwind classes:
  - Cards: `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800`
  - Text: `text-slate-900 dark:text-white`, secondary `text-slate-600 dark:text-slate-400`
  - Actions: `bg-indigo-600 text-white hover:bg-indigo-700`

### Rule 3: Kafka Consumer Lag & DLQ Compliance
- Consumer lag is calculated as:
  $$\text{Consumer Lag} = \text{Latest Partition Offset} - \text{Committed Consumer Offset}$$
- When Lag = 0, status must display green **`UP TO DATE`**.
- When Lag > 0, status must display amber **`PENDING (Lag: N)`**.
- Placing an order in `/cart` advances `bookstore.orders.created` partition offset ($N \to N+1$), placing downstream groups into `PENDING`.
- Committing the offset (`POST /api/v1/kafka/consumer-groups/:id/commit`) resets lag to `0` (`UP TO DATE`).
- Malformed payloads must route to Dead-Letter Queue (`bookstore.dlq.poison-pills`) without dropping normal partition consumption.

### Rule 4: Webhook Cryptographic Integrity (HMAC-SHA256)
- Outbound webhooks must always include `x-bookstore-signature: sha256=<hex_digest>`.
- Testing signature verification:
  ```typescript
  import crypto from 'crypto';
  const computedHash = crypto.createHmac('sha256', secret).update(rawPayload).digest('hex');
  const isValid = `sha256=${computedHash}` === signatureHeader;
  ```
- Use the built-in zero-config mock receiver at `/api/v1/webhooks/mock-receiver` for tests; do NOT require external ngrok tunnels.
- Test 503 outage resilience and exponential backoff retries via `/api/v1/webhooks/mock-receiver/chaos` and `/api/v1/webhooks/deliveries/:id/redeliver`.

### Rule 5: 11 Core Protected Personas Rule
- The 11 baseline test personas (`usr_001` through `usr_011`) are **permanently protected against deletion**.
- Any `DELETE /api/v1/auth/users/:id` on a core persona must return `400 Bad Request` with an explanatory error.

### Rule 6: Appium Automation Standards (Companion Android App)
- **Semantic Locators**: Every interactive Android component must provide a semantic accessibility locator via `Modifier.semantics { contentDescription = "..." }`.
- Follow consistent naming conventions matching web `data-testid` attributes:
  - Buttons: `btn_place_order`, `btn_sync_orders`, `btn_reset_database_seed`, `btn_borrow_book`
  - Inputs: `input_search_books`, `input_shipping_fullname`, `input_backend_api_url`
  - Cards & Rows: `book_card_<id>`, `order_card_<orderNumber>`
  - Navigation: `nav_catalog`, `nav_cart`, `nav_orders`, `nav_rentals`, `nav_sandbox`, `nav_management`

---

## 👥 11 User Personas & Test Matrix

| Username | Password | Role | Currency | Timezone | Permissions / Test Focus |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `admin` | `Admin@Pass123` | `admin` | USD ($) | `America/New_York` | Full system access, user management, audit logs, inventory updates |
| `store_manager` | `Manager@Pass123` | `store_manager` | USD ($) | `America/New_York` | Catalog management, pricing updates, order status management |
| `dubai_shopper` | `Dubai@Pass123` | `standard_customer` | AED (AED) | `Asia/Dubai` | Regional currency/timezone conversions, book borrowing & penalties |
| `tokyo_reader` | `Tokyo@Pass123` | `standard_customer` | JPY (¥) | `Asia/Tokyo` | Zero-decimal currency exchange (JPY 155), timezone calculations |
| `mumbai_borrower`| `Mumbai@Pass123` | `standard_customer` | INR (₹) | `Asia/Kolkata` | High-frequency book borrowing, rental fee simulation ($2.00, $0.10/day overdue) |
| `sydney_collector`| `Sydney@Pass123`| `standard_customer` | AUD (A$) | `Australia/Sydney` | Australian dollar pricing, international order placement |
| `standard_customer`| `User@Pass123` | `standard_customer` | USD ($) | `America/New_York` | Standard purchasing, cart checkout, reviews submission |
| `vip_customer` | `Vip@Pass123` | `vip_customer` | USD ($) | `America/New_York` | Automatic 20% discount on cart subtotal, VIP exclusive catalog |
| `order_fulfillment`| `Fulfill@Pass123` | `order_fulfillment` | USD ($) | `America/New_York` | Order fulfillment, tracking number assignment, status pipeline |
| `support_agent` | `Support@Pass123` | `support_agent` | USD ($) | `America/New_York` | Customer support, order cancellations, refund processing |
| `suspended_user` | `Suspended@Pass123`| `standard_customer` (suspended) | USD ($) | `America/New_York` | Account suspension testing (403 Forbidden on actions) |

---

## 🚀 How to Run, Test & Build (Cross-Device)

### Web & API (Windows / macOS / Linux)
```bash
# 1. Install dependencies
npm install

# 2. Run local development (Client on :5173, Server on :5000)
npm run dev

# 3. Run all 56 Vitest unit & integration tests
npm test

# 4. Generate Istanbul/v8 Code Coverage
npm run test:coverage

# 5. Full Production Build (Client + Server + dist export)
npm run build

# 6. Start Unified Production Server
npm start
```

### Native Android Companion App (`android/`)
```bash
cd android

# Linux/macOS with Android SDK:
JAVA_HOME=/opt/android-studio/jbr ANDROID_HOME=$HOME/Android/Sdk ./gradlew assembleDebug

# Windows PowerShell:
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
.\gradlew.bat assembleDebug

# Build Release APK & Signed Google Play Bundle:
.\gradlew.bat assembleRelease bundleRelease
```
- **Debug APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `android/app/build/outputs/apk/release/app-release.apk`
- **Application ID**: `com.itfreesource.bookstore`
- **Main Activity**: `com.itfreesource.bookstore.MainActivity`

---

## 🗺️ Master Platform Practical Testing Matrix

| Feature / Page | URL Path | Key Testing Focus | Persona |
| :--- | :--- | :--- | :--- |
| **Theme Switcher** | Global Header | Light vs. Dark theme toggle, `localStorage` persistence | Any |
| **Books Catalog** | `/books` | Live currency switcher (7 currencies), quantity stepper `[-] 1 [+]`, stock bounds | `standard_customer` |
| **Academic Lending** | `/borrowed` | $2.00 borrow fee, VIP 20% discount ($1.60), $0.10/day overdue penalty formula | `student_reader` / `vip_customer` |
| **Cart & Checkout** | `/cart` | Idempotency key duplicate debit protection, coupon validation (`ITFREE10`) | `standard_customer` |
| **Kafka Console** | `/playground` | Consumer Lag ($\text{Lag} = \text{Latest} - \text{Committed}$), `UP TO DATE` vs `PENDING`, DLQ replay | `qa_engineer` / `admin` |
| **Webhooks Console** | `/playground` | HMAC-SHA256 signatures, mock receiver, 503 outage retry resilience | `qa_engineer` / `admin` |
| **Warehouse Inventory**| `/inventory` | Stock management, low-stock alerts, inline active-currency price edits | `store_manager` |
| **Code Coverage** | `/coverage` | Real-time Istanbul / v8 code coverage across all 56 backend tests | `auditor` / `admin` |
| **OpenAPI Docs** | `/swagger` | OpenAPI 3.0 specification with interactive "Try it out" request console | All Personas |
