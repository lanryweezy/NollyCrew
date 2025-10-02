import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Briefcase, 
  Star, 
  DollarSign,
  Eye,
  MessageCircle
} from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
}

export interface DashboardStatsProps {
  userRole: "actor" | "crew" | "producer";
  stats: StatCardProps[];
}

function StatCard({ title, value, change, changeLabel, icon: Icon, trend = "neutral" }: StatCardProps) {
  const trendColor = {
    up: "text-green-600 dark:text-green-400",
    down: "text-red-600 dark:text-red-400",
    neutral: "text-muted-foreground"
  };

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : null;

  return (
    <Card className="hover-elevate transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {value}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs ${trendColor[trend]} mt-1`}>
            {TrendIcon && <TrendIcon className="h-3 w-3" />}
            <span>
              {change > 0 ? '+' : ''}{change}%
            </span>
            {changeLabel && (
              <span className="text-muted-foreground">
                {changeLabel}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardStats({ userRole, stats }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-testid={`dashboard-stats-${userRole}`}>
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          {...stat}
        />
      ))}
    </div>
  );
}

// Role-specific stat configurations
export const getStatsForRole = (role: "actor" | "crew" | "producer", data: any) => {
  const baseStats = {
    actor: [
      {
        title: "Applications Sent",
        value: data?.recentApplications?.length || 0,
        icon: Briefcase,
      },
      {
        title: "Unread Messages",
        value: data?.unreadMessagesCount || 0,
        icon: MessageCircle,
      },
      {
        title: "Profile Views",
        value: "Coming Soon",
        icon: Eye,
      },
      {
        title: "Average Rating",
        value: "Coming Soon",
        icon: Star,
      }
    ],
    crew: [
      {
        title: "Active Projects",
        value: data?.recentProjects?.length || 0,
        icon: Briefcase,
      },
      {
        title: "Unread Messages",
        value: data?.unreadMessagesCount || 0,
        icon: MessageCircle,
      },
      {
        title: "Job Offers",
        value: "Coming Soon",
        icon: Briefcase,
      },
      {
        title: "Total Earnings",
        value: "Coming Soon",
        icon: DollarSign,
      }
    ],
    producer: [
      {
        title: "Active Projects",
        value: data?.recentProjects?.length || 0,
        icon: Briefcase,
      },
      {
        title: "Unread Messages",
        value: data?.unreadMessagesCount || 0,
        icon: MessageCircle,
      },
      {
        title: "Team Members",
        value: "Coming Soon",
        icon: Users,
      },
      {
        title: "Total Budget",
        value: "Coming Soon",
        icon: DollarSign,
      }
    ]
  };

  return baseStats[role];
};