import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Book, Review } from '../types/index.js';
import { apiClient } from '../api/client.js';
import { Breadcrumbs } from '../components/common/Breadcrumbs.js';
import { StarRating } from '../components/common/StarRating.js';
import { Modal } from '../components/common/Modal.js';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { useCurrency } from '../context/CurrencyContext.js';
import { BorrowModal } from '../components/borrow/BorrowModal.js';
import {
  ShoppingCart,
  Plus,
  Minus,
  Crown,
  Share2,
  Calendar,
  BookOpen,
  FileText,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Bookmark,
  Store,
  Building2,
  Info
} from 'lucide-react';

export const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'reviews'>('overview');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { addToCart, isVip, items, updateQuantity } = useCart();
  const { isAuthenticated, user, hasPermission } = useAuth();
  const { addToast } = useToast();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchBookData = async () => {
      setLoading(true);
      try {
        const [bookRes, reviewsRes] = await Promise.all([
          apiClient.get(`/books/${id}`),
          apiClient.get(`/reviews?bookId=${id}`)
        ]);
        setBook(bookRes.data.book);
        setReviews(reviewsRes.data.reviews || []);
      } catch (err: any) {
        addToast(err.message || 'Error loading book details.', 'error');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBookData();
  }, [id, addToast]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) return;

    setIsSubmittingReview(true);
    try {
      const res = await apiClient.post('/reviews', {
        bookId: book.id,
        rating: newRating,
        title: newTitle,
        comment: newComment
      });

      if (res.data.review.status === 'approved') {
        setReviews([res.data.review, ...reviews]);
        addToast('Your review has been verified and published!', 'success');
      } else {
        addToast('Review submitted! It will appear after moderator approval.', 'info');
      }

      setIsReviewModalOpen(false);
      setNewTitle('');
      setNewComment('');
    } catch (err: any) {
      addToast(err.message || 'Failed to submit review.', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center" data-testid="detail-loading">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-semibold">Loading book details...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200" data-testid="book-not-found">
        <h2 className="text-lg font-bold text-slate-800 mb-2">Book Not Found</h2>
        <Link to="/books" className="text-xs font-bold text-brand-600 hover:underline">
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16" data-testid="book-detail-page">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Catalog', href: '/books' },
          { label: book.categoryName, href: `/books?category=${book.categoryId}` },
          { label: book.title }
        ]}
      />

      {/* Main Book Presentation Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-10 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Cover Image & Badges */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-sm aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-50">
              <img
                src={book.coverImage}
                alt={book.title}
                data-testid="detail-cover-img"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop';
                }}
                className="w-full h-full object-cover"
              />
              {/* Subtle Book Spine Effect (Left Edge) */}
              <div className="absolute inset-y-0 left-0 w-3.5 bg-gradient-to-r from-black/25 via-black/5 to-transparent pointer-events-none" />
              {book.isVipExclusive && (
                <div
                  data-testid="detail-vip-badge"
                  className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5"
                >
                  <Crown className="w-4 h-4" />
                  <span>VIP EXCLUSIVE EDITION</span>
                </div>
              )}
            </div>

            {/* Quick Share / Metadata pill */}
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">ISBN-13:</span>
              <span data-testid="detail-isbn">{book.isbn}</span>
            </div>
          </div>

          {/* Right Column: Book Details & Actions */}
          <div className="md:col-span-7 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span
                data-testid="detail-category-badge"
                className="px-2.5 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-md uppercase tracking-wider"
              >
                {book.categoryName}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span data-testid="detail-pages" className="text-xs text-slate-500 font-medium">
                {book.pages} pages
              </span>
            </div>

            <h1
              data-testid="detail-book-title"
              className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2"
            >
              {book.title}
            </h1>

            <p data-testid="detail-author" className="text-sm text-slate-600 mb-4">
              Written by <span className="font-bold text-slate-900">{book.authorName}</span>
            </p>

            {/* Rating Stars & Review count link */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <StarRating rating={book.rating} size="md" testId="detail-rating-stars" />
                <span data-testid="detail-rating-num" className="text-sm font-bold text-slate-900">
                  {book.rating}
                </span>
              </div>
              <span className="text-xs text-slate-400">•</span>
              <button
                onClick={() => setActiveTab('reviews')}
                data-testid="detail-reviews-jump-btn"
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                {reviews.length} Verified Customer Reviews
              </button>
            </div>

            {/* Price & Multi-Tier Pricing Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex flex-wrap items-baseline gap-3">
                <span data-testid="detail-price" className="text-3xl font-black text-slate-900">
                  {formatPrice(book.price)}
                </span>
                {book.originalPrice && book.originalPrice > book.price && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400 line-through" data-testid="detail-list-price">
                      List: {formatPrice(book.originalPrice)}
                    </span>
                    <span
                      data-testid="detail-discount-badge"
                      className="text-xs font-black text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded"
                    >
                      Save {Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)}% OFF
                    </span>
                  </div>
                )}
              </div>

              {/* Academic Rental Price */}
              <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50/70 border border-blue-100 px-3 py-1.5 rounded-xl max-w-fit">
                <Bookmark className="w-3.5 h-3.5" />
                <span className="font-semibold">
                  10-Day Academic Borrowing: <strong className="text-blue-900">{formatPrice(book.rentalPrice || 2.00)}</strong>
                </span>
              </div>

              {/* Seller Persona & Platform Fee Metadata */}
              <div
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1"
                data-testid="detail-seller-box"
                title={`QA Platform Fee Rule: Marketplace sales incur 10% commission (${formatPrice(
                  book.price * 0.1
                )}), rentals incur 15% platform fee (${formatPrice((book.rentalPrice || 2.0) * 0.15)}).`}
              >
                <div className="flex items-center gap-2">
                  {book.sellerType === 'marketplace' ? (
                    <span className="inline-flex items-center gap-1 text-amber-800 font-bold bg-amber-100 border border-amber-200 px-2 py-0.5 rounded">
                      <Store className="w-3 h-3 text-amber-600" />
                      <span>Marketplace Seller: @{book.sellerUsername || 'marketplace_seller'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-indigo-800 font-bold bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                      <Building2 className="w-3 h-3 text-indigo-600" />
                      <span>Fulfillment: ITFreeSource In-House Warehouse</span>
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400">|</span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {book.sellerType === 'marketplace'
                      ? '10% Sale Commission | 15% Rental Fee'
                      : 'Zero-Fee Direct Academy Fulfillment'}
                  </span>
                </div>
              </div>
            </div>

            {/* VIP Discount Notification */}
            {isVip && (
              <div
                data-testid="detail-vip-discount-banner"
                className="mb-6 p-3.5 bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-900 font-semibold"
              >
                <Crown className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <span>
                  VIP Customer Benefit: Extra 20% discount applied at checkout! (Final: {formatPrice(book.price * 0.8)})
                </span>
              </div>
            )}

            {/* Short Synopsis */}
            <p data-testid="detail-synopsis" className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              {book.description}
            </p>

            {/* Stock Availability Badge */}
            <div className="mb-6">
              {book.stock > 0 ? (
                <span
                  data-testid="detail-stock-badge"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>In Stock ({book.stock} units available)</span>
                </span>
              ) : (
                <span
                  data-testid="detail-out-of-stock-badge"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200"
                >
                  Out of Stock
                </span>
              )}
            </div>

            {/* Quantity Selector, Add to Cart & Borrow Button */}
            <div className="flex flex-wrap items-center gap-3 mt-auto pt-6 border-t border-slate-100">
              {/* Quantity picker to select how many to add */}
              <div className="flex items-center border border-slate-300 rounded-xl bg-white p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  data-testid="qty-decrement-btn"
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span
                  data-testid="detail-quantity-value"
                  className="px-4 text-xs font-bold text-slate-800"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(book.stock, q + 1))}
                  data-testid="qty-increment-btn"
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Cart stepper or Add to Cart button */}
              {(() => {
                const cartItem = items.find(i => i.book.id === book.id);
                const cartQty = cartItem ? cartItem.quantity : 0;
                return cartQty > 0 ? (
                  <div
                    className="flex items-center border-2 border-brand-500 rounded-xl bg-white overflow-hidden shadow-sm"
                    data-testid={`cart-qty-stepper-${book.id}`}
                  >
                    <button
                      type="button"
                      onClick={() => updateQuantity(book.id, cartQty - 1)}
                      data-testid={`cart-qty-minus-${book.id}`}
                      className="px-4 py-3 hover:bg-rose-50 text-rose-600 transition-colors font-bold"
                      aria-label="Remove one from cart"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span
                      data-testid={`cart-qty-val-${book.id}`}
                      className="px-4 text-sm font-black text-brand-700 min-w-[2.5rem] text-center"
                    >
                      {cartQty} in cart
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(book.id, cartQty + 1)}
                      disabled={cartQty >= book.stock}
                      data-testid={`cart-qty-plus-${book.id}`}
                      className="px-4 py-3 hover:bg-emerald-50 text-emerald-600 transition-colors font-bold disabled:opacity-40 disabled:pointer-events-none"
                      aria-label="Add one more to cart"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => addToCart(book, quantity)}
                    disabled={book.stock <= 0}
                    data-testid="detail-add-to-cart-btn"
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-6 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                );
              })()}

              <button
                type="button"
                onClick={() => setIsBorrowModalOpen(true)}
                data-testid="detail-borrow-btn"
                className="flex items-center justify-center gap-2 py-3 px-5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm"
                title={`Borrow this book for ${formatPrice(2.00)} for 10 days`}
              >
                <Bookmark className="w-4 h-4" />
                <span>Borrow ({formatPrice(2.00)})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Component */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm" data-testid="detail-tabs-container">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('overview')}
            data-testid="tab-header-overview"
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-brand-600 text-brand-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Overview & Topics</span>
          </button>

          <button
            onClick={() => setActiveTab('specs')}
            data-testid="tab-header-specs"
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'specs'
                ? 'border-brand-600 text-brand-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Specifications</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            data-testid="tab-header-reviews"
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'reviews'
                ? 'border-brand-600 text-brand-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Reviews ({reviews.length})</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="p-6 md:p-8">
          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6 text-xs text-slate-600 leading-relaxed" data-testid="tab-content-overview">
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2">Book Description</h4>
                <p className="whitespace-pre-line text-slate-700 leading-normal">{book.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2">Key Themes & Tags</h4>
                <div className="flex flex-wrap gap-1.5" data-testid="detail-tags-list">
                  {book.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-medium"
                      data-testid={`tag-chip-${tag}`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Specifications */}
          {activeTab === 'specs' && (
            <div className="max-w-xl text-xs" data-testid="tab-content-specs">
              <dl className="divide-y divide-slate-100">
                <div className="py-3 grid grid-cols-3">
                  <dt className="font-semibold text-slate-500">ISBN-13</dt>
                  <dd className="col-span-2 text-slate-900 font-medium">{book.isbn}</dd>
                </div>
                <div className="py-3 grid grid-cols-3">
                  <dt className="font-semibold text-slate-500">Author</dt>
                  <dd className="col-span-2 text-slate-900 font-medium">{book.authorName}</dd>
                </div>
                <div className="py-3 grid grid-cols-3">
                  <dt className="font-semibold text-slate-500">Category</dt>
                  <dd className="col-span-2 text-slate-900 font-medium">{book.categoryName}</dd>
                </div>
                <div className="py-3 grid grid-cols-3">
                  <dt className="font-semibold text-slate-500">Print Length</dt>
                  <dd className="col-span-2 text-slate-900 font-medium">{book.pages} pages</dd>
                </div>
                <div className="py-3 grid grid-cols-3">
                  <dt className="font-semibold text-slate-500">Publication Date</dt>
                  <dd className="col-span-2 text-slate-900 font-medium">{book.publicationDate}</dd>
                </div>
                <div className="py-3 grid grid-cols-3">
                  <dt className="font-semibold text-slate-500">Language</dt>
                  <dd className="col-span-2 text-slate-900 font-medium">English (Standard Edition)</dd>
                </div>
              </dl>
            </div>
          )}

          {/* Tab 3: Customer Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-6" data-testid="tab-content-reviews">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <h4 className="text-base font-bold text-slate-900">Verified Reader Critiques</h4>
                  <p className="text-xs text-slate-500">Share your review and rating with our academy community</p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  data-testid="write-review-btn"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                >
                  Write a Review
                </button>
              </div>

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs" data-testid="no-reviews-msg">
                  No verified reviews yet. Be the first to critique this title!
                </div>
              ) : (
                <div className="space-y-4" data-testid="reviews-list">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      data-testid={`review-card-${rev.id}`}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">@{rev.username}</span>
                          {rev.isVerifiedPurchase && (
                            <span
                              data-testid={`verified-badge-${rev.id}`}
                              className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full"
                              title="Verified by system: Reader purchased or borrowed this title"
                            >
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>Verified Purchaser</span>
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <StarRating rating={rev.rating} size="sm" />
                      </div>
                      <h5 className="font-bold text-slate-800 text-xs">{rev.title}</h5>
                      <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Write Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={`Critique: ${book.title}`}
        testId="review-modal"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReviewSubmit}
              disabled={isSubmittingReview || !newTitle || !newComment}
              data-testid="review-submit-btn"
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </>
        }
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs" data-testid="review-form">
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Overall Rating
            </label>
            <StarRating
              rating={newRating}
              interactive
              onChange={setNewRating}
              size="lg"
              testId="review-form-star-rating"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Review Headline
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Masterpiece of Software Craftsmanship"
              data-testid="review-form-title-input"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Detailed Critique
            </label>
            <textarea
              rows={4}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your constructive thoughts on the concepts and examples..."
              data-testid="review-form-comment-textarea"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>
        </form>
      </Modal>

      {/* Borrow Book Confirmation Modal */}
      {book && (
        <BorrowModal
          book={book}
          isOpen={isBorrowModalOpen}
          onClose={() => setIsBorrowModalOpen(false)}
        />
      )}
    </div>
  );
};
