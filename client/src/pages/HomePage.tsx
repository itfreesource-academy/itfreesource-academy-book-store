import React, { useState, useEffect } from 'react';
import { Book, Category } from '../types/index.js';
import { apiClient } from '../api/client.js';
import { BookCarousel } from '../components/books/BookCarousel.js';
import { BookCard } from '../components/books/BookCard.js';
import { Link } from 'react-router-dom';
import {
  Shield,
  FileCode2,
  Sliders,
  Sparkles,
  ArrowRight,
  BookOpen,
  Layers,
  Users,
  CheckCircle2
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksRes, catsRes, statsRes] = await Promise.all([
          apiClient.get('/books?limit=8'),
          apiClient.get('/categories'),
          apiClient.get('/system/stats')
        ]);
        setBooks(booksRes.data.books || []);
        setCategories(catsRes.data.categories || []);
        setStats(statsRes.data.stats || null);
      } catch (err) {
        console.error('Failed to load home page data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-12 pb-16" data-testid="home-page">
      {/* Hero Carousel */}
      {books.length > 0 && <BookCarousel books={books} />}

      {/* Stats Counter Bar */}
      {stats && (
        <div
          data-testid="stats-counter-bar"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-2xl font-black text-slate-900" data-testid="stat-total-books">
                {stats.totalBooks}
              </span>
              <span className="text-xs text-slate-500 font-medium">Catalog Titles</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-2xl font-black text-slate-900" data-testid="stat-total-users">
                10
              </span>
              <span className="text-xs text-slate-500 font-medium">RBAC Test Personas</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FileCode2 className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-2xl font-black text-slate-900" data-testid="stat-swagger-apis">
                25+
              </span>
              <span className="text-xs text-slate-500 font-medium">Swagger CRUD APIs</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-2xl font-black text-slate-900" data-testid="stat-stock-units">
                {stats.totalStockUnits}
              </span>
              <span className="text-xs text-slate-500 font-medium">Units in Warehouse</span>
            </div>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <section data-testid="featured-categories-section">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Explore by Category</h3>
            <p className="text-xs text-slate-500">Discover hand-picked books across engineering and literature</p>
          </div>
          <Link
            to="/books"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/books?category=${cat.id}`}
              data-testid={`category-card-${cat.id}`}
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-brand-400 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider bg-brand-50 px-2 py-0.5 rounded-full mb-2 inline-block">
                  {cat.bookCount} Books Available
                </span>
                <h4 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors mb-1">
                  {cat.name}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-600 group-hover:translate-x-1 transition-transform">
                <span>Browse Category</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bestsellers Grid */}
      <section data-testid="bestsellers-section">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Popular & Recommended Titles</h3>
            <p className="text-xs text-slate-500">Top-rated software engineering, science fiction, and leadership classics</p>
          </div>
          <Link
            to="/books"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
          >
            <span>Browse All {books.length} Books</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.slice(0, 8).map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* QA Automation & SDET Feature Callout */}
      <section
        data-testid="qa-feature-callout"
        className="rounded-3xl bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 text-white p-8 md:p-12 border border-slate-800 relative overflow-hidden"
      >
        <div className="max-w-3xl space-y-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30 inline-block">
            QA Engineering Showcase
          </span>
          <h3 className="text-2xl md:text-3xl font-extrabold text-white">
            Engineered for Modern Test Automation & LinkedIn Portfolios
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Every element in this platform is intentionally outfitted with standard <code className="text-brand-300 bg-brand-950/80 px-1 py-0.5 rounded">data-testid</code> attributes, semantic ARIA labels, and explicit roles. Test frameworks like Playwright, Cypress, Selenium, and Appium can easily target calendars, sliders, modals, breadcrumbs, and Shadow DOM components.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="flex items-center gap-2 text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>10 Distinct User Personas & RBAC</span>
            </div>
            <div className="flex items-center gap-2 text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Full OpenAPI 3.0 Swagger at /api/swagger</span>
            </div>
            <div className="flex items-center gap-2 text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Network Latency & Error Code Simulators</span>
            </div>
            <div className="flex items-center gap-2 text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>1-Click Instant Test Database Reset</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              to="/playground"
              data-testid="home-cta-playground"
              className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-500/30 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore QA Sandbox</span>
            </Link>
            <a
              href="/api/swagger"
              onClick={(e) => { e.preventDefault(); window.open('/api/swagger', '_blank', 'noopener,noreferrer'); }}
              data-testid="home-cta-swagger"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileCode2 className="w-4 h-4" />
              <span>View Swagger UI ↗</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
