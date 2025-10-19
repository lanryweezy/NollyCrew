import { cn } from "@/lib/utils";

interface ResponsiveSkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
}

export default function ResponsiveSkeleton({ 
  className = "",
  width = "100%",
  height = "1rem",
  rounded = "md"
}: ResponsiveSkeletonProps) {
  const roundedClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full"
  };

  return (
    <div 
      className={cn(
        "animate-pulse bg-muted",
        roundedClasses[rounded],
        className
      )}
      style={{ width, height }}
    />
  );
}