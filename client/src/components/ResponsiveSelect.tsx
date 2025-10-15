import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface ResponsiveSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}

export default function ResponsiveSelect({ 
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  className = ""
}: ResponsiveSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={`text-sm sm:text-base h-10 sm:h-11 ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            className="text-sm sm:text-base"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}