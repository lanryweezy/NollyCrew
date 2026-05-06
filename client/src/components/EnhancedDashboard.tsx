import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
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
  MessageSquare,
  Zap,
  Target,
  Play,
  Activity,
  Award
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ResponsiveGrid from "@/components/ResponsiveGrid";
import ResponsiveSection from "@/components/ResponsiveSection";
import ResponsiveButton from "@/components/ResponsiveButton";
import ResponsiveTypography from "@/components/ResponsiveTypography";
import { isDemoMode, getDemoAnalytics, getDemoJobs, getDemoProjects } from "@/lib/demoService";

// Mock API functions for demo mode
const fetchUserStats = async () => {
  if (isDemoMode()) {
    return getDemoAnalytics();
  }
  return {
    totalProjects: 12,
    activeProjects: 3,
    totalEarnings: '₦12.5M',
    projectCompletionRate: 75,
    recentActivity: [
      { id: 1, action: 'Applied to Lead Actor role', time: '2 hours ago' },
      { id: 2, action: 'Project "Love in Lagos" updated', time: '1 day ago' },
      { id: 3, action: 'New message from Kemi Adetiba', time: '2 days ago' },
    ]
  };
};

export default function EnhancedDashboard() {
  const [, setLocation] = useLocation();
  const { user, roles } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: stats } = useQuery({
    queryKey: ['userStats'],
    queryFn: fetchUserStats
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
            { label: "My Auditions", icon: Star, desc: "Track applications", action: () => setLocation("/jobs") },
            { label: "AI Script Analysis", icon: Zap, desc: "Breakdown scripts", action: () => setLocation("/ai-tools") }
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
            { label: "Inventory", icon: Award, desc: "Manage gear & skills", action: () => setLocation("/profile") },
            { label: "Schedule Optimization", icon: Calendar, desc: "AI planning", action: () => setLocation("/ai-tools") }
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
            { label: "Discover", icon: Users, desc: "Search for talent", action: () => setLocation("/talent") },
            { label: "Marketing Tools", icon: Target, desc: "AI content", action: () => setLocation("/ai-tools") }
          ]
        };
      default:
        return {
          title: "Dashboard",
          subtitle: "Your Nollywood Command Center.",
          accent: "from-primary to-orange-500",
          quickActions: [
            { label: "Profile", icon: Plus, desc: "Setup", action: () => setLocation("/profile") },
            { label: "Jobs", icon: Briefcase, desc: "Browse", action: () => setLocation("/jobs") },
            { label: "Projects", icon: Film, desc: "Explore", action: () => setLocation("/projects") },
            { label: "AI Tools", icon: Zap, desc: "Execute", action: () => setLocation("/ai-tools") }
          ]
        };
    }
  };

  const roleContent = getRoleBasedContent();
  const roleStats = getStatsForRole(primaryRole, stats);

  return (
    <div className="min-h-screen bg-black text-white film-grain overflow-x-hidden">
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
             <Badge className={`bg-gradient-to-r ${roleContent.accent} text-white border-none py-1 px-3 shadow-lg`}>
               <Zap className="w-3.5 h-3.5 mr-1.5 fill-current" />
               {roleContent.title}
             </Badge>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-serif mb-4 tracking-tighter">
            Welcome back, <span className={`bg-gradient-to-r ${roleContent.accent} bg-clip-text text-transparent italic`}>{user?.firstName}</span>
          </h1>
          <p className="text-white/40 text-xl font-light">{roleContent.subtitle}</p>
        </motion.div>

        {/* Stats Command Center */}
        <div className="mb-12" data-testid="stats-grid">
          <DashboardStats userRole={primaryRole} stats={roleStats} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-10">
            {/* Quick Actions Bento */}
            <section>
              <div className="flex items-center justify-between mb-6 px-2">
                 <h2 className="text-xl font-bold tracking-tight text-white/80">Command Hub</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {roleContent.quickActions.map((action, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={action.action}
                    className="glass-deep p-6 rounded-[32px] border-white/5 cursor-pointer group relative overflow-hidden transition-all"
                  >
                    <div className="mb-4 w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                      <action.icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="font-bold text-white text-sm">{action.label}</h3>
                    <p className="text-[10px] text-white/30">{action.desc}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            <div className="glass-deep rounded-[48px] p-2 border-white/5 shadow-2xl">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="p-6">
                  <TabsList className="inline-flex h-12 items-center rounded-2xl bg-white/5 p-1 text-white/40">
                    <TabsTrigger value="overview" className="rounded-xl px-6 text-xs font-bold">Recent Jobs</TabsTrigger>
                    <TabsTrigger value="projects" className="rounded-xl px-6 text-xs font-bold">My Projects</TabsTrigger>
                    <TabsTrigger value="analytics" className="rounded-xl px-6 text-xs font-bold">Analytics</TabsTrigger>
                  </TabsList>
                </div>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-8 pt-0"
                  >
                    <TabsContent value="overview" className="mt-0">
                       <Button variant="outline" className="w-full rounded-2xl h-14 border-dashed border-white/10 text-white/40">View All Jobs</Button>
                    </TabsContent>
                    <TabsContent value="projects" className="mt-0">
                       <Button variant="outline" className="w-full rounded-2xl h-14 border-dashed border-white/10 text-white/40">View All Projects</Button>
                    </TabsContent>
                  </motion.div>
                </AnimatePresence>
              </Tabs>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <section>
               <h2 className="text-xl font-bold tracking-tight text-white/80 mb-6 px-2">Intelligence Stream</h2>
               <div className="glass-deep rounded-[48px] p-8 border-white/5 shadow-2xl">
                  <div className="space-y-6">
                    {['Notifications', 'Recent Activity', 'Recent Connections'].map((title) => (
                      <div key={title} className="flex items-center justify-between group cursor-pointer">
                         <span className="text-sm font-bold text-white/60 group-hover:text-primary transition-colors">{title}</span>
                         <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-primary transition-colors" />
                      </div>
                    ))}
                  </div>
               </div>
            </section>
          </div>
        </div>
      </ResponsiveSection>
    </div>
  );
}