import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResponsiveCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export default function ResponsiveCard({ 
  title, 
  children, 
  className = "",
  headerClassName = "",
  contentClassName = ""
}: ResponsiveCardProps) {
  return (
    <Card className={`h-full ${className}`}>
      {title && (
        <CardHeader className={headerClassName}>
          <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={`p-4 sm:p-6 ${contentClassName}`}>
        {children}
      </CardContent>
    </Card>
  );
}