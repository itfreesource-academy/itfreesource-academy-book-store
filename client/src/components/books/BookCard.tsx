import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Book } from '../../types/index.js';
import { StarRating } from '../common/StarRating.js';
import { useCart } from '../../context/CartContext.js';
import { useCurrency } from '../../context/CurrencyContext.js';
import { BorrowModal } from '../borrow/BorrowModal.js';
import { ShoppingCart, Crown, AlertCircle, Bookmark, Store, Building2, Info, Plus, Minus } from 'lucide-react';

interface BookCardProps {
  book: Book;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const { addToCart, items, updateQuantity } = useCart();
  const cartItem = items.find(i => i.book.id === book.id);
  const cartQty = cartItem ? cartItem.quantity : 0;
  const { formatPrice } = useCurrency();
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);

  const discountPercent =
    book.originalPrice && book.originalPrice > book.price
      ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
      : null;

  const rentalFee = book.rentalPrice || 2.00;
  const isMarketplace = book.sellerType === 'marketplace';

  return (
    <>
      <div
        data-testid={`book-card-${book.id}`}
        className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/50 transition-all duration-300 flex flex-col group relative text-slate-100"
      >
        {/* Top Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
          {book.isVipExclusive && (
            <span
              data-testid={`vip-badge-${book.id}`}
              className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md"
            >
              <Crown className="w-3 h-3" />
              VIP ONLY
            </span>
          )}

          {isMarketplace ? (
            <span
              data-testid={`seller-badge-${book.id}`}
              className="inline-flex items-center gap-1 bg-amber-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow"
              title={`Marketplace Seller: @${book.sellerUsername || 'seller'} (Subject to 10% sale commission & 15% rental fee)`}
            >
              <Store className="w-2.5 h-2.5" />
              <span>Seller: @{book.sellerUsername || 'marketplace'}</span>
            </span>
          ) : (
            <span
              data-testid={`seller-badge-${book.id}`}
              className="inline-flex items-center gap-1 bg-indigo-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow"
              title="In-House Official Academy Warehouse Inventory"
            >
              <Building2 className="w-2.5 h-2.5" />
              <span>In-House</span>
            </span>
          )}

          {discountPercent && (
            <span
              data-testid={`discount-badge-${book.id}`}
              className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow"
            >
              -{discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Book Cover */}
        <Link
          to={`/books/${book.id}`}
          data-testid={`book-cover-link-${book.id}`}
          className="block relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-slate-950 to-slate-900 border-b border-slate-800"
        >
          <img
            src={book.coverImage}
            alt={book.title}
            data-testid={`book-cover-img-${book.id}`}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop';
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 shadow-inner"
            loading="lazy"
          />
          {/* Subtle Book Spine Effect (Left Edge) */}
          <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/40 via-black/10 to-transparent pointer-events-none" />

          {book.stock <= 0 && (
            <div
              data-testid={`out-of-stock-overlay-${book.id}`}
              className="absolute inset-0 bg-slate-950/80 flex items-center justify-center text-white font-bold text-xs backdrop-blur-[1px]"
            >
              OUT OF STOCK
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <span
            data-testid={`book-category-${book.id}`}
            className="text-[11px] font-semibold text-indigo-400 mb-1 truncate uppercase tracking-wider"
          >
            {book.categoryName}
          </span>

          <Link
            to={`/books/${book.id}`}
            data-testid={`book-title-${book.id}`}
            className="font-bold text-slate-100 text-sm hover:text-indigo-400 transition-colors line-clamp-2 leading-snug mb-1"
            title={book.title}
          >
            {book.title}
          </Link>

          <p
            data-testid={`book-author-${book.id}`}
            className="text-xs text-slate-400 mb-2 truncate"
          >
            by <span className="font-medium text-slate-300">{book.authorName}</span>
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3" data-testid={`book-rating-${book.id}`}>
            <StarRating rating={book.rating} size="sm" testId={`rating-stars-${book.id}`} />
            <span className="text-[11px] font-bold text-slate-300">{book.rating}</span>
            <span className="text-[11px] text-slate-500">({book.reviewCount})</span>
          </div>

          {/* Stock Alert */}
          {book.stock > 0 && book.stock < 15 && (
            <div
              data-testid={`low-stock-warning-${book.id}`}
              className="flex items-center gap-1 text-[11px] text-amber-400 font-medium mb-3"
            >
              <AlertCircle className="w-3 h-3" />
              <span>Only {book.stock} left in stock</span>
            </div>
          )}

          {/* Multi-tier Price & QA Tooltip */}
          <div
            className="mt-auto pt-3 border-t border-slate-800 flex items-center justify-between gap-2"
            title={`QA Multi-Tier Pricing: List Price (MSRP): ${formatPrice(
              book.originalPrice || book.price
            )} | Active Selling Price: ${formatPrice(book.price)} | Academic Rental Fee: ${formatPrice(
              rentalFee
            )} / 10 days | Seller: ${isMarketplace ? `@${book.sellerUsername}` : 'In-House'}`}
            data-testid={`pricing-breakdown-${book.id}`}
          >
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <span
                  data-testid={`book-price-${book.id}`}
                  className="text-base font-black text-white"
                >
                  {formatPrice(book.price)}
                </span>
                {book.originalPrice && book.originalPrice > book.price && (
                  <span
                    data-testid={`book-orig-price-${book.id}`}
                    className="text-xs text-slate-500 line-through"
                  >
                    {formatPrice(book.originalPrice)}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                Rent: {formatPrice(rentalFee)} / 10d
              </span>
            </div>

            {/* Dual Mode Action Buttons: Buy to Own vs Rent */}
            <div className="flex items-center gap-1.5">
              {/* Borrow Button */}
              <button
                type="button"
                onClick={() => setIsBorrowModalOpen(true)}
                data-testid={`borrow-btn-${book.id}`}
                className="px-2.5 py-1.5 rounded-lg bg-blue-950/50 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-800/50 transition-colors text-xs font-semibold flex items-center gap-1"
                title={`Academic 10-day borrow for ${formatPrice(rentalFee)}`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Borrow</span>
              </button>

              {/* Add to Cart / Quantity Stepper (Buy to Own) */}
              {cartQty > 0 ? (
                <div
                  className="flex items-center border border-slate-700 rounded-xl bg-slate-800/90 overflow-hidden"
                  data-testid={`cart-qty-stepper-${book.id}`}
                >
                  <button
                    type="button"
                    onClick={() => updateQuantity(book.id, cartQty - 1)}
                    data-testid={`cart-qty-minus-${book.id}`}
                    className="px-2 py-1.5 hover:bg-rose-950/40 text-rose-400 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span
                    data-testid={`cart-qty-val-${book.id}`}
                    className="px-2.5 text-xs font-black text-indigo-300 min-w-[1.5rem] text-center"
                  >
                    {cartQty}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(book.id, cartQty + 1)}
                    disabled={cartQty >= book.stock}
                    data-testid={`cart-qty-plus-${book.id}`}
                    className="px-2 py-1.5 hover:bg-emerald-950/40 text-emerald-400 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addToCart(book)}
                  disabled={book.stock <= 0}
                  data-testid={`add-to-cart-btn-${book.id}`}
                  className="px-2.5 py-1.5 rounded-xl bg-indigo-950/50 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-800/50 transition-colors disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 text-xs font-bold"
                  title={`Buy to own for ${formatPrice(book.price)}`}
                  aria-label={`Buy ${book.title} to own`}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Buy</span>
                </button>
              )}
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

export default BookCard;
