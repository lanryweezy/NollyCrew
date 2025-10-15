import { ReactNode } from "react";
import ResponsiveButton from "@/components/ResponsiveButton";
import ResponsiveTypography from "@/components/ResponsiveTypography";

interface ResponsiveEmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export default function ResponsiveEmptyState({ 
  title,
  description,
  icon,
  action,
  className = ""
}: ResponsiveEmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 sm:py-16 text-center ${className}`}>
      {icon && (
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          {icon}
        </div>
      )}
      
      <ResponsiveTypography variant="h3" align="center" className="mb-3">
        {title}
      </ResponsiveTypography>
      
      <ResponsiveTypography 
        variant="p" 
        className="text-muted-foreground max-w-md mb-8"
        align="center"
      >
        {description}
      </ResponsiveTypography>
      
      {action && (
        <ResponsiveButton onClick={action.onClick}>
          {action.label}
        </ResponsiveButton>
      )}
    </div>
  );
}