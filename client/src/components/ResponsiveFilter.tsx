import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, X } from "lucide-react";
import ResponsiveButton from "@/components/ResponsiveButton";

interface FilterOption {
  id: string;
  label: string;
  value: string;
  checked: boolean;
}

interface ResponsiveFilterProps {
  options: FilterOption[];
  onFilterChange: (options: FilterOption[]) => void;
  className?: string;
  title?: string;
}

export default function ResponsiveFilter({ 
  options,
  onFilterChange,
  className = "",
  title = "Filter"
}: ResponsiveFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleOptionChange = (id: string) => {
    const updatedOptions = options.map(option => 
      option.id === id ? { ...option, checked: !option.checked } : option
    );
    onFilterChange(updatedOptions);
  };
  
  const clearFilters = () => {
    const clearedOptions = options.map(option => ({ ...option, checked: false }));
    onFilterChange(clearedOptions);
  };
  
  const hasActiveFilters = options.some(option => option.checked);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <ResponsiveButton 
          variant="outline" 
          className={`relative ${className}`}
        >
          <Filter className="w-4 h-4 mr-2" />
          {title}
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
          )}
        </ResponsiveButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="p-2">
          <div className="flex items-center justify-between mb-2">
            <DropdownMenuLabel className="text-sm">Filters</DropdownMenuLabel>
            {hasActiveFilters && (
              <ResponsiveButton 
                variant="ghost" 
                size="sm"
                onClick={clearFilters}
                className="h-6 px-2 text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Clear
              </ResponsiveButton>
            )}
          </div>
          <DropdownMenuSeparator />
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {options.map((option) => (
              <div key={option.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={option.id}
                  checked={option.checked}
                  onChange={() => handleOptionChange(option.id)}
                  className="w-4 h-4 text-primary border-muted-foreground rounded focus:ring-primary"
                />
                <label 
                  htmlFor={option.id} 
                  className="ml-2 text-sm font-medium text-foreground"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}