import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { jobs } from "@/lib/api";
import Navigation from "@/components/Navigation";
import JobCard from "@/components/JobCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, X, SlidersHorizontal, ArrowUpDown,
  Briefcase, Film, Camera, Plus, Loader2, RotateCcw
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { JobsSkeleton } from "@/components/PageSkeletons";
import type { Job } from "@/types/database";

const DEMO_JOBS: Job[] = [
  { id: "demo-1", title: "Lead Actor - Romantic Drama", type: "casting", category: "lead-actor", description: "We are seeking a talented lead actor for our upcoming romantic drama series.", location: "Lagos, Nigeria", budget: 3500000, currency: "NGN", duration: "6 weeks", deadline: "2026-12-30", is_urgent: true, is_active: true, posted_by_id: "demo-user", project_id: null, payment_type: "project", requirements: ["5+ years experience", "Age 25-35", "Lagos based"], skills: ["Acting", "Drama"], experience: "senior", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "demo-2", title: "Cinematographer - Action Film", type: "crew", category: "cinematographer", description: "Looking for an experienced cinematographer for a high-budget action film.", location: "Abuja, Nigeria", budget: 2000000, currency: "NGN", duration: "8 weeks", deadline: "2026-01-15", is_urgent: false, is_active: true, posted_by_id: "demo-user", project_id: null, payment_type: "project", requirements: ["8+ years experience", "Action film portfolio"], skills: ["Cinematography", "Drone"], experience: "expert", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "demo-3", title: "Sound Engineer - Documentary", type: "crew", category: "sound-engineer", description: "Experienced sound engineer needed for documentary production.", location: "Port Harcourt, Nigeria", budget: 800000, currency: "NGN", duration: "3 weeks", deadline: "2026-01-10", is_urgent: false, is_active: true, posted_by_id: "demo-user", project_id: null, payment_type: "project", requirements: ["5+ years experience", "Documentary experience"], skills: ["Sound Engineering", "Field Recording"], experience: "mid", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "demo-4", title: "Makeup Artist - Period Drama", type: "crew", category: "makeup", description: "Seeking a skilled makeup artist for our period drama set in 1960s Lagos.", location: "Lagos, Nigeria", budget: 500000, currency: "NGN", duration: "4 weeks", deadline: "2026-02-01", is_urgent: false, is_active: true, posted_by_id: "demo-user", project_id: null, payment_type: "project", requirements: ["3+ years experience", "Period makeup skills"], skills: ["Makeup", "SFX"], experience: "mid", created_at: new Date(Date.now() - 86400000).toISOString(), updated_at: new Date().toISOString() },
  { id: "demo-5", title: "Supporting Actor - Comedy", type: "casting", category: "supporting", description: "Looking for a comedic supporting actor for our new sitcom.", location: "Lagos, Nigeria", budget: 1000000, currency: "NGN", duration: "10 weeks", deadline: "2026-01-20", is_urgent: true, is_active: true, posted_by_id: "demo-user", project_id: null, payment_type: "project", requirements: ["2+ years experience", "Comedy background"], skills: ["Acting", "Comedy"], experience: "entry", created_at: new Date(Date.now() - 172800000).toISOString(), updated_at: new Date().toISOString() },
  { id: "demo-6", title: "Director of Photography - Short Film", type: "crew", category: "cinematographer", description: "Need a DoP for a 15-minute short film exploring urban life in Abuja.", location: "Abuja, Nigeria", budget: 300000, currency: "NGN", duration: "2 weeks", deadline: "2026-01-25", is_urgent: false, is_active: true, posted_by_id: "demo-user", project_id: null, payment_type: "project", requirements: ["Portfolio required", "Own equipment"], skills: ["Cinematography", "Lighting"], experience: "mid", created_at: new Date(Date.now() - 259200000).toISOString(), updated_at: new Date().toISOString() },
];

const LOCATIONS = ["Lagos", "Abuja", "Port Harcourt", "Enugu", "Ibadan", "Remote"];
const EXPERIENCE_LEVELS = ["entry", "mid", "senior", "expert"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "budget_high", label: "Highest Budget" },
  { value: "budget_low", label: "Lowest Budget" },
];

