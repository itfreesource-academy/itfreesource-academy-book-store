# 📱 ITFreeSource Academy - Book Store Android Application
### Complete Native Mobile App & QA Appium Test Automation Benchmark

> [!IMPORTANT]
> **Dedicated Standalone Repository**: Active standalone development, CI workflows, and releases for this native Android app are hosted at:  
> 👉 **[vishalprajapati2k25/itfs-bookstore-android-app](https://github.com/vishalprajapati2k25/itfs-bookstore-android-app)**  
> Live Backend API: [`https://bookstore.itfreesource.workers.dev/api/v1`](https://bookstore.itfreesource.workers.dev/api/v1)  
> Interactive Swagger Specs: [`https://bookstore.itfreesource.workers.dev/api/swagger`](https://bookstore.itfreesource.workers.dev/api/swagger)

This is the Android native companion app for [itfreesource-academy-book-store](https://github.com/itfreesource-academy/itfreesource-academy-book-store), custom-engineered specifically for building, scaling, and validating an **Appium Mobile App Testing Platform**.

Every single component, form element, dialog, gesture target, and business workflow is instrumented with deterministic **Appium Accessibility IDs (`contentDescription`)** and native system dialog integration.

---

## 🚀 Key Highlights & Built-in Features

1. **Top Sticky 1-Click Role Switcher**:
   - Instant 1-click persona switching among all 10 user personas:
     - `admin` (Super Admin)
     - `store_manager` (Store Manager)
     - `inventory_clerk` (Inventory Specialist)
     - `content_editor` (Content Editor)
     - `order_fulfillment` (Order Fulfillment)
     - `support_agent` (Customer Support)
     - `book_reviewer` (Lead Reviewer)
     - `auditor` (Compliance Auditor)
     - `vip_customer` (VIP Customer with auto 20% discount)
     - `standard_customer` (Standard Customer)
     - `marketplace_seller` (Marketplace Seller)
   - Manual username/password login modal with show/hide password toggle.

2. **Multi-Currency & Multi-Timezone Engine**:
   - Live FX rates: `1 USD = 3.67 AED = 83.50 INR = 155.00 JPY = 1.52 AUD`.
   - Global currency switcher in app bar (USD $, AED AED, INR ₹, JPY ¥, AUD A$).
   - Formats prices dynamically across Catalog, Details, Cart, Checkout, Orders, and Rentals.

3. **Books Catalog & Search**:
   - Search bar with instant filter and clear button (`search_clear_button`).
   - Category chips filter (Technology, Science Fiction, Business, Psychology, History).
   - Price range slider ($0 - $120) and rating filter slider (1.0★ - 5.0★).
   - Grid View vs. List View toggle (`btn_view_mode_toggle`).
   - Pull-to-refresh and sort dropdown (A-Z, Z-A, Price Low/High, Rating).

4. **Book Details & Review Submission**:
   - High-res cover placeholder, metadata (pages, ISBN, rating, stock status).
   - Stepper quantity selector (- / +).
   - Add to Cart (`detail_btn_add_to_cart`) and Borrow Book (`detail_btn_borrow`).
   - Reviews list with star ratings and "Write Review" modal dialog.

5. **Shopping Cart & Multi-Step Checkout Flow**:
   - Item list with quantity steppers and delete buttons.
   - VIP Customer 20% discount automatically calculated.
   - Promo code validation engine (`SAVE10`, `SAVE20`, `FREESHIP`).
   - Multi-step checkout:
     - **Step 1**: Shipping Address form (Name, Street, City, State, Zip, Country).
     - **Step 2**: Delivery Date picker using native `DatePickerDialog`.
     - **Step 3**: Payment method selector (Credit card fields or digital wallets).
     - **Step 4**: Authorize & Place Order button (`btn_place_order`).
   - Order Confirmation screen with generated Order ID and tracking details.

6. **Orders Management & Fulfillment**:
   - Order history with status filters (Processing, Shipped, Delivered, Refunded, Cancelled).
   - Role-based transitions:
     - `order_fulfillment` / `admin`: "Ship Order" (prompts native dialog for carrier tracking number) and "Mark Delivered".
     - `support_agent` / `admin`: "Refund Order" action.

7. **Academic Book Borrowing & Rentals**:
   - Standard 10-day loan for $2.00 base fee.
   - Return book action with overdue fee calculation ($0.10/day overdue).
   - Mark book as lost with 2x book price replacement penalty.

8. **Management Screens (Admin & Ops)**:
   - **Inventory**: Realtime stock adjustment sliders, +/- steppers, low stock filter, batch save.
   - **User Management**: View user personas, edit user role, currency, timezone.
   - **Review Moderation**: Pending queue with Approve / Reject actions.
   - **Audit Logs**: Chronological security and operational event stream.

9. **Dedicated QA Mobile Automation Sandbox (`/playground`)**:
   - **Dynamic vs Static ID Toggle**: Test locator resiliency against randomized IDs.
   - **Gestures Sandbox**: Horizontal swipe carousel, long-press target, double-tap target, drag & drop priority list.
   - **Native Dialogs**: Alert Dialog (`alert.accept()`), Confirm Dialog (OK/Cancel), Prompt Dialog (`EditText`), DatePickerDialog, TimePickerDialog.
   - **Form Controls**: Validated input, password eye toggle, checkboxes, radio groups, switches, continuous & discrete sliders.
   - **Chaos & Network Latency**: Latency simulator slider (0ms - 5000ms), HTTP error fault injectors (400, 401, 403, 404, 429, 500), Toast and Snackbar triggers.
   - **Hybrid WebView**: Embedded HTML DOM container for Appium context switching (`driver.context('WEBVIEW_com.itfreesource.bookstore')`).
   - **Instant Database Reset**: 1-click restore to seed state.

---

## 📦 APK Location & Build

The debug APK is already built and ready to install:
```bash
/home/virus/.gemini/antigravity-cli/scratch/bookstore-android/app/build/outputs/apk/debug/app-debug.apk
```

To rebuild the APK at any time:
```bash
cd /home/virus/.gemini/antigravity-cli/scratch/bookstore-android
JAVA_HOME=/opt/android-studio/jbr ANDROID_HOME=/home/virus/Android/Sdk ./gradlew assembleDebug
```

---

## 🛠️ Appium Capabilities & Quickstart

### Desired Capabilities (Python `UiAutomator2Options`):
```python
from appium import webdriver
from appium.options.android import UiAutomator2Options

options = UiAutomator2Options()
options.platform_name = "Android"
options.automation_name = "UiAutomator2"
options.device_name = "Android Emulator"
options.app_package = "com.itfreesource.bookstore"
options.app_activity = "com.itfreesource.bookstore.MainActivity"
options.app = "/home/virus/.gemini/antigravity-cli/scratch/bookstore-android/app/build/outputs/apk/debug/app-debug.apk"
options.no_reset = False

driver = webdriver.Remote("http://127.0.0.1:4723", options=options)
```

---

## 📋 Comprehensive Appium Locator Dictionary

| Screen / Component | Element | Strategy | Locator String |
|---|---|---|---|
| **Top Bar** | Brand Title | AccessibilityId | `app_brand_title` |
| **Top Bar** | Currency Selector | AccessibilityId | `currency_selector_button` |
| **Top Bar** | Currency Option | AccessibilityId | `currency_option_USD`, `currency_option_INR`, etc. |
| **Top Bar** | User Profile Pill | AccessibilityId | `user_profile_pill` |
| **Top Bar** | Role Switcher Chips | AccessibilityId | `role_chip_admin`, `role_chip_vip_customer`, `role_chip_store_manager`, etc. |
| **Navigation** | Catalog Tab | AccessibilityId | `nav_catalog` |
| **Navigation** | Cart Tab | AccessibilityId | `nav_cart` |
| **Navigation** | Orders Tab | AccessibilityId | `nav_orders` |
| **Navigation** | Rentals Tab | AccessibilityId | `nav_rentals` |
| **Navigation** | QA Sandbox Tab | AccessibilityId | `nav_sandbox` |
| **Navigation** | Management Tab | AccessibilityId | `nav_management` |
| **Navigation** | Cart Badge Count | AccessibilityId | `cart_badge_count` |
| **Catalog** | Search Input | AccessibilityId | `catalog_search_input` |
| **Catalog** | Search Clear Button | AccessibilityId | `search_clear_button` |
| **Catalog** | Filter Toggle Button | AccessibilityId | `btn_toggle_filters` |
| **Catalog** | View Mode Toggle | AccessibilityId | `btn_view_mode_toggle` |
| **Catalog** | Category Chips | AccessibilityId | `category_chip_all`, `category_chip_technology`, `category_chip_science-fiction`, etc. |
| **Catalog** | Price Slider | AccessibilityId | `slider_price_filter` |
| **Catalog** | Rating Slider | AccessibilityId | `slider_rating_filter` |
| **Catalog** | Book Card | AccessibilityId | `book_card_book_001` (to `book_012`) |
| **Catalog** | Add To Cart Button | AccessibilityId | `btn_add_to_cart_book_001` |
| **Catalog** | Borrow Book Button | AccessibilityId | `btn_borrow_book_001` |
| **Book Detail** | Book Modal | AccessibilityId | `book_detail_modal` |
| **Book Detail** | Quantity Plus / Minus | AccessibilityId | `detail_qty_plus`, `detail_qty_minus` |
| **Book Detail** | Write Review Button | AccessibilityId | `btn_open_add_review` |
| **Cart** | Cart Item Card | AccessibilityId | `cart_item_book_001` |
| **Cart** | Stepper Plus / Minus | AccessibilityId | `cart_qty_plus_book_001`, `cart_qty_minus_book_001` |
| **Cart** | Remove Item Button | AccessibilityId | `cart_item_remove_book_001` |
| **Cart** | Promo Code Field | AccessibilityId | `promo_code_input` |
| **Cart** | Apply Promo Button | AccessibilityId | `btn_apply_promo` |
| **Cart** | Proceed to Shipping | AccessibilityId | `btn_proceed_to_shipping` |
| **Checkout** | Shipping Name | AccessibilityId | `input_shipping_name` |
| **Checkout** | Shipping Street | AccessibilityId | `input_shipping_street` |
| **Checkout** | Delivery Date Picker | AccessibilityId | `btn_pick_delivery_date` |
| **Checkout** | Proceed to Payment | AccessibilityId | `btn_proceed_to_payment` |
| **Checkout** | Place Order Button | AccessibilityId | `btn_place_order` |
| **Checkout** | Order Success Title | AccessibilityId | `order_success_title` |
| **Orders** | Order Card | AccessibilityId | `order_card_<orderId>` |
| **Orders** | Ship Order Button | AccessibilityId | `btn_ship_order_<orderId>` |
| **Orders** | Deliver Order Button | AccessibilityId | `btn_deliver_order_<orderId>` |
| **Orders** | Refund Order Button | AccessibilityId | `btn_refund_order_<orderId>` |
| **Rentals** | Return Book Button | AccessibilityId | `btn_return_book_<recordId>` |
| **Rentals** | Mark Lost Button | AccessibilityId | `btn_mark_lost_<recordId>` |
| **Sandbox** | Dynamic ID Toggle | AccessibilityId | `switch_toggle_dynamic_ids` |
| **Sandbox** | Swipe Carousel | AccessibilityId | `gesture_swipe_carousel` |
| **Sandbox** | Long Press Box | AccessibilityId | `gesture_long_press_target` |
| **Sandbox** | Double Tap Box | AccessibilityId | `gesture_double_tap_target` |
| **Sandbox** | Reorder Priority List | AccessibilityId | `priority_reorder_list` |
| **Sandbox** | Alert Dialog Button | AccessibilityId | `btn_trigger_alert_dialog` |
| **Sandbox** | Confirm Dialog Button | AccessibilityId | `btn_trigger_confirm_dialog` |
| **Sandbox** | Prompt Dialog Button | AccessibilityId | `btn_trigger_prompt_dialog` |
| **Sandbox** | DatePicker Button | AccessibilityId | `btn_trigger_datepicker_dialog` |
| **Sandbox** | TimePicker Button | AccessibilityId | `btn_trigger_timepicker_dialog` |
| **Sandbox** | Latency Slider | AccessibilityId | `slider_latency_simulator` |
| **Sandbox** | HTTP Error Triggers | AccessibilityId | `btn_trigger_http_400`, `btn_trigger_http_500`, etc. |
| **Sandbox** | Native Toast Button | AccessibilityId | `btn_show_native_toast` |
| **Sandbox** | Native Snackbar Button | AccessibilityId | `btn_show_snackbar_action` |
| **Sandbox** | Hybrid WebView | AccessibilityId | `hybrid_webview_container` |
| **Sandbox** | Reset Seed Data Button | AccessibilityId | `btn_reset_database_seed` |

---

## 🏃 Running Appium Automated Tests

### 1. Start Appium Server
```bash
npx appium
```

### 2. Run Python Pytest Suite
```bash
cd /home/virus/.gemini/antigravity-cli/scratch/bookstore-android/appium-tests/python
pip install -r requirements.txt
pytest -v
```
