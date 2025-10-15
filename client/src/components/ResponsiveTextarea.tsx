import { TextareaHTMLAttributes } from "react";
import { Textarea } from "@/components/ui/textarea";

interface ResponsiveTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  rows?: number;
}

export default function ResponsiveTextarea({ 
  rows = 4,
  className = "",
  ...props
}: ResponsiveTextareaProps) {
  return (
    <Textarea
      rows={rows}
      className={`text-sm sm:text-base min-h-[100px] sm:min-h-[120px] ${className}`}
      {...props}
    />
  );
}