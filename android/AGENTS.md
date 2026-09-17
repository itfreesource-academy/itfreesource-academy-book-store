# AGENTS.md — ITFreeSource BookStore Android App

> **⚠️ MANDATORY RULE FOR ALL AGENTS:**
> After EVERY completed task or user prompt that results in any code or configuration change in this repository, you MUST update this `AGENTS.md` file to reflect:
> - What changed (file, section, summary of change)
> - Why it changed (user request / bug fix / feature)
> - Any new build steps or commands introduced
>
> This rule applies to ALL agents working in ANY repo directory — Android, client, server, or root. Future agents depend on this file being current to continue work seamlessly.

---

## 🎯 Purpose & Scope

This directory contains the native Android application for the **ITFreeSource Academy Book Store**.

The app is a fully-featured mobile bookstore with:
- Catalog browsing, search, filtering by category/price/rating
- Cart management with quantity steppers (shared `AddToCartControl` composable)
- Multi-step checkout with promo codes and VIP discounts
- Academic book rentals with overdue/lost-fee logic
- Order management and tracking
- Inventory management (admin view)
- Multi-currency support (USD, AED, INR, JPY, AUD)
- 10 user personas with profile switching
- Appium QA Automation Sandbox (PlaygroundScreen)

---

## 🏗️ Technical Architecture

| Property | Value |
|---|---|
| **Application ID** | `com.itfreesource.bookstore` |
| **Launcher Activity** | `com.itfreesource.bookstore.MainActivity` |
| **Compile/Target SDK** | 34 (Android 14) |
| **Min SDK** | 24 (Android 7.0+) |
| **UI Framework** | Jetpack Compose + Material 3 |
| **State** | In-memory reactive store (`BookStoreRepository` singleton) |
| **Build** | Gradle 9.5.0 + AGP 9.3.1 + Kotlin 2.2.10 |

---

## 📁 Directory Layout

```
app/
├── release.jks                          # Production signing keystore
├── proguard-rules.pro                   # R8/Proguard rules
└── src/main/
    ├── AndroidManifest.xml              # App manifest: label="BookStore", adaptive icon, permissions
    ├── assets/
    │   └── ic_logo.png                  # 512×512 high-res brand logo (for use in About screens etc.)
    ├── res/
    │   ├── drawable/
    │   │   ├── ic_launcher_background.xml   # Indigo gradient (#3730A3→#4F46E5) background layer
    │   │   ├── ic_launcher_foreground.xml   # Open-book vector + gold sparkle foreground layer
    │   │   └── ic_launcher.xml              # Legacy bitmap adaptive icon ref
    │   ├── mipmap-mdpi/                 # ic_launcher.png + ic_launcher_round.png (48×48)
    │   ├── mipmap-hdpi/                 # (72×72)
    │   ├── mipmap-xhdpi/                # (96×96)
    │   ├── mipmap-xxhdpi/               # (144×144)
    │   ├── mipmap-xxxhdpi/              # (192×192)
    │   ├── mipmap-anydpi-v26/
    │   │   ├── ic_launcher.xml          # Adaptive icon: background + foreground layers
    │   │   └── ic_launcher_round.xml    # Round adaptive icon variant
    │   └── values/
    └── java/com/itfreesource/bookstore/
        ├── MainActivity.kt              # Root activity: Scaffold, bottom nav, routing, dialog coordinator
        ├── model/
        │   └── Models.kt                # Data classes: User, Book, Category, Author, Order, CartItem, BorrowRecord, Review
        ├── data/
        │   ├── SeedData.kt              # Seed records matching server/src/data/seedData.ts
        │   └── BookStoreRepository.kt   # Singleton reactive state engine (see details below)
        └── ui/
            ├── theme/
            │   └── Theme.kt             # Dark palette, brand colors (indigo/violet), typography
            ├── components/
            │   ├── TopAppBarWithRoleSwitcher.kt  # Top app bar: brand title + currency picker + profile pill
            │   ├── AddToCartControl.kt            # ★ Shared cart control composable (button ↔ stepper)
            │   ├── AttributionFooter.kt           # ★ Attribution strip — "Open Source Contribution by Vishal Prajapati" (links to LinkedIn)
            │   ├── BookCard.kt                    # Grid/list book cards using AddToCartControl
            │   ├── NavigationComponent.kt         # Bottom nav bar with cart badge count
            │   ├── ProfileDialog.kt               # User profile details & manual login
            │   └── ServerConnectionDialog.kt      # (exists but NOT shown — dev-only artifact)
            └── screens/
                ├── CatalogScreen.kt     # Search, category chips, price/rating sliders, sort
                ├── BookDetailDialog.kt  # Book details modal with AddToCartControl + borrow + reviews
                ├── CartCheckoutScreen.kt # Cart, promo codes, VIP discount, 4-step checkout
                ├── OrdersScreen.kt      # Order list with Refresh (IconButton), tracking dialog
                ├── RentalsScreen.kt     # Academic rentals, overdue/lost fees, Refresh button
                ├── ManagementScreen.kt  # Inventory management, user editor, review moderation
                └── PlaygroundScreen.kt  # ⚠️ QA/dev sandbox — intentionally contains debug refs
```

