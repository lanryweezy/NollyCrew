import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import ThemeToggle from "@/components/ThemeToggle";
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
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Zap,
  Target,
  Award,
  DollarSign,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ResponsiveGrid from "@/components/ResponsiveGrid";
import ResponsiveSection from "@/components/ResponsiveSection";
import ResponsiveButton from "@/components/ResponsiveButton";
import ResponsiveTypography from "@/components/ResponsiveTypography";
import { isDemoMode, getDemoUser, getDemoJobs, getDemoProjects, getDemoProfiles, getDemoAnalytics } from "@/lib/demoService";

// Mock API functions for demo mode
const fetchUserStats = async () => {
  if (isDemoMode()) {
    return getDemoAnalytics();
  }
  // In a real implementation, this would fetch from the API
  return {
    totalProjects: 12,
    activeProjects: 3,
    completedProjects: 9,
    totalEarnings: '₦12.5M',
    monthlyEarnings: '₦1.2M',
    projectCompletionRate: 75,
    clientSatisfaction: 4.8,
    recentActivity: [
      { id: 1, action: 'Applied to Lead Actor role', time: '2 hours ago' },
      { id: 2, action: 'Project "Love in Lagos" updated', time: '1 day ago' },
      { id: 3, action: 'New message from Kemi Adetiba', time: '2 days ago' },
      { id: 4, action: 'Payment received for "The Set Up 2"', time: '3 days ago' },
    ]
  };
};

const fetchRecentJobs = async () => {
  if (isDemoMode()) {
    return getDemoJobs();
  }
  // In a real implementation, this would fetch from the API
  return [
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
};

const fetchRecentProjects = async () => {
  if (isDemoMode()) {
    return getDemoProjects();
  }
  // In a real implementation, this would fetch from the API
  return [
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
};

const fetchNotifications = async () => {
  if (isDemoMode()) {
    return [
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
  }
  // In a real implementation, this would fetch from the API
  return [
    {
      id: "1",
      type: "job_application",
      title: "New application received",
      message: "John Doe applied for Lead Actor position",
      time: "2 hours ago",
      isRead: false
    }
  ];
};

export default function EnhancedDashboard() {
  const [, setLocation] = useLocation();
  const { user, roles } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch data with React Query
  const { data: stats } = useQuery({
    queryKey: ['userStats'],
    queryFn: fetchUserStats
  });

  const { data: recentJobs } = useQuery({
    queryKey: ['recentJobs'],
    queryFn: fetchRecentJobs
  });

  const { data: recentProjects } = useQuery({
    queryKey: ['recentProjects'],
    queryFn: fetchRecentProjects
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications
  });

  const getPrimaryRole = () => {
    if (roles.length === 0) return "actor";
    return roles[0].role;
  };

  const primaryRole = getPrimaryRole();

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
            { label: "View Applications", icon: Briefcase, action: () => setLocation("/jobs") },
            { label: "AI Script Analysis", icon: Zap, action: () => setLocation("/ai-tools") }
          ]
        };
      case "crew":
        return {
          title: "Crew Dashboard", 
          subtitle: "Find crew opportunities and manage projects",
          quickActions: [
            { label: "Browse Crew Jobs", icon: Briefcase, action: () => setLocation("/jobs?type=crew") },
            { label: "Create Project", icon: Plus, action: () => setLocation("/projects") },
            { label: "Manage Portfolio", icon: Film, action: () => setLocation("/profile") },
            { label: "Schedule Optimization", icon: Calendar, action: () => setLocation("/ai-tools") }
          ]
        };
      case "producer":
        return {
          title: "Producer Dashboard",
          subtitle: "Manage productions and discover talent",
          quickActions: [
            { label: "Post Casting Call", icon: Plus, action: () => setLocation("/jobs") },
            { label: "Manage Projects", icon: Film, action: () => setLocation("/projects") },
            { label: "Browse Talent", icon: Users, action: () => setLocation("/talent") },
            { label: "Marketing Tools", icon: Target, action: () => setLocation("/ai-tools") }
          ]
        };
      default:
        return {
          title: "Dashboard",
          subtitle: "Welcome to NollyCrew",
          quickActions: [
            { label: "Complete Profile", icon: Plus, action: () => setLocation("/profile") },
            { label: "Browse Jobs", icon: Briefcase, action: () => setLocation("/jobs") },
            { label: "Explore Projects", icon: Film, action: () => setLocation("/projects") },
            { label: "AI Tools", icon: Zap, action: () => setLocation("/ai-tools") }
          ]
        };
    }
  };

  const roleContent = getRoleBasedContent();

  // Stats cards data
  const statsCards = [
    {
      title: "Total Projects",
      value: stats?.totalProjects || 0,
      change: "+12% from last month",
      icon: Film,
      color: "blue",
      trend: "up"
    },
    {
      title: "Active Projects",
      value: stats?.activeProjects || 0,
      change: "+3 from last month",
      icon: Briefcase,
      color: "green",
      trend: "up"
    },
    {
      title: "Total Earnings",
      value: stats?.totalEarnings || "₦0",
      change: "+18% from last month",
      icon: DollarSign,
      color: "yellow",
      trend: "up"
    },
    {
      title: "Completion Rate",
      value: `${stats?.projectCompletionRate || 0}%`,
      change: "+5% from last month",
      icon: CheckCircle,
      color: "purple",
      trend: "up"
    }
  ];

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

      <ResponsiveSection padding="medium">
        <PageHeader 
          title={roleContent.title}
          subtitle={roleContent.subtitle}
        />

        {/* Stats Overview */}
        <ResponsiveGrid cols={{ xs: 2, sm: 2, md: 4 }} className="mb-6 sm:mb-8">
          {statsCards.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900/50`}>
                  <stat.icon className={`w-4 h-4 text-${stat.color}-500`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-1 mt-1">
                  {stat.trend === "up" ? 
                    <TrendingUp className="w-4 h-4 text-green-500" /> : 
                    <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
                  }
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </ResponsiveGrid>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveGrid cols={{ xs: 2, sm: 4 }}>
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

            {/* Tabs for Jobs/Projects */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Recent Jobs</TabsTrigger>
                <TabsTrigger value="projects">My Projects</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                {recentJobs?.map((job: any) => (
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
                {recentProjects?.map((project: any) => (
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

              <TabsContent value="analytics" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Project Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      Project analytics visualization would appear here
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5" />
                      Earnings Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      Earnings breakdown visualization would appear here
                    </div>
                  </CardContent>
                </Card>
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
                {notifications?.map((notification: any) => (
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

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-4 h-4 sm:w-5 sm:h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats?.recentActivity?.map((activity: any, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Connections */}
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