export default function Jobs() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedExperience, setSelectedExperience] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [activeTab, setActiveTab] = useState("browse");
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState(false);
  const [jobList, setJobList] = useState<Job[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => { loadJobs(); }, [selectedType, selectedLocation]);

  async function loadJobs() {
    setLoadingList(true);
    setError(false);
    try {
      const data = await jobs.list({
        type: selectedType !== 'all' ? selectedType : undefined,
        location: selectedLocation !== 'all' ? selectedLocation : undefined,
      });
      setJobList(data.length > 0 ? data : DEMO_JOBS);
    } catch {
      setJobList(DEMO_JOBS);
      setError(true);
    }
    setLoadingList(false);
  }

  const filteredJobs = useMemo(() => {
    let result = jobList.filter(job => {
      const matchesSearch = !debouncedSearch ||
        job.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        job.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        job.skills?.some(s => s.toLowerCase().includes(debouncedSearch.toLowerCase()));
      const matchesType = selectedType === "all" || job.type === selectedType;
      const matchesLocation = selectedLocation === "all" || job.location?.includes(selectedLocation);
      const matchesExperience = selectedExperience === "all" || job.experience === selectedExperience;
      return matchesSearch && matchesType && matchesLocation && matchesExperience;
    });

    // Sort
    switch (sortBy) {
      case "oldest":
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "budget_high":
        result.sort((a, b) => (b.budget || 0) - (a.budget || 0));
        break;
      case "budget_low":
        result.sort((a, b) => (a.budget || 0) - (b.budget || 0));
        break;
      default: // newest
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [jobList, debouncedSearch, selectedType, selectedLocation, selectedExperience, sortBy]);

  const activeFilterCount = [selectedType, selectedLocation, selectedExperience].filter(f => f !== "all").length;
  const paginatedJobs = filteredJobs.slice(0, page * PAGE_SIZE);
  const hasMore = filteredJobs.length > page * PAGE_SIZE;

  const castingJobs = paginatedJobs.filter(j => j.type === "casting");
  const crewJobs = paginatedJobs.filter(j => j.type === "crew");

  function clearFilters() {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedType("all");
    setSelectedLocation("all");
    setSelectedExperience("all");
    setSortBy("newest");
    setPage(1);
  }

  function removeFilter(filter: string) {
    switch (filter) {
      case "type": setSelectedType("all"); break;
      case "location": setSelectedLocation("all"); break;
      case "experience": setSelectedExperience("all"); break;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={isAuthenticated} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Jobs & Casting Calls"
          description={`${filteredJobs.length} jobs available`}
          actions={
            <Button onClick={() => setLocation("/jobs/new")}>
              <Plus className="w-4 h-4 mr-2" /> Post a Job
            </Button>
          }
        />

        {/* Search + Filter Toggle */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by title, description, or skills... (press /)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
              onKeyDown={(e) => {
                if (e.key === "Escape") { setSearchTerm(""); }
              }}
            />
            {searchTerm && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setSearchTerm("")}>
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button variant={showFilters ? "default" : "outline"} onClick={() => setShowFilters(!showFilters)} className="relative">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-[10px]">{activeFilterCount}</Badge>
            )}
          </Button>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <Card className="mb-4">
            <CardContent className="pt-4 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Job Type</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="casting">Casting Calls</SelectItem>
                      <SelectItem value="crew">Crew Positions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger><SelectValue placeholder="All Locations" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {LOCATIONS.map(loc => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Experience Level</label>
                  <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                    <SelectTrigger><SelectValue placeholder="All Levels" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {EXPERIENCE_LEVELS.map(exp => (
                        <SelectItem key={exp} value={exp}>{exp.charAt(0).toUpperCase() + exp.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedType !== "all" && (
              <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-destructive/10" onClick={() => removeFilter("type")}>
                {selectedType === "casting" ? "Casting" : "Crew"} <X className="w-3 h-3" />
              </Badge>
            )}
            {selectedLocation !== "all" && (
              <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-destructive/10" onClick={() => removeFilter("location")}>
                {selectedLocation} <X className="w-3 h-3" />
              </Badge>
            )}
            {selectedExperience !== "all" && (
              <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-destructive/10" onClick={() => removeFilter("experience")}>
                {selectedExperience} <X className="w-3 h-3" />
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs">
              <RotateCcw className="w-3 h-3 mr-1" /> Clear all
            </Button>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> All ({filteredJobs.length})
            </TabsTrigger>
            <TabsTrigger value="casting" className="flex items-center gap-2">
              <Film className="w-4 h-4" /> Casting ({filteredJobs.filter(j => j.type === "casting").length})
            </TabsTrigger>
            <TabsTrigger value="crew" className="flex items-center gap-2">
              <Camera className="w-4 h-4" /> Crew ({filteredJobs.filter(j => j.type === "crew").length})
            </TabsTrigger>
          </TabsList>

          {["browse", "casting", "crew"].map(tab => {
            const list = tab === "browse" ? filteredJobs : tab === "casting" ? castingJobs : crewJobs;
            const icon = tab === "casting" ? Film : tab === "crew" ? Camera : Briefcase;
            const Icon = icon;
            return (
              <TabsContent key={tab} value={tab} className="mt-6">
                {loadingList ? (
                  <JobsSkeleton />
                ) : list.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Icon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold">No jobs found</h3>
                      <p className="text-muted-foreground mt-1 mb-4">
                        {debouncedSearch
                          ? `No results for "${debouncedSearch}"`
                          : activeFilterCount > 0
                          ? "No jobs match your filters"
                          : "Be the first to post a job!"}
                      </p>
                      {(debouncedSearch || activeFilterCount > 0) && (
                        <Button variant="outline" onClick={clearFilters}>
                          <RotateCcw className="w-4 h-4 mr-2" /> Clear filters
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {list.map(job => (
                        <JobCard key={job.id} job={job} />
                      ))}
                    </div>
                    {hasMore && (
                      <div className="text-center mt-6">
                        <Button variant="outline" onClick={() => setPage(p => p + 1)}>
                          Load More ({filteredJobs.length - paginatedJobs.length} remaining)
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </main>
    </div>
  );
}