---

## 🔑 Key Components & Their Contracts

### `BookStoreRepository.kt`
- **Singleton object** — instantiated once, lives for app lifetime.
- `cartItems: SnapshotStateList<CartItem>` — use index-based mutation only (`cartItems[i] = item.copy(...)`) to trigger Compose recomposition. Direct property assignment (`item.quantity = x`) does NOT recompose.
- Key cart methods:
  - `addToCart(book, qty)` — adds or increments; index-based update
  - `updateCartQuantity(bookId, newQty)` — index-based update, logs if qty=0
  - `removeFromCart(bookId)` — removes item, logs action
  - `getCartQuantity(bookId): Int` — returns current qty or 0 if not in cart

### `AddToCartControl.kt` (shared cart UI service)
```kotlin
@Composable
fun AddToCartControl(
    book: Book,
    size: CartControlSize = CartControlSize.COMPACT,
    modifier: Modifier = Modifier
)
```
- **`CartControlSize.COMPACT`** — used in `BookCard`; small button/stepper
- **`CartControlSize.LARGE`** — used in `BookDetailDialog`; full-width
- Renders `"Add to Cart"` when `getCartQuantity == 0`; renders `[−] qty [+]` stepper when `> 0`
- Respects `book.stock` as ceiling on `+`

### `TopAppBarWithRoleSwitcher.kt`
- **Does NOT show** ONLINE/LOCAL badge (removed)
- **Does NOT show** role-switcher chip row (removed)
- **Does NOT invoke** `ServerConnectionDialog` (removed)
- Shows: brand title "📚 BookStore" | currency dropdown | user profile pill

### `OrdersScreen.kt` / `RentalsScreen.kt`
- Refresh is a plain `IconButton(Icons.Default.Refresh)` — no web-sync text or dots

### `PlaygroundScreen.kt`
- ⚠️ **Intentionally contains `isBackendConnected` references** — QA/dev sandbox. Do NOT clean.

---

## 🎨 App Logo & Assets

| Layer | File | Description |
|---|---|---|
| Background | `res/drawable/ic_launcher_background.xml` | Indigo gradient `#3730A3 → #4F46E5` at 135° |
| Foreground | `res/drawable/ic_launcher_foreground.xml` | Open book (white/tinted) + gold sparkle star |
| Adaptive (API 26+) | `res/mipmap-anydpi-v26/ic_launcher.xml` | Combines background + foreground layers |
| PNG — mdpi | `res/mipmap-mdpi/ic_launcher.png` | 48×48 |
| PNG — hdpi | `res/mipmap-hdpi/ic_launcher.png` | 72×72 |
| PNG — xhdpi | `res/mipmap-xhdpi/ic_launcher.png` | 96×96 |
| PNG — xxhdpi | `res/mipmap-xxhdpi/ic_launcher.png` | 144×144 |
| PNG — xxxhdpi | `res/mipmap-xxxhdpi/ic_launcher.png` | 192×192 |
| High-res asset | `assets/ic_logo.png` | 512×512 |

