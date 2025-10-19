import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Briefcase, 
  Eye, 
  MessageSquare, 
  TrendingUp, 
  Calendar,
  DollarSign
} from "lucide-react";

const monthlyData = [
  { month: "Jan", users: 4000, jobs: 2400, views: 2400 },
  { month: "Feb", users: 3000, jobs: 1398, views: 2210 },
  { month: "Mar", users: 2000, jobs: 9800, views: 2290 },
  { month: "Apr", users: 2780, jobs: 3908, views: 2000 },
  { month: "May", users: 1890, jobs: 4800, views: 2181 },
  { month: "Jun", users: 2390, jobs: 3800, views: 2500 },
  { month: "Jul", users: 3490, jobs: 4300, views: 2100 },
];

const roleData = [
  { name: "Actors", value: 400 },
  { name: "Crew", value: 300 },
  { name: "Producers", value: 200 },
  { name: "Directors", value: 100 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const engagementData = [
  { day: "Mon", engagement: 4000 },
  { day: "Tue", engagement: 3000 },
  { day: "Wed", engagement: 2000 },
  { day: "Thu", engagement: 2780 },
  { day: "Fri", engagement: 1890 },
  { day: "Sat", engagement: 2390 },
  { day: "Sun", engagement: 3490 },
];

const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon,
  color = "blue"
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
}) => {
  const colorClasses = {
    blue: "text-blue-500 bg-blue-100 dark:bg-blue-900/50",
    green: "text-green-500 bg-green-100 dark:bg-green-900/50",
    purple: "text-purple-500 bg-purple-100 dark:bg-purple-900/50",
    yellow: "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/50",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{change}</p>
      </CardContent>
    </Card>
  );
};

export default function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
        <p className="text-muted-foreground">
          Track your platform engagement and performance metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Users" 
          value="12,458" 
          change="+12% from last month" 
          icon={Users}
          color="blue"
        />
        <StatCard 
          title="Active Jobs" 
          value="1,248" 
          change="+8% from last month" 
          icon={Briefcase}
          color="green"
        />
        <StatCard 
          title="Profile Views" 
          value="42,891" 
          change="+18% from last month" 
          icon={Eye}
          color="purple"
        />
        <StatCard 
          title="Messages" 
          value="8,234" 
          change="+5% from last month" 
          icon={MessageSquare}
          color="yellow"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#0088FE" name="New Users" />
                  <Bar dataKey="jobs" fill="#00C49F" name="Jobs Posted" />
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
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Engagement</CardTitle>
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
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}