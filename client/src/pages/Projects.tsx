import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import ThemeToggle from "@/components/ThemeToggle";
import ProjectCard from "@/components/ProjectCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Search,
  Plus,
  Film,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  TrendingUp,
  Settings,
  Eye,
  Edit,
  Trash2
} from "lucide-react";

export default function Projects() {
  const [, setLocation] = useLocation();
  const { user, roles } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("my-projects");

  // Mock project data
  const mockProjects = [
    {
      id: "1",
      title: "Love in Lagos",
      genre: "Romantic Drama",
      status: "production" as const,
      progress: 65,
      budget: "₦50M",
      director: "Kemi Adetiba",
      startDate: "Nov 2024",
      deadline: "Mar 2025",
      teamSize: 45,
      description: "A heartwarming story about finding love in the bustling city of Lagos.",
      isOwner: true,
      location: "Lagos, Nigeria",
      type: "feature"
    },
    {
      id: "2",
      title: "The Set Up 3",
      genre: "Action Thriller",
      status: "pre-production" as const,
      progress: 25,
      budget: "₦80M",
      director: "Niyi Akinmolayan",
      startDate: "Feb 2025",
      deadline: "Jun 2025",
      teamSize: 60,
      description: "The third installment of the popular action thriller series.",
      isOwner: true,
      location: "Abuja, Nigeria",
      type: "feature"
    },
    {
      id: "3",
      title: "Nigerian Dreams",
      genre: "Documentary",
      status: "post-production" as const,
      progress: 85,
      budget: "₦15M",
      director: "Tunde Kelani",
      startDate: "Aug 2024",
      deadline: "Dec 2024",
      teamSize: 25,
      description: "A documentary exploring the dreams and aspirations of young Nigerians.",
      isOwner: false,
      location: "Lagos, Nigeria",
      type: "documentary"
    }
  ];

  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.director.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || project.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getPrimaryRole = () => {
    if (roles.length === 0) return "actor";
    return roles[0].role;
  };

  const canCreateProjects = () => {
    const primaryRole = getPrimaryRole();
    return primaryRole === "producer" || primaryRole === "director";
  };

  const handleCreateProject = () => {
    toast({
      title: "Create Project",
      description: "Project creation form would open here.",
    });
  };

  const handleEditProject = (projectId: string) => {
    toast({
      title: "Edit Project",
      description: `Editing project ${projectId}`,
    });
  };

  const handleDeleteProject = (projectId: string) => {
    toast({
      title: "Delete Project",
      description: `Project ${projectId} would be deleted.`,
      variant: "destructive"
    });
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
            <h1 className="text-3xl font-bold mb-2">Projects</h1>
            <p className="text-muted-foreground">
              Manage your film projects and track production progress
            </p>
          </div>
          {canCreateProjects() && (
            <Button onClick={handleCreateProject} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Project
            </Button>
          )}
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
                    placeholder="Search projects, directors, or genres..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-4">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pre-production">Pre-Production</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="post-production">Post-Production</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-projects">My Projects</TabsTrigger>
            <TabsTrigger value="collaborations">Collaborations</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
          </TabsList>

          <TabsContent value="my-projects" className="space-y-6">
            {/* Results Summary */}
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                {filteredProjects.filter(p => p.isOwner).length} project{filteredProjects.filter(p => p.isOwner).length !== 1 ? 's' : ''} found
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
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="budget">Budget</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Project Listings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredProjects.filter(p => p.isOwner).map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{project.title}</CardTitle>
                          <Badge variant="secondary">{project.genre}</Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">{project.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Film className="w-4 h-4" />
                            {project.director}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {project.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {project.teamSize}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditProject(project.id)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteProject(project.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>

                      {/* Project Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span>{project.budget}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{project.startDate} - {project.deadline}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Settings className="w-4 h-4 mr-2" />
                          Manage
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProjects.filter(p => p.isOwner).length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Film className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No projects found</h3>
                  <p className="text-muted-foreground mb-4">
                    {canCreateProjects() 
                      ? "Create your first project to get started with production management."
                      : "You don't have any projects yet."
                    }
                  </p>
                  {canCreateProjects() && (
                    <Button onClick={handleCreateProject}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Project
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="collaborations" className="space-y-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Collaborations</h3>
                <p className="text-muted-foreground mb-4">
                  Projects you're collaborating on will appear here.
                </p>
                <Button variant="outline" onClick={() => setActiveTab("discover")}>
                  Discover Projects
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discover" className="space-y-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Discover Projects</h3>
                <p className="text-muted-foreground mb-4">
                  Find exciting projects to collaborate on.
                </p>
                <Button variant="outline" onClick={() => setLocation("/jobs")}>
                  Browse Opportunities
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
