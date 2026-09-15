import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Book, Category, Author } from '../types/index.js';
import { apiClient } from '../api/client.js';
import { Breadcrumbs } from '../components/common/Breadcrumbs.js';
import { BookCard } from '../components/books/BookCard.js';
import { BookTable } from '../components/books/BookTable.js';
import { BookFilters } from '../components/books/BookFilters.js';
import { BookFormModal } from '../components/books/BookFormModal.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { LayoutGrid, Table, Plus, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

export const BooksCatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(120);
  const [minRating, setMinRating] = useState(1.0);
  const [sortBy, setSortBy] = useState('newest');
  const [vipOnly, setVipOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filterTab, setFilterTab] = useState<'all' | 'in_house' | 'marketplace' | 'rental'>('all');

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const { hasPermission } = useAuth();
  const { addToast } = useToast();

  const filteredBooks = books.filter((b) => {
    if (filterTab === 'in_house') return b.sellerType !== 'marketplace';
    if (filterTab === 'marketplace') return b.sellerType === 'marketplace';
    if (filterTab === 'rental') return (b.rentalPrice && b.rentalPrice > 0);
    return true;
  });

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit,
        sortBy,
        minPrice,
        maxPrice,
        minRating
      };

      if (search) params.search = search;
      if (selectedCategory !== 'all') params.categoryId = selectedCategory;
      if (vipOnly) params.isVipExclusive = true;

      const res = await apiClient.get('/books', { params });
      setBooks(res.data.books || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err: any) {
      addToast(err.message || 'Failed to load books catalog.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, minPrice, maxPrice, minRating, search, selectedCategory, vipOnly, addToast]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catsRes, authsRes] = await Promise.all([
          apiClient.get('/categories'),
          apiClient.get('/authors')
        ]);
        setCategories(catsRes.data.categories || []);
        setAuthors(authsRes.data.authors || []);
      } catch (err) {
        console.error('Metadata load error', err);
      }
    };
    fetchMetadata();
  }, []);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setMinPrice(0);
    setMaxPrice(120);
    setMinRating(1.0);
    setSortBy('newest');
    setVipOnly(false);
    setPage(1);
    setSearchParams({});
  };

  const handleSaveBook = async (bookData: Partial<Book>) => {
    if (editingBook) {
      await apiClient.put(`/books/${editingBook.id}`, bookData);
      addToast(`Book "${bookData.title}" updated successfully!`, 'success');
    } else {
      await apiClient.post('/books', bookData);
      addToast(`Book "${bookData.title}" created successfully!`, 'success');
    }
    fetchBooks();
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this book?')) return;
    try {
      await apiClient.delete(`/books/${id}`);
      addToast('Book deleted successfully.', 'info');
      fetchBooks();
    } catch (err: any) {
      addToast(err.message || 'Failed to delete book.', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-16" data-testid="catalog-page">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Catalog' }]} />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white" data-testid="catalog-title">
            Book Catalog
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Showing {books.length} of {total} available titles
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            data-testid="toggle-mobile-filters"
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-800 rounded-xl border border-slate-700 hover:bg-slate-700"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
            <span>Filters</span>
          </button>

          {/* Grid vs Table View Mode Toggle */}
          <div className="flex items-center border border-slate-700 rounded-xl p-0.5 bg-slate-950" data-testid="view-mode-toggle">
            <button
              onClick={() => setViewMode('grid')}
              data-testid="view-grid-btn"
              title="Grid View"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              data-testid="view-table-btn"
              title="Table View"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-4 h-4" />
            </button>
          </div>

          {/* Add Book Button (Requires catalog:create) */}
          {hasPermission('catalog:create') && (
            <button
              onClick={() => {
                setEditingBook(null);
                setIsFormOpen(true);
              }}
              data-testid="add-new-book-btn"
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Book</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Layout: Sidebar Filters + Books Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <div className={`lg:block ${isMobileFiltersOpen ? 'block' : 'hidden'} lg:col-span-1`}>
          <BookFilters
            categories={categories}
            search={search}
            onSearchChange={setSearch}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceChange={(min, max) => {
              setMinPrice(min);
              setMaxPrice(max);
            }}
            minRating={minRating}
            onRatingChange={setMinRating}
            sortBy={sortBy}
            onSortChange={setSortBy}
            vipOnly={vipOnly}
            onVipOnlyChange={setVipOnly}
            onReset={handleResetFilters}
          />
        </div>

        {/* Books Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Persona & Purchase Mode Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-xl" data-testid="catalog-mode-tabs">
            <button
              onClick={() => setFilterTab('all')}
              data-testid="filter-tab-all"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700'
              }`}
            >
              All Titles ({books.length})
            </button>
            <button
              onClick={() => setFilterTab('in_house')}
              data-testid="filter-tab-in-house"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterTab === 'in_house'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700'
              }`}
            >
              🏢 In-House Catalog
            </button>
            <button
              onClick={() => setFilterTab('marketplace')}
              data-testid="filter-tab-marketplace"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterTab === 'marketplace'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700'
              }`}
            >
              🏪 Marketplace Sellers
            </button>
            <button
              onClick={() => setFilterTab('rental')}
              data-testid="filter-tab-rental"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterTab === 'rental'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700'
              }`}
            >
              🔖 Academic 10-Day Rental
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" data-testid="loading-skeletons">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="bg-slate-900/90 rounded-2xl border border-slate-800 aspect-[3/4] p-4 animate-pulse">
                  <div className="w-full h-3/5 bg-slate-800 rounded-xl mb-3" />
                  <div className="w-3/4 h-4 bg-slate-800 rounded mb-2" />
                  <div className="w-1/2 h-3 bg-slate-800 rounded" />
                </div>
              ))}
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-12 text-center shadow-xl" data-testid="no-books-found">
              <h3 className="text-base font-bold text-white mb-1">No Books Found</h3>
              <p className="text-xs text-slate-400 mb-4">
                Try adjusting your search criteria, price range sliders, or filter tabs.
              </p>
              <button
                onClick={() => {
                  setFilterTab('all');
                  handleResetFilters();
                }}
                data-testid="reset-filters-empty-btn"
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30"
              >
                Clear All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
              data-testid="books-grid"
            >
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <BookTable
              books={filteredBooks}
              onEdit={(book) => {
                setEditingBook(book);
                setIsFormOpen(true);
              }}
              onDelete={handleDeleteBook}
            />
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div
              data-testid="pagination-controls"
              className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
            >
              {/* Items per page selector */}
              <div className="flex items-center gap-2 text-slate-400">
                <span>Show:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(parseInt(e.target.value, 10));
                    setPage(1);
                  }}
                  data-testid="page-limit-select"
                  className="px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="6">6 per page</option>
                  <option value="12">12 per page</option>
                  <option value="24">24 per page</option>
                </select>
              </div>

              {/* Page navigation */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  data-testid="pagination-prev-btn"
                  className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-slate-300"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  const isCurrent = pNum === page;
                  return (
                    <button
                      key={pNum}
                      onClick={() => setPage(pNum)}
                      data-testid={`pagination-page-${pNum}`}
                      className={`w-8 h-8 rounded-lg font-bold transition-colors ${
                        isCurrent
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  data-testid="pagination-next-btn"
                  className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-slate-300"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Book Add/Edit Form Modal */}
      <BookFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSaveBook}
        initialData={editingBook}
        categories={categories}
        authors={authors}
      />
    </div>
  );
};
