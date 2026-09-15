import React from 'react';
import { Category } from '../../types/index.js';
import { SearchableSelect } from '../common/SearchableSelect.js';
import { DualRangeSlider, SingleSlider } from '../common/Slider.js';
import { Filter, Search, RotateCcw, Crown } from 'lucide-react';
import { useCurrency, SUPPORTED_CURRENCIES } from '../../context/CurrencyContext.js';

interface BookFiltersProps {
  categories: Category[];
  search: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (catId: string) => void;
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
  minRating: number;
  onRatingChange: (rating: number) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  vipOnly: boolean;
  onVipOnlyChange: (val: boolean) => void;
  onReset: () => void;
}

export const BookFilters: React.FC<BookFiltersProps> = ({
  categories,
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  minPrice,
  maxPrice,
  onPriceChange,
  minRating,
  onRatingChange,
  sortBy,
  onSortChange,
  vipOnly,
  onVipOnlyChange,
  onReset
}) => {
  const { currency } = useCurrency();
  const currencySymbol = SUPPORTED_CURRENCIES[currency]?.symbol ?? '$';
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map(c => ({ value: c.id, label: c.name, badge: `${c.bookCount}` }))
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest Arrivals' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating_desc', label: 'Highest Customer Rating' },
    { value: 'title_asc', label: 'Title: A to Z' }
  ];

  return (
    <div
      data-testid="book-filters-sidebar"
      className="bg-white rounded-2xl border border-slate-200 p-5 space-y-6 shadow-sm"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <Filter className="w-4 h-4 text-brand-600" />
          <span>Filters & Search</span>
        </div>
        <button
          type="button"
          onClick={onReset}
          data-testid="clear-filters-btn"
          className="text-xs font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Search Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Keyword Search
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title, author, ISBN..."
            data-testid="filter-search-input"
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Category Dropdown */}
      <SearchableSelect
        label="Genre / Category"
        options={categoryOptions}
        value={selectedCategory}
        onChange={onCategoryChange}
        testId="filter-category-select"
        placeholder="Filter by category"
      />

      {/* Sort By Dropdown */}
      <SearchableSelect
        label="Sort Results"
        options={sortOptions}
        value={sortBy}
        onChange={onSortChange}
        testId="filter-sort-select"
      />

      {/* Dual Price Range Slider */}
      <DualRangeSlider
        label={`Price Range (${currencySymbol})`}
        min={0}
        max={120}
        minValue={minPrice}
        maxValue={maxPrice}
        step={5}
        unit={currencySymbol}
        onChange={onPriceChange}
        testId="filter-price-slider"
      />

      {/* Rating Threshold Slider */}
      <SingleSlider
        label="Minimum Star Rating"
        min={1.0}
        max={5.0}
        step={0.5}
        value={minRating}
        unit="★ "
        onChange={onRatingChange}
        testId="filter-rating-slider"
      />

      {/* VIP Exclusive Toggle */}
      <div className="pt-2 border-t border-slate-100">
        <label
          data-testid="filter-vip-label"
          className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900"
        >
          <input
            type="checkbox"
            checked={vipOnly}
            onChange={(e) => onVipOnlyChange(e.target.checked)}
            data-testid="filter-vip-checkbox"
            className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
          />
          <span className="flex items-center gap-1">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>VIP Exclusives Only</span>
          </span>
        </label>
      </div>
    </div>
  );
};
