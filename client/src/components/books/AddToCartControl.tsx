import React from 'react';
import { ShoppingCart, Minus, Plus } from 'lucide-react';
import { Book } from '../../types/index.js';
import { useCart } from '../../context/CartContext.js';

export interface AddToCartControlProps {
  book: Book;
  size?: 'sm' | 'md' | 'lg';
  showInCartLabel?: boolean;
  initialQuantity?: number;
  className?: string;
  testIdPrefix?: string;
}

export const AddToCartControl: React.FC<AddToCartControlProps> = ({
  book,
  size = 'sm',
  showInCartLabel = false,
  initialQuantity = 1,
  className = '',
  testIdPrefix = '',
}) => {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const cartQty = getItemQuantity(book.id);

  const isOutOfStock = book.stock <= 0;

  // Sizing styles
  const btnPadding =
    size === 'lg'
      ? 'py-3 px-6 text-xs sm:text-sm'
      : size === 'md'
      ? 'py-2.5 px-4 text-xs sm:text-sm'
      : 'px-2.5 py-1.5 text-xs';

  const iconSize =
    size === 'lg' ? 'w-4 h-4' : size === 'md' ? 'w-3.5 h-3.5' : 'w-3.5 h-3.5';
  const stepperIconSize =
    size === 'lg' ? 'w-4 h-4' : size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3';

  const stepperPadding =
    size === 'lg'
      ? 'px-4 py-3'
      : size === 'md'
      ? 'px-3 py-2'
      : 'px-2 py-1.5';

  const countTextSize =
    size === 'lg'
      ? 'px-4 text-sm font-black text-indigo-400 min-w-[2.5rem]'
      : size === 'md'
      ? 'px-3 text-xs sm:text-sm font-black text-indigo-300 min-w-[2rem]'
      : 'px-2.5 text-xs font-black text-indigo-300 min-w-[1.5rem]';

  const addTestId =
    testIdPrefix ||
    (size === 'lg' ? 'detail-add-to-cart-btn' : `add-to-cart-btn-${book.id}`);

  if (cartQty > 0) {
    return (
      <div
        className={`flex items-center border border-indigo-500/70 rounded-xl bg-slate-900/90 overflow-hidden shadow-sm select-none ${className}`}
        data-testid={`cart-qty-stepper-${book.id}`}
      >
        <button
          type="button"
          onClick={() => updateQuantity(book.id, cartQty - 1)}
          data-testid={`cart-qty-minus-${book.id}`}
          className={`${stepperPadding} hover:bg-rose-950/50 text-rose-400 transition-colors font-bold flex items-center justify-center`}
          aria-label="Decrease quantity"
        >
          <Minus className={stepperIconSize} />
        </button>

        <span
          data-testid={`cart-qty-val-${book.id}`}
          className={`${countTextSize} text-center`}
        >
          {showInCartLabel ? `${cartQty} in cart` : cartQty}
        </span>

        <button
          type="button"
          onClick={() => updateQuantity(book.id, cartQty + 1)}
          disabled={cartQty >= book.stock}
          data-testid={`cart-qty-plus-${book.id}`}
          className={`${stepperPadding} hover:bg-emerald-950/50 text-emerald-400 disabled:opacity-30 disabled:hover:bg-transparent transition-colors font-bold flex items-center justify-center`}
          aria-label="Increase quantity"
        >
          <Plus className={stepperIconSize} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => addToCart(book, initialQuantity)}
      disabled={isOutOfStock}
      data-testid={addTestId}
      className={`rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-bold transition-all shadow-md shadow-indigo-600/25 flex items-center justify-center gap-1.5 ${btnPadding} ${className}`}
      title={isOutOfStock ? 'Out of stock' : 'Buy to own - Add to cart'}
    >
      <ShoppingCart className={iconSize} />
      <span>{isOutOfStock ? 'Out of Stock' : size === 'sm' ? 'Add' : 'Add to Cart'}</span>
    </button>
  );
};
