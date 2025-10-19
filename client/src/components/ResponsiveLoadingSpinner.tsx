import { Loader2 } from "lucide-react";
import ResponsiveTypography from "@/components/ResponsiveTypography";

interface ResponsiveLoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function ResponsiveLoadingSpinner({ 
  message = "Loading...",
  size = "md",
  className = ""
}: ResponsiveLoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 className={`animate-spin text-primary ${sizeClasses[size]}`} />
      {message && (
        <ResponsiveTypography 
          variant="p" 
          className="text-muted-foreground mt-2"
        >
          {message}
        </ResponsiveTypography>
      )}
    </div>
  );
}