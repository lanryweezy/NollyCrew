import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { jobs, projects, messages } from "@/lib/api";
import { apiFetch } from "@/lib/api";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Film,
  Users,
  Briefcase,
  TrendingUp,
  Clock,
  MapPin,
  ArrowRight,
  Plus,
  MessageSquare,
  Star,
  Loader2,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { DashboardSkeleton } from "@/components/PageSkeletons";

// Demo data for when Supabase is not configured
const DEMO_STATS = {
  totalJobs: 12,
  totalApplications: 8,
  totalProjects: 3,
  unreadMessages: 5,
};

const DEMO_RECENT_JOBS = [
  { id: "1", title: "Lead Actor - Romantic Drama", location: "Lagos", type: "casting", created_at: new Date().toISOString() },
  { id: "2", title: "Cinematographer - Action Film", location: "Abuja", type: "crew", created_at: new Date().toISOString() },
];

const DEMO_RECENT_APPLICATIONS = [
  { id: "1", job_title: "Supporting Actor - Comedy", status: "pending", applied_at: new Date().toISOString() },
  { id: "2", job_title: "Sound Engineer", status: "shortlisted", applied_at: new Date().toISOString() },
];

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { profile, roles, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [stats, setStats] = useState(DEMO_STATS);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [recentApps, setRecentApps] = useState<any[]>([]);

  const primaryRole = roles.length > 0 ? roles[0].role : "actor";

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const [jobsData, appsData, projectsData, msgsData] = await Promise.all([
        jobs.list({ limit: 5 }),
        profile ? jobs.getMyApplications(profile.id) : Promise.resolve([]),
        projects.list({ limit: 5 }),
        apiFetch('/notifications').catch(() => []),
      ]);
      setRecentJobs(jobsData.length > 0 ? jobsData : DEMO_RECENT_JOBS);
      setRecentApps(appsData.length > 0 ? appsData : DEMO_RECENT_APPLICATIONS);
      setStats({
        totalJobs: jobsData.length || DEMO_STATS.totalJobs,
        totalApplications: appsData.length || DEMO_STATS.totalApplications,
        totalProjects: projectsData.length || DEMO_STATS.totalProjects,
        unreadMessages: Array.isArray(msgsData) ? msgsData.filter((n: any) => !n.read).length : DEMO_STATS.unreadMessages,
      });
    } catch (e) {
      setRecentJobs(DEMO_RECENT_JOBS);
      setRecentApps(DEMO_RECENT_APPLICATIONS);
      setError(true);
    }
    setLoading(false);
  }

  const getRoleLabel = () => {
    switch (primaryRole) {
      case "actor": return { title: "Artist Portal", subtitle: "Find your next role" };
      case "crew": return { title: "Crew Hub", subtitle: "Find your next gig" };
      case "producer": return { title: "Producer Dashboard", subtitle: "Manage your productions" };
      default: return { title: "Dashboard", subtitle: "Welcome back" };
    }
  };

  const roleInfo = getRoleLabel();

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={isAuthenticated} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title={`Welcome, ${profile?.first_name || "there"}!`}
          description={roleInfo.subtitle}
          actions={
            primaryRole === "producer" ? (
              <Button onClick={() => setLocation("/jobs/new")}>
                <Plus className="w-4 h-4 mr-2" />
                Post a Job
              </Button>
            ) : (
              <Button onClick={() => setLocation("/jobs")}>
                <Briefcase className="w-4 h-4 mr-2" />
                Browse Jobs
              </Button>
            )
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setLocation("/jobs")}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Jobs</p>
                  <p className="text-2xl font-bold">{stats.totalJobs}</p>
                </div>
                <Briefcase className="w-8 h-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setLocation("/jobs")}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Applications</p>
                  <p className="text-2xl font-bold">{stats.totalApplications}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setLocation("/projects")}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Projects</p>
                  <p className="text-2xl font-bold">{stats.totalProjects}</p>
                </div>
                <Film className="w-8 h-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setLocation("/messages")}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Messages</p>
                  <p className="text-2xl font-bold">{stats.unreadMessages}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Recent Jobs</TabsTrigger>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {loading ? (
              <DashboardSkeleton />
            ) : error ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Failed to load data</h3>
                  <p className="text-muted-foreground mb-4">Check your connection and try again</p>
                  <Button onClick={() => { setError(false); loadDashboardData(); }}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Retry
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Recent Jobs
                      <Button variant="ghost" size="sm" onClick={() => setLocation("/jobs")}>
                        View All <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentJobs.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No jobs yet</p>
                    ) : (
                      <div className="space-y-3">
                        {recentJobs.map((job: any) => (
                          <div key={job.id} className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setLocation("/jobs")}>
                            <div>
                              <p className="font-medium">{job.title}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {job.location}
                              </p>
                            </div>
                            <Badge variant={job.type === "casting" ? "default" : "secondary"}>
                              {job.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      My Applications
                      <Button variant="ghost" size="sm" onClick={() => setLocation("/jobs")}>
                        View All <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentApps.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No applications yet</p>
                    ) : (
                      <div className="space-y-3">
                        {recentApps.map((app: any) => (
                          <div key={app.id} className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setLocation("/jobs")}>
                            <div>
                              <p className="font-medium">{app.job_title || app.job?.title || "Job"}</p>
                              <p className="text-sm text-muted-foreground">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {new Date(app.applied_at).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant={
                              app.status === "accepted" ? "default" :
                              app.status === "shortlisted" ? "secondary" :
                              "outline"
                            }>
                              {app.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="jobs" className="mt-6">
            <Card>
              <CardContent className="py-8 text-center">
                <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Browse All Jobs</h3>
                <p className="text-muted-foreground mt-1 mb-4">Find casting calls and crew positions</p>
                <Button onClick={() => setLocation("/jobs")}>
                  Go to Jobs <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="mt-6">
            <Card>
              <CardContent className="py-8 text-center">
                <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Track Your Applications</h3>
                <p className="text-muted-foreground mt-1 mb-4">See where you've applied and their status</p>
                <Button onClick={() => setLocation("/jobs")}>
                  Browse Jobs <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
