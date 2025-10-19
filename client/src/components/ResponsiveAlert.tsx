import { ReactNode } from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

interface ResponsiveAlertProps {
  title?: string;
  description: string | ReactNode;
  variant?: "default" | "destructive" | "success" | "warning";
  className?: string;
}

export default function ResponsiveAlert({ 
  title,
  description,
  variant = "default",
  className = ""
}: ResponsiveAlertProps) {
  const getIcon = () => {
    switch (variant) {
      case "success":
        return <CheckCircle className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "destructive":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const variantClasses = {
    default: "bg-background text-foreground border",
    destructive: "bg-destructive/10 text-destructive border-destructive/50",
    success: "bg-green-500/10 text-green-500 border-green-500/50",
    warning: "bg-yellow-500/10 text-yellow-500 border-yellow-500/50"
  };

  return (
    <Alert className={`${variantClasses[variant]} ${className}`}>
      {getIcon()}
      <div>
        {title && (
          <AlertTitle className="text-sm sm:text-base font-medium">
            {title}
          </AlertTitle>
        )}
        <AlertDescription className="text-xs sm:text-sm">
          {description}
        </AlertDescription>
      </div>
    </Alert>
  );
}