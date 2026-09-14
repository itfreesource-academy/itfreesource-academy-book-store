import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useCart } from '../../context/CartContext.js';
import {
  BookOpen,
  ShoppingCart,
  Menu,
  X,
  FileCode2,
  FlaskConical,
  LogOut,
  LogIn,
  User as UserIcon,
  Package,
  Layers,
  CheckSquare,
  Users,
  ScrollText,
  Clock,
  DollarSign,
  ShieldCheck
} from 'lucide-react';
import { useCurrency, SUPPORTED_CURRENCIES, SUPPORTED_TIMEZONES } from '../../context/CurrencyContext.js';
import { Currency, Timezone } from '../../types/index.js';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, hasPermission } = useAuth();
  const { totalItems, openCart } = useCart();
  const { currency, setCurrency, timezone, setTimezone } = useCurrency();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm" data-testid="main-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              data-testid="navbar-brand-logo"
              className="flex items-center gap-2 text-brand-600 hover:text-brand-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg text-slate-900 leading-tight">
                  ITFreeSource
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-brand-600 uppercase">
                  Academy Book Store
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1" data-testid="desktop-nav-links">
            <Link
              to="/books"
              data-testid="nav-link-catalog"
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-50 transition-colors"
            >
              Catalog
            </Link>

            {/* Borrowed Books Hub */}
            <Link
              to="/borrowed"
              data-testid="nav-link-borrowed"
              className="px-3 py-2 rounded-lg text-sm font-medium text-blue-700 hover:text-blue-800 hover:bg-blue-50 transition-colors flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Borrowed</span>
            </Link>

            {isAuthenticated && (
              <Link
                to="/orders"
                data-testid="nav-link-orders"
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <Package className="w-4 h-4 text-slate-400" />
                Orders
              </Link>
            )}

            {hasPermission('inventory:read') && (
              <Link
                to="/inventory"
                data-testid="nav-link-inventory"
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <Layers className="w-4 h-4 text-slate-400" />
                Inventory
              </Link>
            )}

            {hasPermission('reviews:moderate') && (
              <Link
                to="/reviews"
                data-testid="nav-link-reviews"
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <CheckSquare className="w-4 h-4 text-slate-400" />
                Moderation
              </Link>
            )}

            {hasPermission('users:manage') && (
              <Link
                to="/users"
                data-testid="nav-link-users"
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <Users className="w-4 h-4 text-slate-400" />
                Users
              </Link>
            )}

            {hasPermission('audit:read') && (
              <Link
                to="/audit-logs"
                data-testid="nav-link-audit"
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <ScrollText className="w-4 h-4 text-slate-400" />
                Audit Logs
              </Link>
            )}

            {/* QA Testing Sandbox link */}
            <Link
              to="/playground"
              data-testid="nav-link-playground"
              className="px-3 py-2 rounded-lg text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors flex items-center gap-1.5 ml-1 border border-purple-200"
            >
              <FlaskConical className="w-4 h-4 text-purple-600" />
              <span>QA Sandbox</span>
            </Link>

            {/* Test Coverage Dashboard link */}
            <Link
              to="/coverage"
              data-testid="nav-link-coverage"
              className="px-3 py-2 rounded-lg text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors flex items-center gap-1.5 ml-1 border border-amber-200"
              title="Test Coverage & Automation Suite Quality Dashboard"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Coverage</span>
            </Link>

            {/* Swagger UI Interactive Link */}
            <a
              href="/api/swagger"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="nav-link-swagger"
              className="px-3 py-2 rounded-lg text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 ml-1 border border-emerald-200"
              title="Interactive Swagger UI with JWT Bearer Authentication"
            >
              <FileCode2 className="w-4 h-4 text-emerald-600" />
              <span>Swagger API</span>
            </a>
          </nav>

          {/* Right Action Icons & Auth Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Currency Selector */}
            <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-1 text-xs">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer px-1"
                title="Select Active Currency"
                data-testid="navbar-currency-select"
              >
                {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
            </div>
            {/* Shopping Cart Button */}
            <button
              onClick={openCart}
              data-testid="navbar-cart-btn"
              className="relative p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span
                  data-testid="cart-badge-count"
                  className="absolute -top-1 -right-1 bg-brand-600 text-white font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow"
                >
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Profile or Login */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  data-testid="user-avatar-img"
                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                />
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 leading-tight" data-testid="user-fullname-display">
                    {user.fullName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    @{user.username}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  data-testid="navbar-logout-btn"
                  title="Log out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                data-testid="navbar-login-btn"
                className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              data-testid="mobile-menu-toggle"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg animate-fade-in" data-testid="mobile-menu">
          <Link
            to="/books"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Catalog
          </Link>
          <Link
            to="/borrowed"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-blue-700 bg-blue-50"
          >
            Borrowed Books & Rental Hub
          </Link>
          {isAuthenticated && (
            <Link
              to="/orders"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
            >
              Orders
            </Link>
          )}
          {hasPermission('inventory:read') && (
            <Link
              to="/inventory"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
            >
              Inventory
            </Link>
          )}
          {hasPermission('reviews:moderate') && (
            <Link
              to="/reviews"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
            >
              Moderation
            </Link>
          )}
          {hasPermission('users:manage') && (
            <Link
              to="/users"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
            >
              User Management
            </Link>
          )}
          {hasPermission('audit:read') && (
            <Link
              to="/audit-logs"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
            >
              Audit Logs
            </Link>
          )}
          <Link
            to="/playground"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-purple-700 bg-purple-50"
          >
            QA Testing Playground
          </Link>
          <Link
            to="/coverage"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-amber-700 bg-amber-50"
          >
            Test Coverage & QA Reports
          </Link>
          <a
            href="/api/swagger"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-3 py-2 rounded-lg text-base font-medium text-emerald-700 bg-emerald-50"
          >
            Swagger API Docs (/api/swagger)
          </a>
        </div>
      )}
    </header>
  );
};
