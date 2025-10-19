import { ReactNode } from "react";
import ResponsiveCard from "@/components/ResponsiveCard";

interface CardListItem {
  id: string;
  content: ReactNode;
  className?: string;
}

interface ResponsiveCardListProps {
  items: CardListItem[];
  className?: string;
  cardClassName?: string;
}

export default function ResponsiveCardList({ 
  items,
  className = "",
  cardClassName = ""
}: ResponsiveCardListProps) {
  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {items.map((item) => (
        <ResponsiveCard 
          key={item.id} 
          className={`${cardClassName} ${item.className || ""}`}
        >
          {item.content}
        </ResponsiveCard>
      ))}
    </div>
  );
}