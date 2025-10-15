import { ReactNode } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { FieldValues, UseFormReturn } from "react-hook-form";

interface ResponsiveFormFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: string;
  label: string;
  children: ReactNode;
  className?: string;
}

export default function ResponsiveFormField<T extends FieldValues>({ 
  form,
  name,
  label,
  children,
  className = ""
}: ResponsiveFormFieldProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="text-sm sm:text-base">{label}</FormLabel>
          <FormControl>
            {children}
          </FormControl>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}