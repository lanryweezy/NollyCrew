import { ReactNode } from "react";

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export default function ResponsiveGrid({ 
  children, 
  className = "",
  cols = { xs: 1, sm: 1, md: 2, lg: 3, xl: 4 }
}: ResponsiveGridProps) {
  const getGridClass = () => {
    const classes = [];
    
    if (cols.xs) classes.push(`grid-cols-${cols.xs} xs:grid-cols-${cols.xs}`);
    if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
    
    return classes.join(' ');
  };

  return (
    <div className={`grid gap-4 sm:gap-6 ${getGridClass()} ${className}`}>
      {children}
    </div>
  );
}