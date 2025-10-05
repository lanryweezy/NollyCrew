import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import Navigation from "@/components/Navigation";
import ThemeToggle from "@/components/ThemeToggle";
import DashboardStats, { getStatsForRole } from "@/components/DashboardStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Film, 
  Users, 
  Briefcase, 
  Calendar,
  TrendingUp,
  Star,
  Clock,
  MapPin,
  ArrowRight,
  Plus,
  Bell,
  MessageSquare
} from "lucide-react";
import PageHeader from "@/components/PageHeader";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, roles } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for dashboard
  const mockStats = {
    totalJobs: 24,
    applications: 8,
    projects: 3,
    connections: 156
  };

  const recentJobs = [
    {
      id: "1",
      title: "Lead Actor - Romantic Drama",
      company: "Trino Studios",
      location: "Lagos, Nigeria",
      budget: "₦2M - ₦5M",
      deadline: "Dec 30, 2024",
      applicants: 45,
      isUrgent: true,
      type: "casting"
    },
    {
      id: "2", 
      title: "Cinematographer - Action Film",
      company: "FilmOne Productions",
      location: "Abuja, Nigeria",
      budget: "₦1.5M - ₦3M",
      deadline: "Jan 15, 2025",
      applicants: 23,
      isUrgent: false,
      type: "crew"
    }
  ];

  const recentProjects = [
    {
      id: "1",
      title: "Love in Lagos",
      genre: "Romantic Drama",
      status: "production",
      progress: 65,
      budget: "₦50M",
      director: "Kemi Adetiba",
      startDate: "Nov 2024",
      deadline: "Mar 2025",
      teamSize: 45
    },
    {
      id: "2",
      title: "The Set Up 3",
      genre: "Action Thriller", 
      status: "pre-production",
      progress: 25,
      budget: "₦80M",
      director: "Niyi Akinmolayan",
      startDate: "Feb 2025",
      deadline: "Jun 2025",
      teamSize: 60
    }
  ];

  const notifications = [
    {
      id: "1",
      type: "job_application",
      title: "New application received",
      message: "John Doe applied for Lead Actor position",
      time: "2 hours ago",
      isRead: false
    },
    {
      id: "2",
      type: "project_update",
      title: "Project milestone completed",
      message: "Love in Lagos - Production phase 65% complete",
      time: "1 day ago",
      isRead: true
    },
    {
      id: "3",
      type: "connection",
      title: "New connection request",
      message: "Funke Akindele wants to connect",
      time: "2 days ago",
      isRead: false
    }
  ];

  const getPrimaryRole = () => {
    if (roles.length === 0) return "actor";
    return roles[0].role;
  };

  const primaryRole = getPrimaryRole();
  const roleStats = getStatsForRole(primaryRole);

  const getRoleBasedContent = () => {
    const primaryRole = getPrimaryRole();
    
    switch (primaryRole) {
      case "actor":
        return {
          title: "Actor Dashboard",
          subtitle: "Discover roles and showcase your talent",
          quickActions: [
            { label: "Browse Casting Calls", icon: Film, action: () => setLocation("/jobs?type=casting") },
            { label: "Update Showreel", icon: Plus, action: () => setLocation("/profile") },
            { label: "View Applications", icon: Briefcase, action: () => setLocation("/jobs") }
          ]
        };
      case "crew":
        return {
          title: "Crew Dashboard", 
          subtitle: "Find crew opportunities and manage projects",
          quickActions: [
            { label: "Browse Crew Jobs", icon: Briefcase, action: () => setLocation("/jobs?type=crew") },
            { label: "Create Project", icon: Plus, action: () => setLocation("/projects") },
            { label: "Manage Portfolio", icon: Film, action: () => setLocation("/profile") }
          ]
        };
      case "producer":
        return {
          title: "Producer Dashboard",
          subtitle: "Manage productions and discover talent",
          quickActions: [
            { label: "Post Casting Call", icon: Plus, action: () => setLocation("/jobs") },
            { label: "Manage Projects", icon: Film, action: () => setLocation("/projects") },
            { label: "Browse Talent", icon: Users, action: () => setLocation("/jobs") }
          ]
        };
      default:
        return {
          title: "Dashboard",
          subtitle: "Welcome to NollyCrew",
          quickActions: [
            { label: "Complete Profile", icon: Plus, action: () => setLocation("/profile") },
            { label: "Browse Jobs", icon: Briefcase, action: () => setLocation("/jobs") },
            { label: "Explore Projects", icon: Film, action: () => setLocation("/projects") }
          ]
        };
    }
  };

  const roleContent = getRoleBasedContent();

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
        <PageHeader 
          title={roleContent.title}
          subtitle={roleContent.subtitle}
        />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardStats userRole={primaryRole} stats={roleStats} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {roleContent.quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2"
                      onClick={action.action}
                    >
                      <action.icon className="w-6 h-6" />
                      <span className="text-sm">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tabs for Jobs/Projects */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Recent Jobs</TabsTrigger>
                <TabsTrigger value="projects">My Projects</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                {recentJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{job.title}</h3>
                            {job.isUrgent && (
                              <Badge variant="destructive" className="text-xs">Urgent</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-2">{job.company}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {job.deadline}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {job.applicants} applicants
                            </div>
                          </div>
                          <p className="text-primary font-medium mt-2">{job.budget}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button variant="outline" className="w-full" onClick={() => setLocation("/jobs")}>
                  View All Jobs
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </TabsContent>

              <TabsContent value="projects" className="space-y-4">
                {recentProjects.map((project) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{project.title}</h3>
                            <Badge variant="secondary">{project.genre}</Badge>
                          </div>
                          <p className="text-muted-foreground mb-2">Director: {project.director}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {project.startDate} - {project.deadline}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {project.teamSize} team members
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{project.progress}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                          </div>
                          <p className="text-primary font-medium mt-2">Budget: {project.budget}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button variant="outline" className="w-full" onClick={() => setLocation("/projects")}>
                  View All Projects
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-3 rounded-lg border ${
                      !notification.isRead ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  View All Notifications
                </Button>
              </CardContent>
            </Card>

            {/* Recent Connections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Recent Connections
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Funke Akindele", role: "Actor", avatar: "FA" },
                  { name: "Kemi Adetiba", role: "Director", avatar: "KA" },
                  { name: "Tunde Cinematography", role: "Crew", avatar: "TC" }
                ].map((connection, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">{connection.avatar}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{connection.name}</p>
                      <p className="text-xs text-muted-foreground">{connection.role}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  View All Connections
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
