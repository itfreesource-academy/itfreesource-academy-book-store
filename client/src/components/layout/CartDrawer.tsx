import React from 'react';
import { useCart } from '../../context/CartContext.js';
import { Drawer } from '../common/Drawer.js';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../../context/CurrencyContext.js';

export const CartDrawer: React.FC = () => {
  const {
    items,
    totalItems,
    subtotal,
    discount,
    tax,
    total,
    isVip,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity
  } = useCart();
  const { formatPrice } = useCurrency();

  return (
    <Drawer
      isOpen={isCartOpen}
      onClose={closeCart}
      title={`Your Shopping Cart (${totalItems})`}
      testId="cart-drawer"
      width="max-w-md"
    >
      <div className="flex flex-col h-full">
        {/* VIP Discount Announcement if applicable */}
        {isVip && (
          <div
            data-testid="cart-vip-discount-banner"
            className="mb-4 p-3 bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-900 font-semibold"
          >
            <Sparkles className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>VIP Member 20% discount applied to your entire cart!</span>
          </div>
        )}

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6" data-testid="empty-cart-message">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-800 mb-1">Your cart is empty</h4>
            <p className="text-xs text-slate-500 mb-4">
              Explore our comprehensive book catalog to add items for testing checkout.
            </p>
            <Link
              to="/books"
              onClick={closeCart}
              data-testid="empty-cart-browse-btn"
              className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-lg hover:bg-brand-700 transition-colors"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1" data-testid="cart-items-list">
            {items.map((item) => (
              <div
                key={item.book.id}
                data-testid={`cart-item-${item.book.id}`}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200"
              >
                <img
                  src={item.book.coverImage}
                  alt={item.book.title}
                  className="w-14 h-20 object-cover rounded-md shadow-sm flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate" title={item.book.title}>
                    {item.book.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mb-2 truncate">
                    {item.book.authorName}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-600">
                      {formatPrice(item.book.price)}
                    </span>
                    <div className="flex items-center border border-slate-300 rounded-lg bg-white">
                      <button
                        onClick={() => updateQuantity(item.book.id, item.quantity - 1)}
                        data-testid={`cart-decrease-qty-${item.book.id}`}
                        className="p-1 hover:bg-slate-100 text-slate-600 rounded-l-lg"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span
                        data-testid={`cart-qty-value-${item.book.id}`}
                        className="px-2 text-xs font-bold text-slate-800"
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.book.id, item.quantity + 1)}
                        data-testid={`cart-increase-qty-${item.book.id}`}
                        className="p-1 hover:bg-slate-100 text-slate-600 rounded-r-lg"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.book.id)}
                  data-testid={`cart-remove-item-${item.book.id}`}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pricing Summary & Checkout Button */}
        {items.length > 0 && (
          <div className="pt-4 mt-auto border-t border-slate-200 space-y-2 text-xs" data-testid="cart-summary">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span data-testid="cart-subtotal">{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-rose-600 font-semibold">
                <span>VIP Discount (20%)</span>
                <span data-testid="cart-discount">-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Estimated Tax (8%)</span>
              <span data-testid="cart-tax">{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
              <span>Order Total</span>
              <span data-testid="cart-total">{formatPrice(total)}</span>
            </div>

            <Link
              to="/checkout"
              onClick={closeCart}
              data-testid="cart-checkout-btn"
              className="w-full mt-3 flex items-center justify-center gap-2 py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 transition-all text-xs"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </Drawer>
  );
};
