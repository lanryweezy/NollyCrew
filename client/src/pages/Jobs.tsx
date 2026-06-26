import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { jobs } from "@/lib/api";
import { isSupabaseConfigured } from "@/lib/supabase";
import Navigation from "@/components/Navigation";
import SearchFilters from "@/components/SearchFilters";
import JobCard from "@/components/JobCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  MapPin,
  Clock,
  Users,
  Briefcase,
  Film,
  Camera,
  Plus,
  Loader2
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import type { Job } from "@/types/database";

// Demo data for when Supabase is not configured
const DEMO_JOBS: Job[] = [
  {
    id: "demo-1",
    title: "Lead Actor - Romantic Drama",
    type: "casting",
    category: "lead-actor",
    description: "We are seeking a talented lead actor for our upcoming romantic drama series.",
    location: "Lagos, Nigeria",
    budget: 3500000,
    currency: "NGN",
    duration: "6 weeks",
    deadline: "2026-12-30",
    is_urgent: true,
    is_active: true,
    posted_by_id: "demo-user",
    project_id: null,
    payment_type: "project",
    requirements: ["5+ years experience", "Age 25-35", "Lagos based"],
    skills: ["Acting", "Drama"],
    experience: "senior",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-2",
    title: "Cinematographer - Action Film",
    type: "crew",
    category: "cinematographer",
    description: "Looking for an experienced cinematographer for a high-budget action film.",
    location: "Abuja, Nigeria",
    budget: 2000000,
    currency: "NGN",
    duration: "8 weeks",
    deadline: "2026-01-15",
    is_urgent: false,
    is_active: true,
    posted_by_id: "demo-user",
    project_id: null,
    payment_type: "project",
    requirements: ["8+ years experience", "Action film portfolio"],
    skills: ["Cinematography", "Drone"],
    experience: "expert",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-3",
    title: "Sound Engineer - Documentary",
    type: "crew",
    category: "sound-engineer",
    description: "Experienced sound engineer needed for documentary production.",
    location: "Port Harcourt, Nigeria",
    budget: 800000,
    currency: "NGN",
    duration: "3 weeks",
    deadline: "2026-01-10",
    is_urgent: false,
    is_active: true,
    posted_by_id: "demo-user",
    project_id: null,
    payment_type: "project",
    requirements: ["5+ years experience", "Documentary experience"],
    skills: ["Sound Engineering", "Field Recording"],
    experience: "mid",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export default function Jobs() {
  const [, setLocation] = useLocation();
  const { profile, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [activeTab, setActiveTab] = useState("browse");
  const [loadingList, setLoadingList] = useState(true);
  const [jobList, setJobList] = useState<Job[]>([]);

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    setLoadingList(true);
    if (isSupabaseConfigured()) {
      const data = await jobs.list({
        type: selectedType !== 'all' ? selectedType : undefined,
        location: selectedLocation !== 'all' ? selectedLocation : undefined,
      });
      setJobList(data);
    } else {
      // Demo mode
      setJobList(DEMO_JOBS);
    }
    setLoadingList(false);
  }

  const filteredJobs = useMemo(() => {
    return jobList.filter(job => {
      const matchesSearch = !searchTerm ||
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === "all" || job.type === selectedType;
      const matchesLocation = selectedLocation === "all" || job.location.includes(selectedLocation);
      return matchesSearch && matchesType && matchesLocation;
    });
  }, [jobList, searchTerm, selectedType, selectedLocation]);

  const castingJobs = filteredJobs.filter(j => j.type === "casting");
  const crewJobs = filteredJobs.filter(j => j.type === "crew");

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={isAuthenticated} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Jobs & Casting Calls"
          description="Find your next role or hire talented professionals"
          actions={
            <Button onClick={() => setLocation("/jobs/new")}>
              <Plus className="w-4 h-4 mr-2" />
              Post a Job
            </Button>
          }
        />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="casting">Casting Calls</SelectItem>
              <SelectItem value="crew">Crew Positions</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="Lagos">Lagos</SelectItem>
              <SelectItem value="Abuja">Abuja</SelectItem>
              <SelectItem value="Port Harcourt">Port Harcourt</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Job Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              All Jobs ({filteredJobs.length})
            </TabsTrigger>
            <TabsTrigger value="casting" className="flex items-center gap-2">
              <Film className="w-4 h-4" />
              Casting ({castingJobs.length})
            </TabsTrigger>
            <TabsTrigger value="crew" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Crew ({crewJobs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="mt-6">
            {loadingList ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredJobs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No jobs found</h3>
                  <p className="text-muted-foreground mt-1">
                    {searchTerm ? "Try adjusting your search" : "Be the first to post a job!"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredJobs.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="casting" className="mt-6">
            {loadingList ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : castingJobs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Film className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No casting calls</h3>
                  <p className="text-muted-foreground mt-1">Check back later</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {castingJobs.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="crew" className="mt-6">
            {loadingList ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : crewJobs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No crew positions</h3>
                  <p className="text-muted-foreground mt-1">Check back later</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {crewJobs.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
