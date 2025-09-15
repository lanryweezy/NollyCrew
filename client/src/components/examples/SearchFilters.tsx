import { useState } from 'react';
import SearchFilters, { FilterState } from '../SearchFilters';

export default function SearchFiltersExample() {
  const [jobFilters, setJobFilters] = useState<FilterState>({
    search: "",
    location: "",
    role: "",
    experience: "",
    budget: [0, 100],
    skills: [],
    availability: ""
  });

  const [peopleFilters, setPeopleFilters] = useState<FilterState>({
    search: "",
    location: "",
    role: "",
    experience: "",
    budget: [0, 100],
    skills: [],
    availability: ""
  });

  return (
    <div className="space-y-8 p-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Job Search Filters</h3>
        <SearchFilters 
          type="jobs" 
          onFiltersChange={setJobFilters}
          showAdvanced={false}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">People Search Filters (Advanced)</h3>
        <SearchFilters 
          type="people" 
          onFiltersChange={setPeopleFilters}
          showAdvanced={true}
        />
      </div>
    </div>
  );
}