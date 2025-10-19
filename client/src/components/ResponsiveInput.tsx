import { InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";

interface ResponsiveInputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "underlined";
}

export default function ResponsiveInput({ 
  variant = "default",
  className = "",
  ...props
}: ResponsiveInputProps) {
  const baseClasses = "text-sm sm:text-base h-10 sm:h-11";
  
  const variantClasses = {
    default: "border-input bg-background",
    underlined: "border-0 border-b-2 border-input bg-transparent rounded-none focus:border-primary"
  };

  return (
    <Input
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}