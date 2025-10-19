import { ReactNode } from "react";

interface ResponsiveTypographyProps {
  children: ReactNode;
  variant: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  className?: string;
  align?: "left" | "center" | "right";
}

export default function ResponsiveTypography({ 
  children, 
  variant, 
  className = "",
  align = "left"
}: ResponsiveTypographyProps) {
  const alignmentClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right"
  };

  const variantClasses = {
    h1: "text-2xl sm:text-3xl md:text-4xl font-bold",
    h2: "text-xl sm:text-2xl md:text-3xl font-bold",
    h3: "text-lg sm:text-xl md:text-2xl font-semibold",
    h4: "text-base sm:text-lg md:text-xl font-semibold",
    h5: "text-sm sm:text-base md:text-lg font-medium",
    h6: "text-xs sm:text-sm md:text-base font-medium",
    p: "text-sm sm:text-base",
    span: "text-sm sm:text-base"
  };

  const alignmentClass = alignmentClasses[align];
  const variantClass = variantClasses[variant];

  const Tag = variant;

  return (
    <Tag className={`${variantClass} ${alignmentClass} ${className}`}>
      {children}
    </Tag>
  );
}