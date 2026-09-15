import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { useCurrency } from '../../context/CurrencyContext.js';
import { apiClient } from '../../api/client.js';
import { Store, Tag, HelpCircle, X, Check, DollarSign, Percent } from 'lucide-react';

interface SellerListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SellerListingModal: React.FC<SellerListingModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { formatPrice } = useCurrency();

  const [title, setTitle] = useState('');
  const [isbn, setIsbn] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [categoryId, setCategoryId] = useState('cat_tech');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80');
  const [originalPrice, setOriginalPrice] = useState(39.99); // MSRP
  const [sellingPrice, setSellingPrice] = useState(29.99); // Active price
  const [costPrice, setCostPrice] = useState(18.00); // Wholesale cost
  const [rentalPrice, setRentalPrice] = useState(2.00); // 10-day rental
  const [stock, setStock] = useState(25);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // 10% platform sale fee, 15% platform rental fee
  const saleFee = Number((sellingPrice * 0.10).toFixed(2));
  const sellerSalePayout = Number((sellingPrice - saleFee).toFixed(2));
  const rentalFee = Number((rentalPrice * 0.15).toFixed(2));
  const sellerRentalPayout = Number((rentalPrice - rentalFee).toFixed(2));
  const markdownSavings = Math.max(0, Number((originalPrice - sellingPrice).toFixed(2)));
  const markdownPercent = originalPrice > 0 ? Math.round((markdownSavings / originalPrice) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !isbn || !authorName) {
      addToast('Please fill in all required book details.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const categoryNames: Record<string, string> = {
        cat_tech: 'Technology & Programming',
        cat_scifi: 'Science Fiction',
        cat_psych: 'Psychology & Growth',
        cat_biz: 'Business & Leadership',
        cat_history: 'History & Philosophy'
      };

      await apiClient.post('/books', {
        title,
        isbn,
        authorName,
        authorId: 'aut_seller_custom',
        categoryId,
        categoryName: categoryNames[categoryId] || 'General Literature',
        price: Number(sellingPrice),
        originalPrice: Number(originalPrice),
        costPrice: Number(costPrice),
        rentalPrice: Number(rentalPrice),
        discountPercent: markdownPercent,
        stock: Number(stock),
        coverImage,
        description: description || 'Independent marketplace listing on ITFreeSource Academy Book Store.',
        pages: 320,
        publicationDate: new Date().toISOString().split('T')[0],
        tags: ['Marketplace', 'Community', 'Independent'],
        isFeatured: false,
        isVipExclusive: false,
        sellerType: 'marketplace',
        sellerUsername: user?.username || 'marketplace_seller',
        sellerId: user?.id || 'usr_seller',
        platformFeePercentSale: 10,
        platformFeePercentRental: 15
      });

      addToast(`Book "${title}" listed successfully on the marketplace!`, 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      addToast(err.message || 'Failed to list book.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold leading-tight">Marketplace Seller Portal</h3>
              <p className="text-amber-100 text-xs">
                List your book for Sale and 10-day Academic Rental with automatic platform fee calculation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Book Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Zero to Production in Rust"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Author Name *</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Luca Palmieri"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ISBN-13 *</label>
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="978-XXXXXXXXXX"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="cat_tech">Technology & Programming</option>
                <option value="cat_scifi">Science Fiction</option>
                <option value="cat_psych">Psychology & Growth</option>
                <option value="cat_biz">Business & Leadership</option>
                <option value="cat_history">History & Philosophy</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Cover Image URL</label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://covers.openlibrary.org/b/isbn/..."
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Pricing & Markdown Architecture */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-amber-600" />
                <span>Multi-Tier Pricing & Markdown Configuration</span>
              </span>
              <span
                className="text-[11px] text-slate-400 cursor-help flex items-center gap-1"
                title="List Price is struck through as MSRP. Selling Price is the deal price. Platform fee is deducted from net payout."
                data-testid="qa-pricing-rules-tooltip"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>QA Formula Guide</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  List Price (MSRP)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(parseFloat(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Selling Price (Deal)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.5"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-emerald-700 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Rental (10 Days)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.5"
                  value={rentalPrice}
                  onChange={(e) => setRentalPrice(parseFloat(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-blue-700 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Inventory Units
                </label>
                <input
                  type="number"
                  min="1"
                  value={stock}
                  onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold"
                  required
                />
              </div>
            </div>

            {/* Live Platform Fee Breakdown for QA Testers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div
                className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1"
                data-testid="qa-sale-fee-breakdown"
                title={`Sale Calculation: Selling Price ${formatPrice(sellingPrice)} minus 10% platform fee (${formatPrice(saleFee)}) = Net Payout ${formatPrice(sellerSalePayout)}`}
              >
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold">Retail Sale (10% Fee):</span>
                  <span className="font-mono text-rose-600">-{formatPrice(saleFee)}</span>
                </div>
                <div className="flex items-center justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                  <span>Seller Net Payout:</span>
                  <span className="text-emerald-600">{formatPrice(sellerSalePayout)}</span>
                </div>
              </div>

              <div
                className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1"
                data-testid="qa-rental-fee-breakdown"
                title={`Rental Calculation: 10-day rate ${formatPrice(rentalPrice)} minus 15% platform fee (${formatPrice(rentalFee)}) = Net Payout ${formatPrice(sellerRentalPayout)}`}
              >
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold">10-Day Rental (15% Fee):</span>
                  <span className="font-mono text-rose-600">-{formatPrice(rentalFee)}</span>
                </div>
                <div className="flex items-center justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                  <span>Seller Net Payout:</span>
                  <span className="text-blue-600">{formatPrice(sellerRentalPayout)}</span>
                </div>
              </div>
            </div>

            {/* Markdown Display Indicator */}
            {markdownPercent > 0 && (
              <div className="p-2 rounded-lg bg-rose-50 text-rose-800 text-[11px] font-semibold flex items-center justify-between">
                <span>Customer Sees: <span className="line-through text-slate-400">{formatPrice(originalPrice)}</span> &rarr; <strong className="text-emerald-700">{formatPrice(sellingPrice)}</strong></span>
                <span className="bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full text-[10px] font-black">
                  {markdownPercent}% OFF (Save {formatPrice(markdownSavings)})
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Book Overview / Synopsis</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a comprehensive synopsis for readers and reviewers..."
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-amber-600/20"
              data-testid="submit-marketplace-listing-btn"
            >
              {isSubmitting ? 'Publishing...' : 'Publish to Marketplace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