App label in `AndroidManifest.xml` is `"ITFreeSource BookStore"`.

---

## 🛠️ Build & Verification Commands

```bash
export JAVA_HOME=/opt/android-studio/jbr
export ANDROID_HOME=/home/virus/Android/Sdk
export PATH=$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH
cd /home/virus/.gemini/antigravity-cli/scratch/book-store-repo/android
```

### Signed Release APK:
```bash
./gradlew assembleRelease
cp app/build/outputs/apk/release/app-release.apk \
   /home/virus/.gemini/antigravity-cli/scratch/apk-server/app-release.apk
```
APK served at: `http://192.168.0.6:8080/app-release.apk`

### Google Play AAB:
```bash
./gradlew bundleRelease
```

### Debug APK:
```bash
./gradlew assembleDebug
```

### ADB Install:
```bash
adb install -r app/build/outputs/apk/release/app-release.apk
```

---

## 🌐 Backend & Web

| Service | URL |
|---|---|
| Backend (emulator) | `http://10.0.2.2:5000/api/v1` |
| Backend (real device) | `http://192.168.0.6:5000/api/v1` |
| Web frontend | `https://bookstore.itfreesource.workers.dev` |
| APK download | `http://192.168.0.6:8080/app-release.apk` |

> The app is fully functional offline — all state lives in `BookStoreRepository`. Orders placed on the app won't appear on the web without backend round-trip (not yet wired).

---

## 📋 Change Log

