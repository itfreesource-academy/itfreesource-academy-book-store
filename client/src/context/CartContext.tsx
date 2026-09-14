import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Book, CartItem } from '../types/index.js';
import { useAuth } from './AuthContext.js';
import { useToast } from './ToastContext.js';

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  isVip: boolean;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (book: Book, quantity?: number) => void;
  removeFromCart: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart_items');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user, hasPermission } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(items));
  }, [items]);

  const isVip = hasPermission('discount:vip') || user?.role === 'vip_customer';

  const subtotal = items.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
  const discount = isVip ? parseFloat((subtotal * 0.20).toFixed(2)) : 0;
  const taxable = Math.max(0, subtotal - discount);
  const tax = parseFloat((taxable * 0.08).toFixed(2));
  const total = parseFloat((taxable + tax).toFixed(2));
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (book: Book, quantity = 1) => {
    if (book.isVipExclusive && !isVip && user?.role !== 'admin') {
      addToast('This collector edition is exclusive to VIP Customers! Login as vip_customer to purchase.', 'warning');
      return;
    }

    if (book.stock <= 0) {
      addToast('Sorry, this book is currently out of stock.', 'error');
      return;
    }

    setItems((prev) => {
      const existing = prev.find((item) => item.book.id === book.id);
      if (existing) {
        const newQty = Math.min(book.stock, existing.quantity + quantity);
        return prev.map((item) => (item.book.id === book.id ? { ...item, quantity: newQty } : item));
      }
      return [...prev, { book, quantity: Math.min(book.stock, quantity) }];
    });

    addToast(`Added "${book.title}" to your cart.`, 'success');
  };

  const removeFromCart = (bookId: string) => {
    setItems((prev) => prev.filter((item) => item.book.id !== bookId));
    addToast('Item removed from cart.', 'info');
  };

  const updateQuantity = (bookId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(bookId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.book.id === bookId) {
          const clamped = Math.min(item.book.stock, quantity);
          return { ...item, quantity: clamped };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal: parseFloat(subtotal.toFixed(2)),
        discount,
        tax,
        total,
        isVip,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
