import { ReactNode } from "react";
import ResponsiveContainer from "@/components/ResponsiveContainer";

interface ResponsiveSectionProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  padding?: "none" | "small" | "medium" | "large";
  background?: "default" | "muted" | "primary";
}

export default function ResponsiveSection({ 
  children, 
  className = "",
  containerClassName = "",
  padding = "medium",
  background = "default"
}: ResponsiveSectionProps) {
  const paddingClasses = {
    none: "",
    small: "py-4 sm:py-6",
    medium: "py-8 sm:py-12 md:py-16",
    large: "py-12 sm:py-16 md:py-24"
  };

  const backgroundClasses = {
    default: "bg-background",
    muted: "bg-muted/50",
    primary: "bg-primary/5"
  };

  return (
    <section className={`${backgroundClasses[background]} ${paddingClasses[padding]} ${className}`}>
      <ResponsiveContainer className={containerClassName}>
        {children}
      </ResponsiveContainer>
    </section>
  );
}