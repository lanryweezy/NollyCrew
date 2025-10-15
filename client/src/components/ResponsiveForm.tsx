import { ReactNode } from "react";
import { Form } from "@/components/ui/form";

interface ResponsiveFormProps {
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
}

export default function ResponsiveForm({ 
  children, 
  onSubmit,
  className = ""
}: ResponsiveFormProps) {
  return (
    <Form onSubmit={onSubmit} className={`space-y-4 sm:space-y-6 ${className}`}>
      {children}
    </Form>
  );
}