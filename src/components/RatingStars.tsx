import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
}

export function RatingStars({ rating, onRate, readonly = false }: RatingStarsProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onRate?.(star)}
          disabled={readonly}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          <Star
            className={`h-5 w-5 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-600">{rating}/5</span>
    </div>
  );
}
