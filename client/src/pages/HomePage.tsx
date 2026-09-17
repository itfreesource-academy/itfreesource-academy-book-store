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
          className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm dark:shadow-xl dark:shadow-black/30 text-slate-900 dark:text-white"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/40 flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-2xl font-black text-slate-900 dark:text-white" data-testid="stat-total-books">
                {stats.totalBooks}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Curated Titles</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800/40 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-2xl font-black text-slate-900 dark:text-white" data-testid="stat-total-users">
                12,500+
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Readers</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-2xl font-black text-slate-900 dark:text-white" data-testid="stat-verified-rating">
                4.9 / 5.0
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Reader Satisfaction</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/40 flex items-center justify-center font-bold">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-2xl font-black text-slate-900 dark:text-white" data-testid="stat-stock-units">
                {stats.totalStockUnits}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Available in Stock</span>
            </div>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <section data-testid="featured-categories-section">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Explore by Category</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Discover hand-picked books across engineering and literature</p>
          </div>
          <Link
            to="/books"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
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
              className="p-5 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:shadow-lg dark:hover:shadow-indigo-500/5 transition-all group flex flex-col justify-between text-slate-900 dark:text-white"
            >
              <div>
                <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/40 px-2.5 py-0.5 rounded-full mb-2 inline-block">
                  {cat.bookCount} Books Available
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1">
                  {cat.name}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
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
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Popular & Recommended Titles</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Top-rated software engineering, science fiction, and leadership classics</p>
          </div>
          <Link
            to="/books"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
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

      {/* Academic & Professional Reading Showcase */}
      <section
        data-testid="enterprise-feature-callout"
        className="rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-slate-900 dark:via-brand-950 dark:to-slate-900 text-slate-900 dark:text-white p-8 md:p-12 border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-sm dark:shadow-2xl"
      >
        <div className="max-w-3xl space-y-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-500/30 inline-block">
            Academic & Professional Reading
          </span>
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
            Curated Literature for Engineers, Architects & Leaders
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Expand your technical mastery with industry-standard texts spanning cloud infrastructure, cybersecurity, full-stack systems, and engineering leadership. Enjoy flexible 10-day digital loans, permanent volume purchases, and synchronized reading across web and mobile.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Instant Global Multi-Currency Checkout</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Flexible 10-Day Academic Book Lending</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Verified Reader Community Reviews & Ratings</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Real-Time Warehouse Stock & Digital Delivery</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              to="/books"
              data-testid="home-cta-books"
              className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-500/30 transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore Complete Catalog</span>
            </Link>
            <Link
              to="/borrowed"
              data-testid="home-cta-borrowed"
              className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border-white/10 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Academic Loan Hub</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
