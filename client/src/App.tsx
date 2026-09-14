import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext.js';
import { AuthProvider } from './context/AuthContext.js';
import { CartProvider } from './context/CartContext.js';
import { QuickRoleBar } from './components/layout/QuickRoleBar.js';
import { Navbar } from './components/layout/Navbar.js';
import { Footer } from './components/layout/Footer.js';
import { CartDrawer } from './components/layout/CartDrawer.js';

import { HomePage } from './pages/HomePage.js';
import { BooksCatalogPage } from './pages/BooksCatalogPage.js';
import { BookDetailPage } from './pages/BookDetailPage.js';
import { CartCheckoutPage } from './pages/CartCheckoutPage.js';
import { OrdersPage } from './pages/OrdersPage.js';
import { InventoryPage } from './pages/InventoryPage.js';
import { ReviewsPage } from './pages/ReviewsPage.js';
import { UsersPage } from './pages/UsersPage.js';
import { AuditLogsPage } from './pages/AuditLogsPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { PlaygroundPage } from './pages/PlaygroundPage.js';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-brand-600 selection:text-white">
              {/* Sticky Top QA Switcher Bar */}
              <QuickRoleBar />

              {/* Main App Navbar */}
              <Navbar />

              {/* Global Slide-Over Shopping Cart */}
              <CartDrawer />

              {/* Main Content Area */}
              <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/books" element={<BooksCatalogPage />} />
                  <Route path="/books/:id" element={<BookDetailPage />} />
                  <Route path="/cart" element={<CartCheckoutPage />} />
                  <Route path="/checkout" element={<CartCheckoutPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/reviews" element={<ReviewsPage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/audit-logs" element={<AuditLogsPage />} />
                  <Route path="/playground" element={<PlaygroundPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              {/* Footer */}
              <Footer />
            </div>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
