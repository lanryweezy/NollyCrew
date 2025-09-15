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
export const getStatsForRole = (role: "actor" | "crew" | "producer") => {
  const baseStats = {
    actor: [
      {
        title: "Profile Views",
        value: "2,847",
        change: 12.5,
        changeLabel: "this month",
        icon: Eye,
        trend: "up" as const
      },
      {
        title: "Applications Sent",
        value: 23,
        change: -5.2,
        changeLabel: "vs last month",
        icon: Briefcase,
        trend: "down" as const
      },
      {
        title: "Average Rating",
        value: "4.8",
        change: 2.1,
        changeLabel: "improved",
        icon: Star,
        trend: "up" as const
      },
      {
        title: "Messages",
        value: 48,
        change: 18.7,
        changeLabel: "new this week",
        icon: MessageCircle,
        trend: "up" as const
      }
    ],
    crew: [
      {
        title: "Job Offers",
        value: 15,
        change: 25.0,
        changeLabel: "this month",
        icon: Briefcase,
        trend: "up" as const
      },
      {
        title: "Total Earnings",
        value: "₦2.4M",
        change: 15.3,
        changeLabel: "this quarter",
        icon: DollarSign,
        trend: "up" as const
      },
      {
        title: "Client Rating",
        value: "4.9",
        change: 3.2,
        changeLabel: "improved",
        icon: Star,
        trend: "up" as const
      },
      {
        title: "Active Projects",
        value: 6,
        change: 0,
        changeLabel: "ongoing",
        icon: Users,
        trend: "neutral" as const
      }
    ],
    producer: [
      {
        title: "Active Projects",
        value: 8,
        change: 14.3,
        changeLabel: "new this quarter",
        icon: Briefcase,
        trend: "up" as const
      },
      {
        title: "Team Members",
        value: 342,
        change: 8.1,
        changeLabel: "hired",
        icon: Users,
        trend: "up" as const
      },
      {
        title: "Total Budget",
        value: "₦450M",
        change: 22.5,
        changeLabel: "allocated",
        icon: DollarSign,
        trend: "up" as const
      },
      {
        title: "Completion Rate",
        value: "94%",
        change: 2.3,
        changeLabel: "improved",
        icon: Star,
        trend: "up" as const
      }
    ]
  };

  return baseStats[role];
};