import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
}

export default function StarRating({
  rating,
  max = 5,
  onRatingChange,
  readonly = false,
  size = 20
}: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1;
        const isActive = starValue <= rating;
        
        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            onClick={() => onRatingChange?.(starValue)}
            className={cn(
              "transition-all duration-200",
              !readonly && "hover:scale-120 active:scale-95 cursor-pointer",
              isActive ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"
            )}
          >
            <Star size={size} strokeWidth={isActive ? 0 : 2} />
          </button>
        );
      })}
    </div>
  );
}
