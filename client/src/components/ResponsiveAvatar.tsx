import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ResponsiveAvatarProps {
  src?: string;
  alt?: string;
  fallback: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function ResponsiveAvatar({ 
  src,
  alt = "",
  fallback,
  size = "md",
  className = ""
}: ResponsiveAvatarProps) {
  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-xl"
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback className="text-xs sm:text-sm">
        {fallback}
      </AvatarFallback>
    </Avatar>
  );
}