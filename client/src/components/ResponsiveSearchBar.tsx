import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import ResponsiveButton from "@/components/ResponsiveButton";

interface ResponsiveSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}

export default function ResponsiveSearchBar({ 
  value,
  onChange,
  onClear,
  placeholder = "Search...",
  className = ""
}: ResponsiveSearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10 text-sm sm:text-base h-10 sm:h-11"
      />
      {value && onClear && (
        <ResponsiveButton
          variant="ghost"
          size="icon"
          onClick={onClear}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </ResponsiveButton>
      )}
    </div>
  );
}