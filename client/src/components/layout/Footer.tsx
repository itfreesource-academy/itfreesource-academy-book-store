import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Github, ExternalLink, ShieldCheck, Heart, Sparkles, Globe, Smartphone, Server } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      className="bg-white dark:bg-[#0B0F17] text-slate-600 dark:text-slate-400 text-sm mt-auto border-t border-slate-200 dark:border-slate-800/80 transition-colors duration-200"
      data-testid="main-footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                  ITFreeSource
                </span>
                <span className="text-[10px] font-bold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">
                  Academy Book Store
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              A high-concurrency, enterprise-grade digital bookstore and academic lending platform engineered on global edge infrastructure.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://github.com/itfreesource-academy/itfreesource-academy-book-store"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                aria-label="GitHub Repository"
                data-testid="footer-github-link"
              >
                <Github className="w-4 h-4" />
              </a>
              <Link
                to="/swagger"
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                aria-label="Swagger API Documentation"
                data-testid="footer-swagger-link"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Store & Catalog */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3.5">
              Store &amp; Catalog
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/books" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Curated Catalog
                </Link>
              </li>
              <li>
                <Link to="/borrowed" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  10-Day Academic Loans
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Shopping Cart &amp; Checkout
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Order History &amp; Tracking
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Verified Reader Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Academy & Education */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3.5">
              Academy Curriculum
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a
                  href="https://academy.itfreesource.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 dark:text-purple-400 font-semibold hover:underline inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Practical QE Course</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <Link to="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Platform Architecture
                </Link>
              </li>
              <li>
                <Link to="/swagger" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  OpenAPI 3.0 Documentation
                </Link>
              </li>
              <li>
                <span className="text-slate-400 dark:text-slate-500 text-[11px] block">
                  Includes 11 RBAC roles, test suites, and grading rubrics hosted on the Academy.
                </span>
              </li>
            </ul>
          </div>

          {/* Infrastructure */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3.5">
              Enterprise Infrastructure
            </h4>
            <div className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-emerald-500" />
                <span>Cloudflare Edge (300+ PoPs)</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span>Real-Time 7-Currency FX Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
                <span>Native Android (Compose) App</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Idempotent Safe Checkout</span>
              </div>
            </div>
          </div>
        </div>

        {/* Attribution and Legal Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} ITFreeSource Academy. High-concurrency enterprise reference platform.</p>
          <p className="flex items-center gap-1.5">
            <span>Open Source Contribution by</span>
            <a
              href="https://www.linkedin.com/in/vishalprajapati2k25/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold transition-colors"
              data-testid="footer-creator-link"
            >
              Vishal Prajapati
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
