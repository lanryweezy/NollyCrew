import { ReactNode } from "react";
import ResponsiveCard from "@/components/ResponsiveCard";
import ResponsiveGrid from "@/components/ResponsiveGrid";

interface CardGridItem {
  id: string;
  title?: string;
  content: ReactNode;
  className?: string;
}

interface ResponsiveCardGridProps {
  items: CardGridItem[];
  className?: string;
  cardClassName?: string;
  gridCols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export default function ResponsiveCardGrid({ 
  items,
  className = "",
  cardClassName = "",
  gridCols = { xs: 1, sm: 1, md: 2, lg: 3, xl: 4 }
}: ResponsiveCardGridProps) {
  return (
    <ResponsiveGrid cols={gridCols} className={className}>
      {items.map((item) => (
        <ResponsiveCard 
          key={item.id} 
          title={item.title}
          className={`${cardClassName} ${item.className || ""}`}
        >
          {item.content}
        </ResponsiveCard>
      ))}
    </ResponsiveGrid>
  );
}