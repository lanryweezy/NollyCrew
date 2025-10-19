import { Badge } from "@/components/ui/badge";

interface ResponsiveBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}

export default function ResponsiveBadge({ 
  children,
  variant = "default",
  className = ""
}: ResponsiveBadgeProps) {
  return (
    <Badge 
      variant={variant} 
      className={`text-xs sm:text-sm ${className}`}
    >
      {children}
    </Badge>
  );
}