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

      <div className="max-w-7xl mx-auto px-4 py-8">
        <PageHeader 
          title={roleContent.title}
          subtitle={roleContent.subtitle}
        />

        <div className="mb-8">
          <DashboardStats userRole={primaryRole} stats={stats} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
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

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Recent Applications</TabsTrigger>
                <TabsTrigger value="projects">My Projects</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                {dashboardData?.recentApplications.map((app: any) => (
                  <Card key={app.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{app.jobTitle || 'Job Title'}</h3>
                            <Badge variant={app.status === 'pending' ? 'secondary' : 'default'}>
                              {app.status}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-2">{app.coverLetter}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Applied on {new Date(app.appliedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setLocation(`/jobs/${app.jobId}`)}>
                          View Job
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button variant="outline" className="w-full" onClick={() => setLocation("/jobs")}>
                  View All Applications
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </TabsContent>

              <TabsContent value="projects" className="space-y-4">
                {dashboardData?.recentProjects.map((project: any) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{project.title}</h3>
                            <Badge variant="secondary">{project.type}</Badge>
                          </div>
                          <p className="text-muted-foreground mb-2">{project.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge>{project.status}</Badge>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setLocation(`/projects/${project.id}`)}>
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

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <p className="text-sm">
                    You have <span className="font-bold text-primary">{dashboardData?.unreadMessagesCount}</span> unread messages.
                  </p>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => setLocation('/messages')}>
                  View Messages
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Recent Connections
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Coming soon.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        <Skeleton className="h-16" />
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-12 w-1/2 mb-4" />
        <Skeleton className="h-8 w-1/3 mb-8" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-40" />
            <Skeleton className="h-80" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-60" />
            <Skeleton className="h-60" />
          </div>
        </div>
      </div>
    </div>
  );
}
