import React, { useState } from 'react';
import { Book } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { useCurrency } from '../../context/CurrencyContext.js';
import { useToast } from '../../context/ToastContext.js';
import { apiClient } from '../../api/client.js';
import { Link, useNavigate } from 'react-router-dom';

interface BorrowModalProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BorrowModal: React.FC<BorrowModalProps> = ({ book, isOpen, onClose, onSuccess }) => {
  const { isAuthenticated, user } = useAuth();
  const { currency, timezone, formatPrice, formatDateOnly } = useCurrency();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Calculate due date (10 days from now)
  const now = new Date();
  const dueDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

  const handleBorrow = async () => {
    if (!isAuthenticated) {
      addToast('Please login to borrow this book.', 'warning');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/borrow', {
        bookId: book.id,
        currency,
        timezone
      });

      addToast(`Successfully borrowed "${book.title}"! Due in 10 days.`, 'success');
      onClose();
      if (onSuccess) {
        onSuccess();
      }
      navigate('/borrowed');
    } catch (err: any) {
      addToast(err.message || 'Failed to borrow book.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">📖</span>
              <h2 className="text-xl font-bold">Borrow Book Confirmation</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition"
            >
              ✕
            </button>
          </div>
          <p className="text-blue-100 text-sm mt-1">
            Enjoy reading with flexible rental terms and automated timezone calculations.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Book Info Summary */}
          <div className="flex space-x-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-16 h-24 object-cover rounded-lg shadow-sm flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300';
              }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-base line-clamp-1">{book.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">by {book.authorName}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">
                  {book.categoryName}
                </span>
                <span className="text-xs text-slate-500">
                  Retail: <strong className="text-slate-700">{formatPrice(book.price)}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Borrow Terms Breakdown */}
          <div className="border border-indigo-100 bg-indigo-50/50 rounded-xl p-4 space-y-3">
            <h4 className="font-semibold text-indigo-950 text-sm flex items-center space-x-1.5">
              <span>📋</span>
              <span>Lending Terms & Policies</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-xs">
                <span className="text-xs text-slate-500 block">Standard Fee (10 Days)</span>
                <span className="font-bold text-blue-700 text-base">{formatPrice(2.00)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Base reading period</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-xs">
                <span className="text-xs text-slate-500 block">Overdue Penalty</span>
                <span className="font-bold text-amber-600 text-base">{formatPrice(0.10)} / day</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Applied after due date</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-xs">
                <span className="text-xs text-slate-500 block">Return Due Date</span>
                <span className="font-bold text-slate-800 text-sm">
                  {formatDateOnly(dueDate.toISOString())}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">10 days from today</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-xs">
                <span className="text-xs text-slate-500 block">Lost Book Replacement</span>
                <span className="font-bold text-rose-600 text-base">{formatPrice(book.price * 2)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">2x Book Retail Price</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-indigo-100/60">
              <span>Active Timezone: <strong className="text-slate-700">{timezone}</strong></span>
              <span>Billing Currency: <strong className="text-slate-700">{currency}</strong></span>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center justify-between">
              <span>You need to be logged in to borrow books.</span>
              <Link to="/login" className="underline font-bold hover:text-amber-900">
                Log In Now
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleBorrow}
            className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm hover:shadow transition disabled:opacity-50 flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Confirm Borrow</span>
                <span>({formatPrice(2.00)})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
