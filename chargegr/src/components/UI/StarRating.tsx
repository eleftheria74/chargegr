'use client';

import { Star } from 'lucide-react';

interface Props {
  rating: number;         // 0-5, supports decimals
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const SIZES = { sm: 14, md: 18, lg: 24 };

export default function StarRating({ rating, size = 'md', interactive = false, onChange }: Props) {
  const px = SIZES[size];

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => {
        const filled = rating >= i;
        const half = !filled && rating >= i - 0.5;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i)}
            className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
          >
            <Star
              size={px}
              className={
                filled
                  ? 'text-yellow-400 fill-yellow-400'
                  : half
                    ? 'text-yellow-400 fill-yellow-400/50'
                    : 'text-gray-300'
              }
            />
          </button>
        );
      })}
    </div>
  );
}
