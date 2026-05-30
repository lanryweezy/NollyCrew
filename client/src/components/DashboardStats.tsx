import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Briefcase, 
  Star, 
  DollarSign,
  Eye,
  MessageCircle,
  Activity
} from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  delay?: number;
}

export interface DashboardStatsProps {
  userRole: "actor" | "crew" | "producer";
  stats: StatCardProps[];
}

function StatCard({ title, value, change, changeLabel, icon: Icon, trend = "neutral", delay = 0 }: StatCardProps) {
  const trendColor = {
    up: "text-green-500",
    down: "text-red-500",
    neutral: "text-white/40"
  };

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Activity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <div className="glass-deep rounded-[32px] p-6 border-white/5 relative overflow-hidden h-full shadow-2xl transition-all duration-500 group-hover:bg-white/5">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-12 -mt-12 transition-all duration-500 group-hover:bg-primary/10" />
        
        <div className="flex items-start justify-between mb-6">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:border-primary/20 transition-colors">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-bold ${trendColor[trend]} bg-white/5 px-2 py-1 rounded-full border border-white/5`}>
              <TrendIcon className="h-3.5 w-3.5" />
              <span>{change > 0 ? '+' : ''}{change}%</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-white/30 font-bold ml-0.5">{title}</p>
          <div className="text-4xl font-black text-white tracking-tighter" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {value}
          </div>
          {changeLabel && (
            <p className="text-[10px] text-white/20 font-medium ml-0.5">{changeLabel}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardStats({ userRole, stats }: DashboardStatsProps) {
  const safeStats = (stats || []).slice(0, 4); // Keep it to 4 main stats for the bento feel
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full" data-testid={`dashboard-stats-${userRole}`}>
      {safeStats.map((stat, index) => (
        <StatCard
          key={index}
          {...stat}
          delay={index * 0.1}
        />
      ))}
    </div>
  );
}

// Role-specific stat configurations
export const getStatsForRole = (role: "actor" | "crew" | "producer", data?: any): StatCardProps[] => {
  const baseStats: Record<string, StatCardProps[]> = {
    actor: [
      {
        title: "Match Radar",
        value: "92%",
        change: 4.5,
        changeLabel: "Profile strength optimization",
        icon: Activity,
        trend: "up"
      },
      {
        title: "Profile Reach",
        value: "1.2k",
        change: 18.2,
        changeLabel: "Views this session",
        icon: Eye,
        trend: "up"
      },
      {
        title: "Active Reels",
        value: 8,
        changeLabel: "Total media assets",
        icon: Briefcase,
      },
      {
        title: "Global Rating",
        value: "4.8",
        change: 2.1,
        changeLabel: "Verified reviews",
        icon: Star,
        trend: "up"
      }
    ],
    crew: [
      {
        title: "Gig Flow",
        value: 12,
        change: 5.4,
        changeLabel: "Pending offers",
        icon: Activity,
        trend: "up"
      },
      {
        title: "Total Revenue",
        value: "₦2.4M",
        change: 12.8,
        changeLabel: "Quarterly growth",
        icon: DollarSign,
        trend: "up"
      },
      {
        title: "Project Log",
        value: 6,
        changeLabel: "Active contracts",
        icon: Briefcase,
      },
      {
        title: "Expert Score",
        value: "4.9",
        changeLabel: "Client satisfaction",
        icon: Star,
        trend: "neutral"
      }
    ],
    producer: [
      {
        title: "Pipeline Health",
        value: "Optimal",
        change: 2.5,
        changeLabel: "Efficiency metrics",
        icon: Activity,
        trend: "up"
      },
      {
        title: "Active Prod",
        value: data?.recentProjects?.length || 3,
        changeLabel: "Total productions",
        icon: Briefcase,
      },
      {
        title: "Talent Pool",
        value: "45k+",
        change: 15.2,
        changeLabel: "Verified candidates",
        icon: Users,
        trend: "up"
      },
      {
        title: "Success Rate",
        value: "94%",
        change: 3.2,
        changeLabel: "On-time delivery",
        icon: Star,
        trend: "up"
      }
    ]
  };

  return baseStats[role] || baseStats.actor;
};