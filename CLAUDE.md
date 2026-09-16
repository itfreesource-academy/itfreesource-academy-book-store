# CLAUDE.md: ITFreeSource Academy Book Store

Quick reference for Claude Code and CLI agents working on `itfreesource-academy-book-store`.

---

## ⚡ Essential Commands
```bash
# Development
npm run dev              # Frontend on :5173, Backend on :5000
npm start                # Production server on :5000

# Testing
npm test                 # Run 56 Vitest unit & integration tests
npm run test:coverage    # Generate Istanbul/v8 code coverage report

# Building
npm run build            # Full production build (server + client to ./dist)

# Android App
cd android
./gradlew assembleDebug  # Linux/Mac debug build
.\gradlew.bat assembleDebug # Windows debug build
```

---

## 🌐 Live URLs & Endpoints
- Production App: `https://bookstore.itfreesource.workers.dev`
- Ephemeral Previews: `https://<branch>-bookstore.itfreesource.workers.dev`
- Kafka & Webhooks Console: `https://bookstore.itfreesource.workers.dev/playground`
- In-App Swagger: `https://bookstore.itfreesource.workers.dev/swagger`
- Raw Swagger JSON: `https://bookstore.itfreesource.workers.dev/api/swagger.json`
- In-App Coverage: `https://bookstore.itfreesource.workers.dev/coverage`

---

## 🔑 Core Credentials (11 Protected Personas)
- `admin` / `Admin@Pass123` (Full system access)
- `store_manager` / `Manager@Pass123` (Catalog & orders)
- `dubai_shopper` / `Dubai@Pass123` (AED currency)
- `tokyo_reader` / `Tokyo@Pass123` (JPY currency)
- `mumbai_borrower` / `Mumbai@Pass123` (INR currency, academic lending)
- `sydney_collector` / `Sydney@Pass123` (AUD currency)
- `standard_customer` / `User@Pass123` (Baseline customer)
- `vip_customer` / `Vip@Pass123` (VIP 20% discount)
- `order_fulfillment` / `Fulfill@Pass123` (Shipping pipeline)
- `support_agent` / `Support@Pass123` (Cancellations & refunds)
- `suspended_user` / `Suspended@Pass123` (403 Forbidden boundary)

---

## 🎯 Architecture Standards
1. **Web-to-Mobile Parity**: Keep React SPA and Android Compose in sync.
2. **Theme Switcher**: Support Light Mode (`html.light` default) and Dark Mode.
3. **Kafka Lag**: $\text{Lag} = \text{Latest} - \text{Committed}$. 0 is `UP TO DATE`, >0 is `PENDING`.
4. **Webhooks**: Sign with `x-bookstore-signature: sha256=<hash>`; test with in-app `/api/v1/webhooks/mock-receiver`.
5. **Baseline Protection**: Personas `usr_001` - `usr_011` cannot be deleted.
