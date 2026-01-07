"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  onRatingChange?: (rating: number) => void;
  className?: string;
  readonly?: boolean;
}

export function StarRating({
  rating,
  maxRating = 5,
  onRatingChange,
  className,
  readonly = false,
}: StarRatingProps) {
  return (
    <div className={cn("flex gap-1", className)}>
      {Array.from({ length: maxRating }).map((_, i) => (
        <button
          key={i}
          type="button"
          disabled={readonly}
          onClick={() => onRatingChange?.(i + 1)}
          className={cn(
            "transition-colors",
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110",
            i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          )}
        >
          <Star size={20} />
        </button>
      ))}
    </div>
  );
}
