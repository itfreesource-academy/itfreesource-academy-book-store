import React, { useState, useRef, useEffect } from 'react';
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
  Package,
  Layers,
  CheckSquare,
  Users,
  ScrollText,
  Clock,
  ShieldCheck,
  ChevronDown,
  RotateCcw,
  Sparkles,
  PlusCircle,
  Sun,
  Moon
} from 'lucide-react';
import { useCurrency, SUPPORTED_CURRENCIES } from '../../context/CurrencyContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import { Currency } from '../../types/index.js';
import { SellerListingModal } from '../books/SellerListingModal.js';
import { apiClient } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.js';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, hasPermission, permissions } = useAuth();
  const { totalItems, openCart } = useCart();
  const { currency, setCurrency } = useCurrency();
  const { toggleTheme, isDark } = useTheme();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isManageMenuOpen, setIsManageMenuOpen] = useState(false);
  const [isQaMenuOpen, setIsQaMenuOpen] = useState(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const manageMenuRef = useRef<HTMLDivElement>(null);
  const qaMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (manageMenuRef.current && !manageMenuRef.current.contains(event.target as Node)) {
        setIsManageMenuOpen(false);
      }
      if (qaMenuRef.current && !qaMenuRef.current.contains(event.target as Node)) {
        setIsQaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    logout();
    navigate('/login');
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset the in-memory test database back to initial seed data?')) {
      return;
    }
    setIsResetting(true);
    try {
      await apiClient.post('/system/reset');
      addToast('Test database restored to initial seed state successfully!', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 600);
    } catch (err: any) {
      addToast('Failed to reset database: ' + err.message, 'error');
    } finally {
      setIsResetting(false);
      setIsUserMenuOpen(false);
    }
  };

  // Check if user has access to any management routes
  const canManage =
    isAuthenticated &&
    (hasPermission('inventory:read') ||
      hasPermission('reviews:moderate') ||
      hasPermission('users:manage') ||
      hasPermission('audit:read') ||
      hasPermission('orders:read_all') ||
      hasPermission('orders:read_own'));

  const isSellerOrAdmin =
    isAuthenticated &&
    (user?.role === 'marketplace_seller' ||
      user?.role === 'admin' ||
      hasPermission('marketplace:sell'));

  return (
    <>
      <header className="bg-[#0B0F17]/90 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40 shadow-lg shadow-black/40" data-testid="main-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand Logo */}
            <div className="flex items-center gap-3">
              <Link
                to="/"
                data-testid="navbar-brand-logo"
                className="flex items-center gap-2.5 text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/30">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-lg text-white leading-none">
                    ITFreeSource
                  </span>
                  <span className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase mt-0.5">
                    Academy Book Store
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1" data-testid="desktop-nav-links">
              <Link
                to="/books"
                data-testid="nav-link-catalog"
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-indigo-400 hover:bg-slate-800/60 transition-colors"
              >
                Catalog
              </Link>

              <Link
                to="/borrowed"
                data-testid="nav-link-borrowed"
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-indigo-400 hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Borrowed</span>
              </Link>

              {/* Management Dropdown */}
              {canManage && (
                <div className="relative" ref={manageMenuRef}>
                  <button
                    onClick={() => {
                      setIsManageMenuOpen(!isManageMenuOpen);
                      setIsQaMenuOpen(false);
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-indigo-400 hover:bg-slate-800/60 transition-colors flex items-center gap-1"
                    data-testid="nav-manage-dropdown-btn"
                  >
                    <span>Management</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isManageMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isManageMenuOpen && (
                    <div className="absolute left-0 mt-1.5 w-52 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl py-1.5 z-50 animate-fade-in text-xs font-medium">
                      {isAuthenticated && (
                        <Link
                          to="/orders"
                          onClick={() => setIsManageMenuOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-2 text-slate-300 hover:bg-slate-800 hover:text-indigo-400"
                        >
                          <Package className="w-4 h-4 text-slate-500" />
                          <span>Orders & Checkout</span>
                        </Link>
                      )}
                      {hasPermission('inventory:read') && (
                        <Link
                          to="/inventory"
                          onClick={() => setIsManageMenuOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-2 text-slate-300 hover:bg-slate-800 hover:text-indigo-400"
                        >
                          <Layers className="w-4 h-4 text-slate-500" />
                          <span>Inventory Stock</span>
                        </Link>
                      )}
                      {hasPermission('reviews:moderate') && (
                        <Link
                          to="/reviews"
                          onClick={() => setIsManageMenuOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-2 text-slate-300 hover:bg-slate-800 hover:text-indigo-400"
                        >
                          <CheckSquare className="w-4 h-4 text-slate-500" />
                          <span>Review Moderation</span>
                        </Link>
                      )}
                      {hasPermission('users:manage') && (
                        <Link
                          to="/users"
                          onClick={() => setIsManageMenuOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-2 text-slate-300 hover:bg-slate-800 hover:text-indigo-400"
                        >
                          <Users className="w-4 h-4 text-slate-500" />
                          <span>User Management</span>
                        </Link>
                      )}
                      {hasPermission('audit:read') && (
                        <Link
                          to="/audit-logs"
                          onClick={() => setIsManageMenuOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-2 text-slate-300 hover:bg-slate-800 hover:text-indigo-400"
                        >
                          <ScrollText className="w-4 h-4 text-slate-500" />
                          <span>Audit Trail</span>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* QA & Docs Dropdown */}
              <div className="relative" ref={qaMenuRef}>
                <button
                  onClick={() => {
                    setIsQaMenuOpen(!isQaMenuOpen);
                    setIsManageMenuOpen(false);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-indigo-400 hover:bg-slate-800/60 transition-colors flex items-center gap-1"
                  data-testid="nav-qa-dropdown-btn"
                >
                  <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
                  <span>QA & Docs</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isQaMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isQaMenuOpen && (
                  <div className="absolute left-0 mt-1.5 w-56 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl py-1.5 z-50 animate-fade-in text-xs font-medium">
                    <Link
                      to="/playground"
                      onClick={() => setIsQaMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-slate-300 hover:bg-purple-950/40 hover:text-purple-300"
                    >
                      <FlaskConical className="w-4 h-4 text-purple-400" />
                      <div>
                        <div className="font-bold text-slate-100">QA Testing Sandbox</div>
                        <div className="text-[10px] text-slate-500">Chaos testing & latency</div>
                      </div>
                    </Link>
                    <Link
                      to="/coverage"
                      onClick={() => setIsQaMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-slate-300 hover:bg-amber-950/40 hover:text-amber-300"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <div>
                        <div className="font-bold text-slate-100">Test Coverage Dashboard</div>
                        <div className="text-[10px] text-slate-500">Live Istanbul & Newman stats</div>
                      </div>
                    </Link>
                    <Link
                      to="/swagger"
                      onClick={() => setIsQaMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-slate-300 hover:bg-emerald-950/40 hover:text-emerald-300"
                      data-testid="navbar-swagger-link"
                    >
                      <FileCode2 className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-bold text-slate-100">Swagger API Docs</div>
                        <div className="text-[10px] text-slate-500">Interactive OpenAPI 3.0</div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* About Project Page Link */}
              <Link
                to="/about"
                data-testid="nav-link-about"
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-indigo-400 hover:bg-slate-800/60 transition-colors"
              >
                About
              </Link>

              {/* Seller Listing Button */}
              {isSellerOrAdmin && (
                <button
                  type="button"
                  onClick={() => setIsSellerModalOpen(true)}
                  data-testid="nav-list-book-btn"
                  className="ml-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm flex items-center gap-1 transition-colors"
                  title="List a book to sell or rent with platform fee calculation"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>List Book</span>
                </button>
              )}
            </nav>

            {/* Right: Currency, Cart & User Account */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Currency Selector */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer px-1 text-xs"
                  title="Select Currency"
                  data-testid="navbar-currency-select"
                >
                  {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                    <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
              </div>

              {/* Shopping Cart Button */}
              <button
                onClick={openCart}
                data-testid="navbar-cart-btn"
                className="relative p-2 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span
                    data-testid="cart-badge-count"
                    className="absolute -top-1 -right-1 bg-indigo-600 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md shadow-indigo-500/30"
                  >
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Theme Switcher Toggle (Light vs Dark) */}
              <button
                onClick={toggleTheme}
                data-testid="navbar-theme-toggle-btn"
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle Theme"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-amber-400 animate-fade-in" />
                ) : (
                  <Moon className="w-5 h-5 text-indigo-600 animate-fade-in" />
                )}
              </button>

              {/* Authenticated User Menu or Sign In */}
              {isAuthenticated && user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    data-testid="navbar-user-dropdown-btn"
                    className="flex items-center gap-2 p-1.5 pl-2 rounded-2xl hover:bg-slate-800/70 border border-slate-800 transition-all text-left"
                  >
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      data-testid="user-avatar-img"
                      className="w-7 h-7 rounded-full object-cover border border-slate-700"
                    />
                    <div className="hidden lg:flex flex-col">
                      <span className="text-xs font-bold text-white leading-tight" data-testid="user-fullname-display">
                        {user.fullName}
                      </span>
                      <span className="text-[10px] font-semibold text-indigo-400 uppercase">
                        {user.role}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-0.5" />
                  </button>

                  {/* User Profile Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl py-2 z-50 animate-fade-in text-xs">
                      {/* User Header */}
                      <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/60">
                        <div className="font-black text-white text-sm leading-snug">
                          {user.fullName}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {user.email}
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-950/60 text-indigo-300 border border-indigo-800">
                            {user.role}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {permissions.length} perms
                          </span>
                        </div>
                      </div>

                      {/* Menu Actions */}
                      <div className="py-1">
                        <Link
                          to="/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-indigo-400 font-medium"
                        >
                          <Package className="w-4 h-4 text-slate-500" />
                          <span>My Orders & Purchases</span>
                        </Link>

                        <button
                          onClick={handleReset}
                          disabled={isResetting}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:bg-rose-950/30 hover:text-rose-400 font-medium text-left"
                        >
                          <RotateCcw className={`w-4 h-4 text-rose-500 ${isResetting ? 'animate-spin' : ''}`} />
                          <span>Reset Test Database</span>
                        </button>
                      </div>

                      {/* Sign Out */}
                      <div className="border-t border-slate-800 pt-1">
                        <button
                          onClick={handleLogout}
                          data-testid="navbar-logout-btn"
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-400 hover:bg-rose-950/40 font-bold text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link
                    to="/login"
                    data-testid="navbar-login-btn"
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-indigo-500/20 transition-all"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </Link>

                </div>
              )}

              {/* Mobile Drawer Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-300 hover:bg-slate-800"
                data-testid="mobile-menu-toggle"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-1 shadow-2xl animate-fade-in max-h-[85vh] overflow-y-auto" data-testid="mobile-menu">
            <Link
              to="/books"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-bold text-slate-200 hover:bg-slate-900"
            >
              Books Catalog
            </Link>
            <Link
              to="/borrowed"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-bold text-blue-400 bg-blue-950/30 border border-blue-900/40"
            >
              Borrowed Books Hub
            </Link>

            {isAuthenticated && (
              <Link
                to="/orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-bold text-slate-200 hover:bg-slate-900"
              >
                Orders
              </Link>
            )}

            {hasPermission('inventory:read') && (
              <Link
                to="/inventory"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-bold text-slate-200 hover:bg-slate-900"
              >
                Warehouse Inventory
              </Link>
            )}

            {hasPermission('reviews:moderate') && (
              <Link
                to="/reviews"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-bold text-slate-200 hover:bg-slate-900"
              >
                Review Moderation
              </Link>
            )}

            {hasPermission('users:manage') && (
              <Link
                to="/users"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-bold text-slate-200 hover:bg-slate-900"
              >
                User Management
              </Link>
            )}

            {hasPermission('audit:read') && (
              <Link
                to="/audit-logs"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-bold text-slate-200 hover:bg-slate-900"
              >
                Audit Trail
              </Link>
            )}

            <div className="pt-2 border-t border-slate-800 my-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 mb-1">
                Developer & QA Lab
              </div>
              <Link
                to="/playground"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-xs font-bold text-purple-400 bg-purple-950/40 border border-purple-900/30"
              >
                QA Testing Playground
              </Link>
              <Link
                to="/coverage"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-xs font-bold text-amber-400 bg-amber-950/40 border border-amber-900/30 mt-1"
              >
                Test Coverage & Automation Reports
              </Link>
              <Link
                to="/swagger"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 mt-1"
                data-testid="mobile-swagger-link"
              >
                Swagger API Documentation
              </Link>
              <Link
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-xs font-bold text-indigo-400 bg-indigo-950/40 border border-indigo-900/30 mt-1"
              >
                About & Creator
              </Link>
              {isSellerOrAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsSellerModalOpen(true);
                  }}
                  className="w-full text-left block px-3 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-950/50 border border-amber-800/40 mt-1"
                >
                  + List Book for Sale/Rent
                </button>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between px-3">
              <button
                onClick={toggleTheme}
                data-testid="mobile-theme-toggle-btn"
                className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 py-1"
              >
                {isDark ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Light Theme</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Dark Theme</span>
                  </>
                )}
              </button>

              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="text-xs font-bold text-rose-600 flex items-center gap-1 py-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Marketplace Seller Book Listing Modal */}
      <SellerListingModal
        isOpen={isSellerModalOpen}
        onClose={() => setIsSellerModalOpen(false)}
        onSuccess={() => {
          navigate('/books');
        }}
      />
    </>
  );
};

export default Navbar;