| Date | Commit | Change | Reason |
|---|---|---|---|
| 2026-09-16 | `708cd12`→`06879aa` | Removed role-switcher chip row from `TopAppBarWithRoleSwitcher.kt` | User removed it from web UI |
| 2026-09-16 | `48c5a1a` | Created `AddToCartControl.kt`; refactored `BookCard.kt`, `BookDetailDialog.kt`, `BookStoreRepository.kt` (index-based mutations + `getCartQuantity`) | Unified cart UI service across web + Android |
| 2026-09-16 | `0c5e33d` | Removed all debug/connection UI: ONLINE/LOCAL badge, ServerConnectionDialog, sync banners in Cart/Orders/Rentals/Management | User: "don't want to show … api integration, wifi etc" |
| 2026-09-16 | `c7bbf5b` | Brand logo: generated PNG logo; added `assets/ic_logo.png`; mipmap PNGs (all densities); updated vector drawables | User: "standards android assets folder … prepare a good logo" |
| 2026-09-16 | `bd200de` | Reverted app label to `"ITFreeSource BookStore"` | User confirmed testing platform identity |
| 2026-09-16 | `e13bb8c` | Created `AttributionFooter.kt` composable; added to `MainActivity` `bottomBar`; tapping "Vishal Prajapati" opens LinkedIn profile | "add the label at last saying Open Source Contribution by Vishal Prajapati…" |
| 2026-09-16 | `3b6aa55` | Theme toggle: Added light/dark mode switch to TopAppBar with reactive `ThemeState` | User requested theme toggle |
| 2026-09-16 | `38629dc` | Generated authentic ITFreeSource Academy Developer Icon (512x512) and Header Banner (4096x2304) matching website brand (green growth arrow + bar chart + clock gauge); saved to `store-assets/` and pushed to GitHub | Aligning developer profile with official ITFreeSource Academy logo |
| 2026-09-16 | `d4b83f1` | Redesigned developer icon & header to match the cutting-edge cyber infinity brand from `academy.itfreesource.com` (neon magenta graduation cap + neon cyan security padlock + 'BY VISHAL PRAJAPATI • POWERED BY ITFREESOURCE' header) | Re-aligning developer profile with elite AppSec/QA Academy branding |
| 2026-09-17 | `ab79109` | **Light Mode Dark Tiles Fix (Web):** Eliminated hardcoded dark gradient banners and unreadable dark-on-dark text in light mode across `HomePage.tsx` (QA Automation showcase, stats counter bar, category cards), `BookCarousel.tsx`, `AboutPage.tsx`, `SwaggerPage.tsx`, `BorrowedBooksPage.tsx`, `CoverageDashboardPage.tsx`, and `PlaygroundPage.tsx`. Added universal gradient and button light-mode overrides in `index.css` so cards adapt cleanly between light and dark themes. | User: "even on light mode, such dark tiles are not good, they are everywhere, please check" |
| 2026-09-17 | `83da4af` | **Enterprise Storefront Polish & Universal Light/Dark Theme (Web + Android):** Overhauled Web & Android styling to crisp enterprise grade. Built signed release APK (`6.0MB`). | User: "I want the candidate to have a real feel of enterprise application... same with android ap" |
| 2026-09-17 | *(current)* | **Extracted Android Native App to Dedicated Standalone Repository:** Migrated Android project into standalone GitHub repo [`https://github.com/vishalprajapati2k25/itfs-bookstore-android-app`](https://github.com/vishalprajapati2k25/itfs-bookstore-android-app). Created detailed `API_CONTRACT.md`, `.github/workflows/android-ci.yml`, `local.properties.example`, secured `.gitignore` against keystore files, and cross-linked monorepo documentation with live Cloudflare Workers API endpoints (`https://bookstore.itfreesource.workers.dev/api/v1`). | User: "move android app code to https://github.com/vishalprajapati2k25/itfs-bookstore-android-app this repo and make sure that we are able to access the API properly and having inter repo communication for the details or for the APIs" |

---

## 📌 Handoff Status

- **Standalone Android Repository**: [`https://github.com/vishalprajapati2k25/itfs-bookstore-android-app`](https://github.com/vishalprajapati2k25/itfs-bookstore-android-app)
- **Monorepo**: [`https://github.com/itfreesource-academy/itfreesource-academy-book-store`](https://github.com/itfreesource-academy/itfreesource-academy-book-store)
- **Live Backend API**: [`https://bookstore.itfreesource.workers.dev/api/v1`](https://bookstore.itfreesource.workers.dev/api/v1)
- **Interactive Swagger Spec**: [`https://bookstore.itfreesource.workers.dev/api/swagger`](https://bookstore.itfreesource.workers.dev/api/swagger)
- **App Label**: `"ITFS BookStore"` in `AndroidManifest.xml` (Play Store name under publisher "ITFreeSource Academy by Vishal Prajapati")
- **App Name Convention**: `ITFS <AppName>` — branch naming pattern for all ITFreeSource testing apps
- **Icon**: ITFreeSource branded (dark navy `#1a1a2e` bg, white open book, green upward arrow). Adaptive (API 26+) + PNG fallbacks mdpi→xxxhdpi
- **Developer Assets**: Saved in `store-assets/` (`developer_icon_512.png` and `developer_header_4096x2304.jpg`)
- **Play Store**: targetSdk 35, minifyEnabled, shrinkResources, signing via local.properties
- **Signing**: Credentials in `android/local.properties` (gitignored — never committed). File has `KEYSTORE_FILE`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`
- **Cart**: `AddToCartControl` composable used consistently everywhere
- **Backend**: `https://bookstore.itfreesource.workers.dev/api/v1` — Cloudflare Worker, always on
- **APK download**: `http://192.168.0.8:8080/app-release.apk` (local Wi-Fi, Python http.server)
- **⚠️ REMINDER**: Update this AGENTS.md after every change. See rule at top of file.
