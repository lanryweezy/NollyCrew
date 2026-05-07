import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
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
  AlertTriangle,
  Play,
  Star,
  Zap,
  Activity
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

  const getRoleBasedContent = () => {
    switch (primaryRole) {
      case "actor":
        return {
          title: "Artist Portal",
          subtitle: "Orchestrating your next major performance.",
          accent: "from-blue-500 to-cyan-400",
          quickActions: [
            { label: "Find Castings", icon: Film, desc: "Browse latest calls", action: () => setLocation("/jobs?type=casting") },
            { label: "Edit Showreel", icon: Play, desc: "Update your portfolio", action: () => setLocation("/profile") },
            { label: "My Auditions", icon: Star, desc: "Track applications", action: () => setLocation("/jobs") }
          ]
        };
      case "crew":
        return {
          title: "Technical Hub", 
          subtitle: "Managing technical excellence across productions.",
          accent: "from-orange-500 to-yellow-400",
          quickActions: [
            { label: "Gig Board", icon: Briefcase, desc: "Find crew openings", action: () => setLocation("/jobs?type=crew") },
            { label: "Create Project", icon: Plus, desc: "Start new production", action: () => setLocation("/projects") },
            { label: "Inventory", icon: Zap, desc: "Manage gear & skills", action: () => setLocation("/profile") }
          ]
        };
      case "producer":
        return {
          title: "Producer HQ",
          subtitle: "Commanding the production pipeline.",
          accent: "from-primary to-nollywood-crimson",
          quickActions: [
            { label: "Post Call", icon: Plus, desc: "Hire new talent", action: () => setLocation("/jobs") },
            { label: "Pipeline", icon: Activity, desc: "Track all projects", action: () => setLocation("/projects") },
            { label: "Discover", icon: Users, desc: "Search for talent", action: () => setLocation("/talent") }
          ]
        };
      default:
        return {
          title: "Dashboard",
          subtitle: "Your Nollywood Command Center.",
          accent: "from-primary to-orange-500",
          quickActions: [
            { label: "Profile", icon: Plus, desc: "Complete your setup", action: () => setLocation("/profile") },
            { label: "Jobs", icon: Briefcase, desc: "Browse opportunities", action: () => setLocation("/jobs") },
            { label: "Projects", icon: Film, desc: "Explore the industry", action: () => setLocation("/projects") }
          ]
        };
    }
  };

  const roleContent = getRoleBasedContent();
  const roleStats = getStatsForRole(primaryRole, dashboardData);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background film-grain">
        <div className="relative z-50">
          <Navigation
            isAuthenticated={true}
            userRole={primaryRole}
            userName={`${user?.firstName} ${user?.lastName}`}
          />
        </div>
        <ResponsiveSection padding="medium">
          <div className="space-y-12">
            <div className="space-y-4">
               <Skeleton className="h-14 w-1/3 bg-muted rounded-2xl" />
               <Skeleton className="h-6 w-1/4 bg-muted rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 w-full bg-muted rounded-[32px]" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                 <Skeleton className="h-[400px] w-full bg-muted rounded-[32px]" />
                 <Skeleton className="h-[300px] w-full bg-muted rounded-[32px]" />
              </div>
              <div className="lg:col-span-4 space-y-8">
                 <Skeleton className="h-[500px] w-full bg-muted rounded-[32px]" />
              </div>
            </div>
          </div>
        </ResponsiveSection>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background text-foreground film-grain overflow-x-hidden"
    >
      {/* Ambient Lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-primary/10 blur-[150px] rounded-full`} />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-50">
        <Navigation 
          isAuthenticated={true}
          userRole={primaryRole}
          userName={`${user?.firstName} ${user?.lastName}`}
        />
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
      </div>

      <ResponsiveSection padding="medium" className="relative z-10 pt-10">
        {/* Cinematic Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
               <Badge className={`bg-gradient-to-r ${roleContent.accent} text-white border-none py-1 px-3 shadow-lg shadow-primary/20`}>
                 <Zap className="w-3.5 h-3.5 mr-1.5 fill-current" />
                 {roleContent.title}
               </Badge>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold font-serif mb-4 tracking-tighter leading-none">
              Welcome, <span className={`bg-gradient-to-r ${roleContent.accent} bg-clip-text text-transparent italic`}>{user?.firstName}</span>
            </h1>
            <p className="text-white/40 text-xl font-light max-w-xl">
              {roleContent.subtitle}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="glass-card px-6 py-4 rounded-3xl border-white/5 flex items-center gap-4">
                <div className="text-right">
                   <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Session Status</p>
                   <p className="text-sm font-bold text-green-500 flex items-center gap-1.5 justify-end">
                     <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                     Live Connection
                   </p>
                </div>
             </div>
          </div>
        </motion.div>

        {/* Stats Command Center */}
        <div className="mb-12">
          <DashboardStats userRole={primaryRole} stats={roleStats} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Workspace */}
          <div className="lg:col-span-8 space-y-10">
            {/* Bento Quick Actions */}
            <section>
              <div className="flex items-center justify-between mb-6 px-2">
                 <h2 className="text-xl font-bold tracking-tight text-white/80">Command Hub</h2>
                 <p className="text-xs text-white/30 font-medium">Quick Orchestration</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {roleContent.quickActions.map((action, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={action.action}
                    className="glass-deep p-8 rounded-[40px] border-white/5 cursor-pointer group relative overflow-hidden transition-all duration-500 hover:bg-white/5 shadow-2xl"
                  >
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${roleContent.accent} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity`} />
                    <div className="mb-6 w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                      <action.icon className="w-7 h-7 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{action.label}</h3>
                    <p className="text-xs text-white/30 group-hover:text-white/50 transition-colors">{action.desc}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Feed/Tabs Upgrade */}
            <div className="glass-deep rounded-[48px] p-2 border-white/5 shadow-2xl overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="p-6">
                  <TabsList className="inline-flex h-14 items-center justify-center rounded-3xl bg-white/5 p-1 text-white/40">
                    <TabsTrigger value="overview" className="h-12 rounded-[22px] px-8 text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">Intelligence Feed</TabsTrigger>
                    <TabsTrigger value="projects" className="h-12 rounded-[22px] px-8 text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">Production Log</TabsTrigger>
                  </TabsList>
                </div>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="p-8 pt-0"
                  >
                    <TabsContent value="overview" className="space-y-4 mt-0">
                      {(dashboardData?.recentApplications || []).length > 0 ? (
                        (dashboardData?.recentApplications || []).map((job: any) => (
                          <div key={job.id} className="group glass-card p-6 rounded-[32px] border-white/5 hover:bg-white/5 transition-all flex items-center justify-between">
                            <div className="flex items-center gap-6">
                               <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                                  <Film className="w-8 h-8 text-primary/40 group-hover:text-primary transition-colors" />
                               </div>
                               <div>
                                  <div className="flex items-center gap-3 mb-1">
                                     <h4 className="text-xl font-bold text-white tracking-tight">{job.jobTitle}</h4>
                                     {job.isUrgent && <Badge variant="destructive" className="h-5 px-2 text-[10px] uppercase font-black tracking-widest">Urgent</Badge>}
                                  </div>
                                  <div className="flex items-center gap-4 text-xs font-medium text-white/30 uppercase tracking-widest">
                                     <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Applied {new Date(job.appliedAt).toLocaleDateString()}</span>
                                     <span className="flex items-center gap-1.5 text-primary"><Activity className="w-3.5 h-3.5" /> {job.status}</span>
                                  </div>
                               </div>
                            </div>
                            <Button variant="ghost" className="rounded-full bg-white/5 hover:bg-white/10 text-white/60 h-12 px-6">View Details</Button>
                          </div>
                        ))
                      ) : (
                        <div className="py-20 text-center">
                           <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                              <Bell className="w-10 h-10 text-white/10" />
                           </div>
                           <h4 className="text-2xl font-bold text-white/80 mb-2">Feed is quiet</h4>
                           <p className="text-white/30 font-light max-w-xs mx-auto">No recent applications found. Start browsing new opportunities in the portal.</p>
                        </div>
                      )}
                      
                      <div className="pt-6">
                        <Button
                          variant="ghost"
                          className="w-full h-16 rounded-[28px] border-2 border-dashed border-white/10 text-white/40 hover:text-white hover:border-primary/50 transition-all font-bold text-lg"
                          onClick={() => setLocation("/jobs")}
                        >
                          View Full Career Log
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="projects" className="space-y-6 mt-0">
                      {(dashboardData?.recentProjects || []).map((project: any) => (
                        <div key={project.id} className="glass-card p-8 rounded-[40px] border-white/5 hover:bg-white/5 transition-all">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                            <div className="flex items-center gap-6">
                               <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                                  <Briefcase className="w-10 h-10 text-primary" />
                               </div>
                               <div>
                                  <div className="flex items-center gap-3 mb-1">
                                    <h4 className="text-2xl font-black text-white tracking-tight">{project.title}</h4>
                                    <Badge variant="secondary" className="bg-white/10 text-white border-none">{project.genre}</Badge>
                                  </div>
                                  <p className="text-white/40 font-medium">Under the direction of <span className="text-white/70 italic">{project.director}</span></p>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-3xl font-black text-primary leading-none mb-1">{project.budget}</p>
                               <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Production Budget</p>
                            </div>
                          </div>

                          <div className="space-y-3 mb-8">
                             <div className="flex justify-between items-end mb-2">
                                <span className="text-xs uppercase tracking-widest text-white/30 font-bold">Production Progress</span>
                                <span className="text-sm font-black text-primary">{project.progress}%</span>
                             </div>
                             <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${project.progress}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  className={`h-full bg-gradient-to-r ${roleContent.accent} rounded-full`}
                                />
                             </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-white/5">
                             <div className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-white/20" />
                                <span className="text-xs text-white/60 font-medium">{project.startDate} - {project.deadline}</span>
                             </div>
                             <div className="flex items-center gap-3">
                                <Users className="w-4 h-4 text-white/20" />
                                <span className="text-xs text-white/60 font-medium">{project.teamSize} specialized crew</span>
                             </div>
                             <div className="flex justify-end">
                                <Button className="rounded-full bg-white text-black hover:bg-white/90 font-bold px-8">Manage Desk</Button>
                             </div>
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                  </motion.div>
                </AnimatePresence>
              </Tabs>
            </div>
          </div>

          {/* Sidebar - Intelligent Activity Timeline */}
          <div className="lg:col-span-4 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-6 px-2">
                 <h2 className="text-xl font-bold tracking-tight text-white/80">Intelligence Stream</h2>
                 <Bell className="w-4 h-4 text-white/20" />
              </div>
              
              <div className="glass-deep rounded-[48px] p-8 border-white/5 relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                 
                 <div className="relative space-y-8">
                    {(dashboardData?.notifications || []).length > 0 ? (
                      (dashboardData?.notifications || []).map((notification: any, i: number) => (
                        <div key={notification.id} className="relative pl-10 group">
                           {/* Timeline line */}
                           {i !== (dashboardData?.notifications || []).length - 1 && (
                             <div className="absolute left-[11px] top-8 bottom-[-32px] w-[2px] bg-white/5 group-hover:bg-primary/20 transition-colors" />
                           )}
                           
                           {/* Node */}
                           <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-black z-10 transition-transform group-hover:scale-110 ${
                             !notification.isRead ? 'bg-primary shadow-[0_0_12px_rgba(var(--primary),0.5)]' : 'bg-white/10'
                           }`} />
                           
                           <div>
                              <h4 className="font-bold text-sm text-white/90 mb-1 group-hover:text-primary transition-colors">{notification.title}</h4>
                              <p className="text-xs text-white/40 leading-relaxed font-light mb-2">{notification.message}</p>
                              <div className="flex items-center gap-2">
                                 <div className="px-2 py-0.5 rounded-full bg-white/5 text-[9px] font-black uppercase tracking-tighter text-white/30">{notification.time}</div>
                              </div>
                           </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center">
                         <p className="text-white/20 text-sm italic">Synchronizing latest events...</p>
                      </div>
                    )}
                 </div>

                 <Button variant="ghost" className="w-full mt-10 rounded-2xl text-white/30 hover:text-white hover:bg-white/5 py-6">
                    Analyze Full Stream
                    <ArrowRight className="w-4 h-4 ml-2" />
                 </Button>
              </div>
            </section>

            {/* Network Insight Card */}
            <section>
               <div className="flex items-center justify-between mb-6 px-2">
                 <h2 className="text-xl font-bold tracking-tight text-white/80">Network Insights</h2>
                 <Users className="w-4 h-4 text-white/20" />
               </div>
               
               <div className="glass-deep rounded-[48px] p-8 border-white/5 shadow-2xl">
                  <div className="space-y-6">
                    {[
                      { name: "Funke Akindele", role: "Actor", avatar: "FA", match: "98% Match" },
                      { name: "Kemi Adetiba", role: "Director", avatar: "KA", match: "High Priority" },
                      { name: "Jade Osiberu", role: "Producer", avatar: "JO", match: "New Connection" }
                    ].map((connection, index) => (
                      <div key={index} className="flex items-center gap-4 group cursor-pointer">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center border border-white/5 group-hover:border-primary/50 transition-colors">
                          <span className="text-lg font-black text-white/80">{connection.avatar}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-base text-white group-hover:text-primary transition-colors leading-none mb-1">{connection.name}</p>
                          <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">{connection.role}</p>
                        </div>
                        <div className="text-right">
                           <div className="px-2 py-1 rounded-lg bg-primary/10 text-[9px] font-black text-primary uppercase tracking-tighter">{connection.match}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button className="w-full mt-10 rounded-3xl h-14 bg-white text-black hover:bg-white/90 font-bold shadow-xl">
                    Expand Industry Network
                  </Button>
               </div>
            </section>
          </div>
        </div>
      </ResponsiveSection>
    </motion.div>
  );
}

