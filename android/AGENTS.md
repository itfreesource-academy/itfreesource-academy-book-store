# AGENTS.md: ITFreeSource Bookstore Android & Appium Mobile Testing Platform

This directory contains the native Android application and Appium test automation suite for the **ITFreeSource Academy Book Store**.

---

## 🎯 Purpose & Scope
This app serves as a mobile test automation benchmark for Appium, encompassing:
1. **Full Functional Fidelity**: 10 user personas, multi-currency (USD, AED, INR, JPY, AUD), multi-timezone, catalog browsing, reviews, cart, multi-step checkout, order fulfillment, academic book borrowing, and inventory management.
2. **Deterministic Test Locators**: Semantic `contentDescription` attributes on all buttons, inputs, cards, sliders, chips, badges, and modals.
3. **Appium QA Automation Sandbox**: Dedicated `/playground` screen for dynamic locator testing, touch gestures (swipe, long-press, double-tap, priority drag/drop), native Android dialogs (`AlertDialog`, `DatePickerDialog`, `TimePickerDialog`), and hybrid app `WebView` context switching (`WEBVIEW_com.itfreesource.bookstore`).

---

## 🏗️ Technical Architecture

- **Application ID**: `com.itfreesource.bookstore`
- **Main Launcher Activity**: `com.itfreesource.bookstore.MainActivity`
- **Compile & Target SDK**: 34 (Android 14) \| **Min SDK**: 24 (Android 7.0+)
- **UI Framework**: Jetpack Compose (Material Design)
- **State Store**: `com.itfreesource.bookstore.data.BookStoreRepository` (reactive in-memory mock store initialized with `SeedData.kt`)
- **Build System**: Gradle 9.5.0 + Android Gradle Plugin 9.3.1 + Kotlin 2.2.10

### Directory Layout
```
app/
├── release.jks                          # Production release signing keystore
├── proguard-rules.pro                   # R8/Proguard rules for Google Play Release
└── src/main/
    ├── AndroidManifest.xml              # Manifest with adaptive icons, permissions, resize mode
    ├── res/
    │   ├── drawable/                    # Vector launcher icons (background & foreground)
    │   └── mipmap-anydpi-v26/           # Adaptive icons for all Android densities
    └── java/com/itfreesource/bookstore/
        ├── MainActivity.kt              # Root activity, Scaffold, navigation routing, dialog coordinator
        ├── model/
        │   └── Models.kt                # Data classes: User, Book, Category, Author, Order, Review, BorrowRecord
        ├── data/
        │   ├── SeedData.kt              # Initial seed records matching server/src/data/seedData.ts
        │   └── BookStoreRepository.kt   # Central reactive state engine, FX conversion, checkout & rental logic
        ├── ui/
        │   ├── theme/
        │   │   └── Theme.kt             # Dark palette, brand colors, typography
        │   ├── components/
        │   │   ├── TopAppBarWithRoleSwitcher.kt # Sticky 1-click persona switcher and currency dropdown
        │   │   ├── BookCard.kt          # Grid and List book cards with accessibility IDs
        │   │   ├── NavigationComponent.kt # Bottom navigation bar with cart badge count
        │   │   └── ProfileDialog.kt     # User profile details and manual login form
        │   └── screens/
        │       ├── CatalogScreen.kt     # Search, category chips, dual price slider, rating slider, sort
        │       ├── BookDetailDialog.kt  # Details modal, stepper, add to cart, borrow, reviews, write review
        │       ├── CartCheckoutScreen.kt # Cart list, promo codes, VIP discount, 4-step checkout flow
        │       ├── OrdersScreen.kt      # Orders list, tracking number prompt dialog, status transitions
        │       ├── RentalsScreen.kt     # Academic rentals, overdue penalty, lost fee replacement
        │       ├── ManagementScreen.kt  # Inventory sliders, user editor, review moderation queue
        │       └── PlaygroundScreen.kt  # QA sandbox (gestures, dialogs, forms, chaos, hybrid WebView)
```

> **Note on Test Suites**: As per project specification, test automation suites (Appium, Robot, Maestro) are intentionally excluded from this application codebase and hosted in a separate test repository. The app provides standardized semantic accessibility IDs (`contentDescription`) across all components.

## 🛠️ Build & Verification Commands

### Build Google Play Release App Bundle (.aab):
```bash
JAVA_HOME=/opt/android-studio/jbr ANDROID_HOME=/home/virus/Android/Sdk ./gradlew bundleRelease
```
Output:
`app/build/outputs/bundle/release/app-release.aab` *(9.2 MB, Signed and ready for Google Play Console)*

### Build Signed Release APK (.apk):
```bash
JAVA_HOME=/opt/android-studio/jbr ANDROID_HOME=/home/virus/Android/Sdk ./gradlew assembleRelease
```
Output:
`app/build/outputs/apk/release/app-release.apk` *(9.3 MB, Signed for direct sideloading)*

### Build Debug APK:
```bash
JAVA_HOME=/opt/android-studio/jbr ANDROID_HOME=/home/virus/Android/Sdk ./gradlew assembleDebug
```
Output:
`app/build/outputs/apk/debug/app-debug.apk`

### Verify Manifest & Badging:
```bash
/home/virus/Android/Sdk/build-tools/34.0.0/aapt dump badging app/build/outputs/apk/release/app-release.apk | grep -E "(package:|launchable-activity:)"
```

### Install onto Running Device / Emulator:
```bash
/home/virus/Android/Sdk/platform-tools/adb install -r app/build/outputs/apk/release/app-release.apk
```

---

## 📌 Handoff Status for Future Agents

- **Latest Build**: Successfully compiled on `2026-09-16`. APK size is 14 MB with valid launcher intent.
- **State Management**: `BookStoreRepository.kt` handles all application state locally out-of-the-box, allowing tests to run offline or in isolated CI pipelines without backend dependency.
- **Backend API Integration**: Can be linked to the live Express server (`http://10.0.2.2:5000/api/v1` for emulator or host IP for real devices).
