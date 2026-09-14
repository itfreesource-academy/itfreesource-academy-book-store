import React, { useState, useEffect, useRef } from 'react';
import { Book } from '../../types/index.js';
import { ChevronLeft, ChevronRight, Play, Pause, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext.js';
import { Link } from 'react-router-dom';

interface BookCarouselProps {
  books: Book[];
}

export const BookCarousel: React.FC<BookCarouselProps> = ({ books }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const timerRef = useRef<any>(null);
  const { addToCart } = useCart();

  const featured = books.filter(b => b.isFeatured || b.isVipExclusive).slice(0, 5);

  useEffect(() => {
    if (isAutoplay && featured.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % featured.length);
      }, 5000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoplay, featured.length]);

  if (featured.length === 0) return null;

  const currentBook = featured[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? featured.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featured.length);
  };

  return (
    <div
      data-testid="featured-carousel"
      className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl border border-slate-800"
    >
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-8 min-h-[380px]">
        {/* Left: Book Highlight Info */}
        <div className="flex-1 space-y-4 max-w-xl">
          <div className="flex items-center gap-2">
            <span
              data-testid="carousel-badge-type"
              className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30"
            >
              {currentBook.isVipExclusive ? 'VIP Exclusive Spotlight' : 'Featured Bestseller'}
            </span>
            <span className="text-xs text-slate-400">
              Slide {currentIndex + 1} of {featured.length}
            </span>
          </div>

          <h2
            data-testid="carousel-book-title"
            className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight"
          >
            {currentBook.title}
          </h2>

          <p data-testid="carousel-book-author" className="text-sm text-slate-300">
            by <span className="font-semibold text-brand-300">{currentBook.authorName}</span> • {currentBook.categoryName}
          </p>

          <p
            data-testid="carousel-book-desc"
            className="text-xs sm:text-sm text-slate-400 line-clamp-3 leading-relaxed"
          >
            {currentBook.description}
          </p>

          {/* Rating & Price */}
          <div className="flex items-center gap-6 pt-2">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-sm">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{currentBook.rating}</span>
              <span className="text-slate-400 font-normal text-xs">({currentBook.reviewCount} reviews)</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span data-testid="carousel-book-price" className="text-2xl font-black text-white">
                ${currentBook.price.toFixed(2)}
              </span>
              {currentBook.originalPrice && (
                <span className="text-xs text-slate-400 line-through">
                  ${currentBook.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => addToCart(currentBook)}
              data-testid="carousel-add-to-cart-btn"
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-xl shadow-lg shadow-brand-500/30 transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
            <Link
              to={`/books/${currentBook.id}`}
              data-testid="carousel-view-details-btn"
              className="px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors"
            >
              View Full Details
            </Link>
          </div>
        </div>

        {/* Right: Book Cover Showcase */}
        <div className="relative flex-shrink-0">
          <div className="relative w-48 sm:w-60 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10">
            <img
              src={currentBook.coverImage}
              alt={currentBook.title}
              data-testid="carousel-book-image"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Carousel Controls: Arrows, Dots, Play/Pause */}
      <div className="px-6 py-4 bg-slate-950/60 border-t border-white/5 flex items-center justify-between">
        {/* Play/Pause Autoplay Toggle */}
        <button
          onClick={() => setIsAutoplay(!isAutoplay)}
          data-testid="carousel-autoplay-toggle"
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
          title={isAutoplay ? 'Pause Autoplay' : 'Start Autoplay'}
        >
          {isAutoplay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isAutoplay ? 'Autoplay On' : 'Autoplay Paused'}</span>
        </button>

        {/* Indicator Dots */}
        <div className="flex items-center gap-2" data-testid="carousel-dots">
          {featured.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              data-testid={`carousel-dot-${idx}`}
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex ? 'w-6 bg-brand-500' : 'w-2 bg-slate-600 hover:bg-slate-500'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Prev / Next Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            data-testid="carousel-prev-btn"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            data-testid="carousel-next-btn"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
