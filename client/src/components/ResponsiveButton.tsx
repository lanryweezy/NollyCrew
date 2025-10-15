import { ButtonHTMLAttributes, ReactNode } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";

interface ResponsiveButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonProps["variant"];
  size?: "default" | "sm" | "lg" | "icon";
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

export default function ResponsiveButton({ 
  children, 
  variant = "default", 
  size = "default",
  icon,
  iconPosition = "left",
  className = "",
  ...props
}: ResponsiveButtonProps) {
  const sizeClasses = {
    default: "h-10 px-4 py-2 text-sm sm:text-base",
    sm: "h-9 px-3 text-xs sm:text-sm",
    lg: "h-11 px-8 text-base sm:text-lg",
    icon: "h-10 w-10"
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`${sizeClasses[size]} ${className}`}
      {...props}
    >
      {icon && iconPosition === "left" && <span className="mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === "right" && <span className="ml-2">{icon}</span>}
    </Button>
  );
}