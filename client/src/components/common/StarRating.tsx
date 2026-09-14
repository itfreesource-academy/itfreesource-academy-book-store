import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0 to 5
  maxStars?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  testId?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  interactive = false,
  onChange,
  size = 'md',
  testId = 'star-rating'
}) => {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex items-center gap-1" data-testid={testId} aria-label={`Rating: ${rating} out of ${maxStars}`}>
      {Array.from({ length: maxStars }).map((_, idx) => {
        const starNumber = idx + 1;
        const isFilled = starNumber <= Math.round(rating);

        return (
          <button
            type="button"
            key={idx}
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(starNumber)}
            data-testid={`${testId}-star-${starNumber}`}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-slate-100 text-slate-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};
