import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  MapPin, 
  Filter,
  X,
  SlidersHorizontal
} from "lucide-react";

export interface FilterState {
  search: string;
  location: string;
  role: string;
  experience: string;
  budget: number[];
  skills: string[];
  availability: string;
}

export interface SearchFiltersProps {
  type: "jobs" | "people" | "projects";
  onFiltersChange: (filters: FilterState) => void;
  showAdvanced?: boolean;
}

export default function SearchFilters({ 
  type, 
  onFiltersChange,
  showAdvanced = false 
}: SearchFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    location: "",
    role: "",
    experience: "",
    budget: [0, 100],
    skills: [],
    availability: ""
  });

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(showAdvanced);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const updateFilters = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);

    // Update active filters for display
    const active = Object.entries(newFilters)
      .filter(([k, v]) => {
        if (k === "search" || k === "location") return v !== "";
        if (k === "budget") return Array.isArray(v) && typeof v[0] === 'number' && typeof v[1] === 'number' && (v[0] > 0 || v[1] < 100);
        if (k === "skills") return Array.isArray(v) && v.length > 0;
        return v !== "" && v !== undefined;
      })
      .map(([k]) => k);
    setActiveFilters(active);
  };

  const clearFilter = (key: keyof FilterState) => {
    let clearedValue: any;
    if (key === "budget") clearedValue = [0, 100];
    else if (key === "skills") clearedValue = [];
    else clearedValue = "";
    
    updateFilters(key, clearedValue);
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      search: "",
      location: "",
      role: "",
      experience: "",
      budget: [0, 100],
      skills: [],
      availability: ""
    };
    setFilters(clearedFilters);
    setActiveFilters([]);
    onFiltersChange(clearedFilters);
  };

  const skillOptions = {
    jobs: ["Acting", "Director", "Cinematography", "Editing", "Sound", "Production"],
    people: ["Lead Actor", "Supporting Actor", "Director", "Producer", "Cinematographer", "Editor"],
    projects: ["Feature Film", "Short Film", "Web Series", "Documentary", "Commercial", "Music Video"]
  };

  const getPlaceholderText = () => {
    const placeholders = {
      jobs: "Search casting calls, crew positions...",
      people: "Search actors, directors, crew...",
      projects: "Search film projects, series..."
    };
    return placeholders[type];
  };

  return (
    <Card className="w-full" data-testid={`search-filters-${type}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search & Filters
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            data-testid="button-toggle-advanced"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            {isAdvancedOpen ? "Hide" : "Show"} Advanced
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Primary Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={getPlaceholderText()}
              value={filters.search}
              onChange={(e) => updateFilters("search", e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          <div className="relative min-w-[200px]">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Location"
              value={filters.location}
              onChange={(e) => updateFilters("location", e.target.value)}
              className="pl-10"
              data-testid="input-location"
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Select value={filters.role} onValueChange={(value) => updateFilters("role", value)}>
            <SelectTrigger className="w-[150px]" data-testid="select-role">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="actor">Actor</SelectItem>
              <SelectItem value="director">Director</SelectItem>
              <SelectItem value="producer">Producer</SelectItem>
              <SelectItem value="crew">Crew</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.experience} onValueChange={(value) => updateFilters("experience", value)}>
            <SelectTrigger className="w-[150px]" data-testid="select-experience">
              <SelectValue placeholder="Experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entry">Entry Level</SelectItem>
              <SelectItem value="mid">Mid Level</SelectItem>
              <SelectItem value="senior">Senior</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.availability} onValueChange={(value) => updateFilters("availability", value)}>
            <SelectTrigger className="w-[150px]" data-testid="select-availability">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Immediate</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters */}
        {isAdvancedOpen && (
          <div className="space-y-6 pt-4 border-t">
            {/* Budget Range */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Budget Range (₦)</label>
              <div className="px-3">
                <Slider
                  value={filters.budget}
                  onValueChange={(value) => updateFilters("budget", value)}
                  max={100}
                  step={5}
                  className="w-full"
                  data-testid="slider-budget"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>₦0</span>
                  <span>₦{filters.budget[0]}M - ₦{filters.budget[1]}M</span>
                  <span>₦100M+</span>
                </div>
              </div>
            </div>

            {/* Skills/Categories */}
            <div className="space-y-3">
              <label className="text-sm font-medium">
                {type === "jobs" ? "Required Skills" : type === "people" ? "Specialties" : "Categories"}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {skillOptions[type].map((skill) => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox
                      id={skill}
                      checked={filters.skills.includes(skill)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilters("skills", [...filters.skills, skill]);
                        } else {
                          updateFilters("skills", filters.skills.filter(s => s !== skill));
                        }
                      }}
                      data-testid={`checkbox-${skill.toLowerCase().replace(/\s+/g, '-')}`}
                    />
                    <label htmlFor={skill} className="text-sm cursor-pointer">
                      {skill}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Filters:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs h-auto p-1"
                data-testid="button-clear-all"
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {activeFilters.map((filterKey) => {
                let displayValue = "";
                if (filterKey === "budget") {
                  displayValue = `₦${filters.budget[0]}M-${filters.budget[1]}M`;
                } else if (filterKey === "skills") {
                  displayValue = `${filters.skills.length} skill${filters.skills.length !== 1 ? 's' : ''}`;
                } else {
                  displayValue = filters[filterKey as keyof FilterState] as string;
                }

                return (
                  <Badge
                    key={filterKey}
                    variant="secondary"
                    className="text-xs"
                    data-testid={`badge-filter-${filterKey}`}
                  >
                    {filterKey}: {displayValue}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer"
                      onClick={() => clearFilter(filterKey as keyof FilterState)}
                    />
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}