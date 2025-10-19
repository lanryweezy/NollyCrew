import { useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Briefcase, 
  Eye, 
  MessageSquare, 
  TrendingUp, 
  Calendar,
  DollarSign,
  Download,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  MapPin,
  Award,
  Target
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Mock data for enhanced analytics
const monthlyData = [
  { month: "Jan", users: 4000, jobs: 2400, views: 2400, revenue: 12000 },
  { month: "Feb", users: 3000, jobs: 1398, views: 2210, revenue: 9800 },
  { month: "Mar", users: 2000, jobs: 9800, views: 2290, revenue: 15600 },
  { month: "Apr", users: 2780, jobs: 3908, views: 2000, revenue: 11200 },
  { month: "May", users: 1890, jobs: 4800, views: 2181, revenue: 13400 },
  { month: "Jun", users: 2390, jobs: 3800, views: 2500, revenue: 14200 },
  { month: "Jul", users: 3490, jobs: 4300, views: 2100, revenue: 16800 },
];

const roleData = [
  { name: "Actors", value: 400 },
  { name: "Crew", value: 300 },
  { name: "Producers", value: 200 },
  { name: "Directors", value: 100 },
];

const engagementData = [
  { day: "Mon", engagement: 4000, messages: 1200 },
  { day: "Tue", engagement: 3000, messages: 980 },
  { day: "Wed", engagement: 2000, messages: 850 },
  { day: "Thu", engagement: 2780, messages: 1100 },
  { day: "Fri", engagement: 1890, messages: 920 },
  { day: "Sat", engagement: 2390, messages: 1400 },
  { day: "Sun", engagement: 3490, messages: 1650 },
];

const performanceData = [
  { category: "Profile Views", score: 85 },
  { category: "Application Rate", score: 72 },
  { category: "Response Time", score: 90 },
  { category: "Project Success", score: 78 },
  { category: "Client Rating", score: 92 },
];

const revenueData = [
  { month: "Jan", casting: 5000, crew: 3000, production: 4000 },
  { month: "Feb", casting: 4200, crew: 2800, income: 3800 },
  { month: "Mar", casting: 6500, crew: 4200, income: 4900 },
  { month: "Apr", casting: 5100, crew: 3500, income: 4200 },
  { month: "May", casting: 5800, crew: 3900, income: 4700 },
  { month: "Jun", casting: 6200, crew: 4100, income: 4900 },
  { month: "Jul", casting: 7100, crew: 4600, income: 5100 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon,
  color = "blue",
  trend = "up"
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  trend?: "up" | "down";
}) => {
  const colorClasses = {
    blue: "text-blue-500 bg-blue-100 dark:bg-blue-900/50",
    green: "text-green-500 bg-green-100 dark:bg-green-900/50",
    purple: "text-purple-500 bg-purple-100 dark:bg-purple-900/50",
    yellow: "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/50",
    red: "text-red-500 bg-red-100 dark:bg-red-900/50",
  };

  const trendIcon = trend === "up" ? 
    <TrendingUp className="w-4 h-4 text-green-500" /> : 
    <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-1 mt-1">
          {trendIcon}
          <p className="text-xs text-muted-foreground">{change}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default function EnhancedAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("last-30-days");
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Enhanced Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into your platform performance and engagement metrics
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-7-days">Last 7 days</SelectItem>
              <SelectItem value="last-30-days">Last 30 days</SelectItem>
              <SelectItem value="last-90-days">Last 90 days</SelectItem>
              <SelectItem value="year-to-date">Year to date</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Users" 
          value="12,458" 
          change="+12% from last month" 
          icon={Users}
          color="blue"
          trend="up"
        />
        <StatCard 
          title="Active Jobs" 
          value="1,248" 
          change="+8% from last month" 
          icon={Briefcase}
          color="green"
          trend="up"
        />
        <StatCard 
          title="Profile Views" 
          value="42,891" 
          change="+18% from last month" 
          icon={Eye}
          color="purple"
          trend="up"
        />
        <StatCard 
          title="Total Revenue" 
          value="₦2.4M" 
          change="+22% from last month" 
          icon={DollarSign}
          color="yellow"
          trend="up"
        />
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Performance"
                  dataKey="score"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>User Growth & Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="users" stackId="1" stroke="#8884d8" fill="#8884d8" name="New Users" />
                  <Area type="monotone" dataKey="jobs" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Jobs Posted" />
                  <Area type="monotone" dataKey="views" stackId="1" stroke="#ffc658" fill="#ffc658" name="Profile Views" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="casting" fill="#0088FE" name="Casting Revenue" />
                  <Bar dataKey="crew" fill="#00C49F" name="Crew Revenue" />
                  <Bar dataKey="income" fill="#FFBB28" name="Production Income" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Roles Distribution */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>User Roles Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {roleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Over Time */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Weekly Engagement & Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="engagement" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                    name="Engagement Score"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="messages" 
                    stroke="#82ca9d" 
                    name="Messages Sent"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Users */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Performing Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Funke Akindele", role: "Actor", projects: 12, rating: 4.9, earnings: "₦2.1M" },
                { name: "Kemi Adetiba", role: "Director", projects: 8, rating: 4.8, earnings: "₦3.4M" },
                { name: "Tunde Cinematography", role: "Cinematographer", projects: 15, rating: 4.7, earnings: "₦1.8M" },
                { name: "Jade Osiberu", role: "Producer", projects: 6, rating: 4.9, earnings: "₦4.2M" },
              ].map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">{user.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{user.role}</span>
                        <Badge variant="secondary">{user.projects} projects</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{user.rating}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.earnings}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Platform Health */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium">System Uptime</p>
                    <p className="text-sm text-muted-foreground">Last 30 days</p>
                  </div>
                </div>
                <span className="font-bold text-green-500">99.9%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">Pending Reports</p>
                    <p className="text-sm text-muted-foreground">Requires attention</p>
                  </div>
                </div>
                <span className="font-bold text-yellow-500">3</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Avg. Response Time</p>
                    <p className="text-sm text-muted-foreground">API performance</p>
                  </div>
                </div>
                <span className="font-bold text-blue-500">124ms</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="font-medium">User Satisfaction</p>
                    <p className="text-sm text-muted-foreground">Based on surveys</p>
                  </div>
                </div>
                <span className="font-bold text-purple-500">4.7/5</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}