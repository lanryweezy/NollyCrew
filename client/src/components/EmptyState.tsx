import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <div className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4">{icon}</div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground mt-1 mb-4 max-w-sm mx-auto">{description}</p>
        {action}
      </CardContent>
    </Card>
  );
}
