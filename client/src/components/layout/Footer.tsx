import React from 'react';
import { BookOpen, Github, ExternalLink, ShieldCheck, Terminal, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800" data-testid="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="font-bold text-base">ITFreeSource Academy</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              A comprehensive TypeScript fullstack platform, React SPA, and automated testing playground featuring 10 RBAC user personas, CRUD APIs, Swagger documentation, and interactive QA components.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/itfreesource-academy/itfreesource-academy-book-store"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="GitHub Repository"
                data-testid="footer-github-link"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="/api/swagger"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Swagger Documentation"
                data-testid="footer-swagger-link"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Platform Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/about" className="hover:text-white transition-colors text-indigo-400 font-semibold">About & Creator</a></li>
              <li><a href="/books" className="hover:text-white transition-colors">Book Catalog</a></li>
              <li><a href="/borrowed" className="hover:text-white transition-colors text-blue-400">Borrowed Books Hub</a></li>
              <li><a href="/coverage" className="hover:text-white transition-colors text-amber-400">QA & Coverage Dashboard</a></li>
              <li><a href="/playground" className="hover:text-white transition-colors text-purple-400">QA Automation Sandbox</a></li>
              <li><a href="/orders" className="hover:text-white transition-colors">Order Management</a></li>
              <li><a href="/inventory" className="hover:text-white transition-colors">Warehouse Inventory</a></li>
              <li><a href="/users" className="hover:text-white transition-colors">User Management</a></li>
              <li><a href="/reviews" className="hover:text-white transition-colors">Review Moderation</a></li>
            </ul>
          </div>

          {/* Test Engineering Features */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Automation Highlights</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 11 Distinct QA Personas</li>
              <li className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-brand-400" /> Latency & Chaos Simulators</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Multi-Currency & Timezones</li>
              <li className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-rose-400" /> Shadow DOM & iFrame Sandbox</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Instant DB Reset Endpoint</li>
            </ul>
          </div>

          {/* API & Docs */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">OpenAPI & Swagger</h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Explore and test all RESTful CRUD endpoints interactively in the Swagger UI.
            </p>
            <a
              href="/api/swagger"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="footer-swagger-badge"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 text-xs font-semibold transition-all"
            >
              <span>Launch Swagger UI</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ITFreeSource Academy. Created with ❤️ for SDET & Test Automation Engineering Excellence.</p>
          <p className="flex items-center gap-1.5">
            <span>Open Source Contribution by</span>
            <a
              href="https://www.linkedin.com/in/vishalprajapati2k25/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
            >
              Vishal Prajapati
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
