import { ReactNode } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ResponsiveButton from "@/components/ResponsiveButton";

interface ResponsiveCarouselProps {
  items: ReactNode[];
  className?: string;
  showNavigation?: boolean;
  showIndicators?: boolean;
}

export default function ResponsiveCarousel({ 
  items,
  className = "",
  showNavigation = true,
  showIndicators = true
}: ResponsiveCarouselProps) {
  return (
    <div className={`relative ${className}`}>
      <Carousel className="w-full">
        <CarouselContent>
          {items.map((item, index) => (
            <CarouselItem key={index} className="basis-full sm:basis-1/2 lg:basis-1/3">
              {item}
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {showNavigation && (
          <>
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
          </>
        )}
      </Carousel>
      
      {showIndicators && (
        <div className="flex justify-center mt-4 space-x-2">
          {items.map((_, index) => (
            <ResponsiveButton
              key={index}
              variant="outline"
              size="icon"
              className="w-3 h-3 rounded-full p-0"
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}