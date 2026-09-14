import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Book } from '../../types/index.js';
import { StarRating } from '../common/StarRating.js';
import { useCart } from '../../context/CartContext.js';
import { useCurrency } from '../../context/CurrencyContext.js';
import { BorrowModal } from '../borrow/BorrowModal.js';
import { ShoppingCart, Crown, AlertCircle, Bookmark } from 'lucide-react';

interface BookCardProps {
  book: Book;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);

  return (
    <>
      <div
        data-testid={`book-card-${book.id}`}
        className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-brand-300 transition-all duration-300 flex flex-col group relative"
      >
        {/* Top Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
          {book.isVipExclusive && (
            <span
              data-testid={`vip-badge-${book.id}`}
              className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md"
            >
              <Crown className="w-3 h-3" />
              VIP ONLY
            </span>
          )}
          {book.isFeatured && !book.isVipExclusive && (
            <span
              data-testid={`featured-badge-${book.id}`}
              className="bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow"
            >
              BESTSELLER
            </span>
          )}
        </div>

        {/* Book Cover */}
        <Link
          to={`/books/${book.id}`}
          data-testid={`book-cover-link-${book.id}`}
          className="block relative aspect-[3/4] overflow-hidden bg-slate-100"
        >
          <img
            src={book.coverImage}
            alt={book.title}
            data-testid={`book-cover-img-${book.id}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {book.stock <= 0 && (
            <div
              data-testid={`out-of-stock-overlay-${book.id}`}
              className="absolute inset-0 bg-slate-900/70 flex items-center justify-center text-white font-bold text-xs"
            >
              OUT OF STOCK
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <span
            data-testid={`book-category-${book.id}`}
            className="text-[11px] font-semibold text-brand-600 mb-1 truncate uppercase tracking-wider"
          >
            {book.categoryName}
          </span>

          <Link
            to={`/books/${book.id}`}
            data-testid={`book-title-${book.id}`}
            className="font-bold text-slate-900 text-sm hover:text-brand-600 transition-colors line-clamp-2 leading-snug mb-1"
            title={book.title}
          >
            {book.title}
          </Link>

          <p
            data-testid={`book-author-${book.id}`}
            className="text-xs text-slate-500 mb-2 truncate"
          >
            by <span className="font-medium text-slate-700">{book.authorName}</span>
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3" data-testid={`book-rating-${book.id}`}>
            <StarRating rating={book.rating} size="sm" testId={`rating-stars-${book.id}`} />
            <span className="text-[11px] font-bold text-slate-700">{book.rating}</span>
            <span className="text-[11px] text-slate-400">({book.reviewCount})</span>
          </div>

          {/* Stock Alert */}
          {book.stock > 0 && book.stock < 15 && (
            <div
              data-testid={`low-stock-warning-${book.id}`}
              className="flex items-center gap-1 text-[11px] text-amber-600 font-medium mb-3"
            >
              <AlertCircle className="w-3 h-3" />
              <span>Only {book.stock} left in stock</span>
            </div>
          )}

          {/* Price & Action Buttons */}
          <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-1.5">
              <span
                data-testid={`book-price-${book.id}`}
                className="text-base font-black text-slate-900"
              >
                {formatPrice(book.price)}
              </span>
              {book.originalPrice && book.originalPrice > book.price && (
                <span
                  data-testid={`book-orig-price-${book.id}`}
                  className="text-xs text-slate-400 line-through"
                >
                  {formatPrice(book.originalPrice)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {/* Borrow Button */}
              <button
                type="button"
                onClick={() => setIsBorrowModalOpen(true)}
                data-testid={`borrow-btn-${book.id}`}
                className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 transition-colors text-xs font-semibold flex items-center gap-1"
                title={`Borrow for ${formatPrice(2.00)} / 10 days`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Borrow</span>
              </button>

              {/* Add to Cart */}
              <button
                onClick={() => addToCart(book)}
                disabled={book.stock <= 0}
                data-testid={`add-to-cart-btn-${book.id}`}
                className="p-2 rounded-xl bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white border border-brand-200 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                title="Add to Cart"
                aria-label={`Add ${book.title} to cart`}
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <BorrowModal
        book={book}
        isOpen={isBorrowModalOpen}
        onClose={() => setIsBorrowModalOpen(false)}
      />
    </>
  );
};
