import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import ThemeToggle from "@/components/ThemeToggle";
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
  Filter,
  MapPin,
  Clock,
  Users,
  Star,
  Bookmark,
  Plus,
  Briefcase,
  Film,
  Camera
} from "lucide-react";

export default function Jobs() {
  const [, setLocation] = useLocation();
  const { user, roles } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [activeTab, setActiveTab] = useState("browse");

  // Mock job data
  const mockJobs = [
    {
      id: "1",
      title: "Lead Actor - Romantic Drama",
      type: "casting" as const,
      company: "Trino Studios",
      location: "Lagos, Nigeria",
      budget: "₦2M - ₦5M",
      duration: "6 weeks",
      deadline: "Apply by Dec 30",
      description: "We are seeking a talented lead actor for our upcoming romantic drama series. The role requires strong emotional range and chemistry with co-stars.",
      requirements: ["5+ years experience", "Age 25-35", "Lagos based", "Previous drama experience"],
      applicants: 45,
      isUrgent: true,
      isBookmarked: false,
      postedDate: "2 days ago",
      category: "lead-actor"
    },
    {
      id: "2",
      title: "Cinematographer - Action Film",
      type: "crew" as const,
      company: "FilmOne Productions",
      location: "Abuja, Nigeria", 
      budget: "₦1.5M - ₦3M",
      duration: "8 weeks",
      deadline: "Apply by Jan 15",
      description: "Looking for an experienced cinematographer for a high-budget action film. Must have experience with action sequences and drone cinematography.",
      requirements: ["8+ years experience", "Action film portfolio", "Drone license", "Equipment ownership"],
      applicants: 23,
      isUrgent: false,
      isBookmarked: true,
      postedDate: "1 week ago",
      category: "cinematographer"
    },
    {
      id: "3",
      title: "Supporting Actor - Comedy Series",
      type: "casting" as const,
      company: "EbonyLife Studios",
      location: "Lagos, Nigeria",
      budget: "₦800K - ₦1.2M",
      duration: "4 weeks",
      deadline: "Apply by Jan 5",
      description: "Seeking a charismatic supporting actor for a comedy series. Must have excellent comedic timing and improvisation skills.",
      requirements: ["3+ years experience", "Comedy background", "Improv skills", "Lagos based"],
      applicants: 67,
      isUrgent: false,
      isBookmarked: false,
      postedDate: "3 days ago",
      category: "supporting-actor"
    },
    {
      id: "4",
      title: "Sound Engineer - Documentary",
      type: "crew" as const,
      company: "Documentary Films Ltd",
      location: "Port Harcourt, Nigeria",
      budget: "₦600K - ₦1M",
      duration: "3 weeks",
      deadline: "Apply by Jan 10",
      description: "Experienced sound engineer needed for documentary production. Must have experience with field recording and post-production.",
      requirements: ["5+ years experience", "Documentary experience", "Field recording skills", "Post-production knowledge"],
      applicants: 12,
      isUrgent: false,
      isBookmarked: false,
      postedDate: "5 days ago",
      category: "sound-engineer"
    }
  ];

  const filteredJobs = mockJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === "all" || job.type === selectedType;
    const matchesLocation = selectedLocation === "all" || job.location.includes(selectedLocation);
    
    return matchesSearch && matchesType && matchesLocation;
  });

  const handleApply = async (jobId: string) => {
    try {
      // Mock application submission
      toast({
        title: "Application submitted!",
        description: "Your application has been sent to the hiring team.",
      });
    } catch (error) {
      toast({
        title: "Application failed",
        description: "There was an error submitting your application.",
        variant: "destructive"
      });
    }
  };

  const handleBookmark = (jobId: string) => {
    toast({
      title: "Job bookmarked",
      description: "This job has been saved to your bookmarks.",
    });
  };

  const getPrimaryRole = () => {
    if (roles.length === 0) return "actor";
    return roles[0].role;
  };

  const getRoleBasedActions = () => {
    const primaryRole = getPrimaryRole();
    
    if (primaryRole === "producer") {
      return (
        <Button onClick={() => setLocation("/jobs/post")} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Post a Job
        </Button>
      );
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="relative">
        <Navigation 
          isAuthenticated={true}
          userRole={getPrimaryRole()}
          userName={`${user?.firstName} ${user?.lastName}`}
        />
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Find Opportunities</h1>
            <p className="text-muted-foreground">
              Discover casting calls, crew positions, and production opportunities
            </p>
          </div>
          {getRoleBasedActions()}
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs, companies, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-4">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="casting">Casting</SelectItem>
                    <SelectItem value="crew">Crew</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="Lagos">Lagos</SelectItem>
                    <SelectItem value="Abuja">Abuja</SelectItem>
                    <SelectItem value="Port Harcourt">Port Harcourt</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse Jobs</TabsTrigger>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
            <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Results Summary */}
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Select defaultValue="recent">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="budget">Budget</SelectItem>
                    <SelectItem value="applicants">Applicants</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Job Listings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  {...job}
                  onApply={() => handleApply(job.id)}
                  onBookmark={() => handleBookmark(job.id)}
                />
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search criteria or check back later for new opportunities.
                  </p>
                  <Button variant="outline" onClick={() => {
                    setSearchTerm("");
                    setSelectedType("all");
                    setSelectedLocation("all");
                  }}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <Film className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Your Applications</h3>
                <p className="text-muted-foreground mb-4">
                  Track the status of your job applications here.
                </p>
                <Button variant="outline" onClick={() => setActiveTab("browse")}>
                  Browse Jobs
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookmarks" className="space-y-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Bookmarked Jobs</h3>
                <p className="text-muted-foreground mb-4">
                  Your saved job opportunities will appear here.
                </p>
                <Button variant="outline" onClick={() => setActiveTab("browse")}>
                  Browse Jobs
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
