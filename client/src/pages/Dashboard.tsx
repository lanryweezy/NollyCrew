import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth, authService } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import ThemeToggle from "@/components/ThemeToggle";
import DashboardStats, { getStatsForRole } from "@/components/DashboardStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Film, 
  Users, 
  Briefcase, 
  Calendar,
  TrendingUp,
  Clock,
  MapPin,
  ArrowRight,
  Plus,
  Bell,
  MessageSquare,
  AlertTriangle
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ResponsiveGrid from "@/components/ResponsiveGrid";
import ResponsiveSection from "@/components/ResponsiveSection";
import ResponsiveButton from "@/components/ResponsiveButton";
import ResponsiveTypography from "@/components/ResponsiveTypography";

const fetchDashboardData = async () => {
  const token = authService.getToken();
  if (!token) {
    throw new Error("No auth token found");
  }
  const response = await fetch("/api/dashboard", {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch dashboard data' }));
    throw new Error(error.error);
  }
  return response.json();
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, roles } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: dashboardData, isLoading, isError, error } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: fetchDashboardData,
  });

  const getPrimaryRole = () => {
    if (roles.length === 0) return "actor";
    return roles[0].role as "actor" | "crew" | "producer";
  };

  const primaryRole = getPrimaryRole();
  const roleStats = getStatsForRole(primaryRole);

  const getRoleBasedContent = () => {
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
            { label: "Browse Talent", icon: Users, action: () => setLocation("/talent") }
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

  const stats = getStatsForRole(primaryRole, dashboardData);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-lg">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load dashboard data. {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        <Navigation 
          isAuthenticated={true}
          userRole={primaryRole}
          userName={`${user?.firstName} ${user?.lastName}`}
        />
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
      </div>

      <ResponsiveSection padding="medium">
        <PageHeader 
          title={roleContent.title}
          subtitle={roleContent.subtitle}
        />

        {/* Stats Overview */}
        <ResponsiveGrid cols={{ xs: 2, sm: 2, md: 4 }} className="mb-6 sm:mb-8">
          <DashboardStats userRole={primaryRole} stats={roleStats} />
        </ResponsiveGrid>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveGrid cols={{ xs: 1, sm: 3 }}>
                  {roleContent.quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto p-3 sm:p-4 flex flex-col items-center gap-2"
                      onClick={action.action}
                    >
                      <action.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="text-xs sm:text-sm text-center">{action.label}</span>
                    </Button>
                  ))}
                </ResponsiveGrid>
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Recent Applications</TabsTrigger>
                <TabsTrigger value="projects">My Projects</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                {recentJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <ResponsiveTypography variant="h4">
                              {job.title}
                            </ResponsiveTypography>
                            {job.isUrgent && (
                              <Badge variant="destructive" className="text-xs">Urgent</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm mb-2">{job.company}</p>
                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                              {job.deadline}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                              {job.applicants} applicants
                            </div>
                          </div>
                          <p className="text-primary font-medium text-sm sm:text-base mt-2">{job.budget}</p>
                        </div>
                        <ResponsiveButton variant="outline" size="sm" className="w-full sm:w-auto">
                          View Details
                        </ResponsiveButton>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <ResponsiveButton 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setLocation("/jobs")}
                  icon={<ArrowRight className="w-4 h-4 ml-2" />}
                  iconPosition="right"
                >
                  View All Jobs
                </ResponsiveButton>
              </TabsContent>

              <TabsContent value="projects" className="space-y-4">
                {dashboardData?.recentProjects.map((project: any) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <ResponsiveTypography variant="h4">
                              {project.title}
                            </ResponsiveTypography>
                            <Badge variant="secondary" className="text-xs">{project.genre}</Badge>
                          </div>
                          <p className="text-muted-foreground text-sm mb-2">Director: {project.director}</p>
                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                              {project.startDate} - {project.deadline}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                              {project.teamSize} team members
                            </div>
                          </div>
                          <div className="space-y-2 mb-3">
                            <div className="flex justify-between text-xs sm:text-sm">
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
                          <p className="text-primary font-medium text-sm sm:text-base">Budget: {project.budget}</p>
                        </div>
                        <ResponsiveButton variant="outline" size="sm" className="w-full sm:w-auto">
                          Manage
                        </ResponsiveButton>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <ResponsiveButton 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setLocation("/projects")}
                  icon={<ArrowRight className="w-4 h-4 ml-2" />}
                  iconPosition="right"
                >
                  View All Projects
                </ResponsiveButton>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 sm:space-y-8">
            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-3 sm:p-4 rounded-lg border ${
                      !notification.isRead ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <ResponsiveButton variant="outline" size="sm" className="w-full">
                  View All Notifications
                </ResponsiveButton>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
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
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs sm:text-sm font-semibold text-primary">{connection.avatar}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{connection.name}</p>
                      <p className="text-xs text-muted-foreground">{connection.role}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <ResponsiveButton variant="outline" size="sm" className="w-full">
                  View All Connections
                </ResponsiveButton>
              </CardContent>
            </Card>
          </div>
        </div>
      </ResponsiveSection>
    </div>
  );
}
