import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Users, 
  Briefcase, 
  Film, 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from "recharts";

interface PlatformStats {
  totalEscrowVolume: number;
  totalUsers: number;
  totalProjects: number;
  totalJobs: number;
  activeUsersToday: number;
  revenueHistory: Array<{ date: string; amount: number }>;
  userCategories: Array<{ name: string; value: number }>;
  recentActivity: Array<{ id: string; action: string; user: string; time: string }>;
}

export default function BossDashboard() {
  const { data: stats, isLoading } = useQuery<PlatformStats>({
    queryKey: ["/api/admin/stats"],
    queryFn: () => apiFetch("/api/admin/stats"),
  });

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto p-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">The Boss Analytics</h1>
            <p className="text-muted-foreground mt-1 text-lg">High-level platform metrics for Street Heart Technologies.</p>
          </div>
          <div className="flex gap-2">
            <Card className="px-4 py-2 border-primary/20 bg-primary/5 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-semibold text-primary">Live Updates Active</span>
            </Card>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 w-24 bg-muted rounded"></div>
                  <div className="h-4 w-4 bg-muted rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 bg-muted rounded mb-1"></div>
                  <div className="h-3 w-32 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Escrow Volume</CardTitle>
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    ₦{(stats?.totalEscrowVolume || 0).toLocaleString()}
                  </div>
                  <div className="flex items-center text-emerald-500 text-xs mt-1 font-medium">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +20.1% <span className="text-muted-foreground ml-1">vs last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.totalUsers || 0}</div>
                  <div className="flex items-center text-blue-500 text-xs mt-1 font-medium">
                    <Activity className="h-3 w-3 mr-1" />
                    {stats?.activeUsersToday || 0} <span className="text-muted-foreground ml-1">active today</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                  <Film className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.totalProjects || 0}</div>
                  <div className="flex items-center text-emerald-500 text-xs mt-1 font-medium">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +12 <span className="text-muted-foreground ml-1">new this week</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Open Jobs</CardTitle>
                  <Briefcase className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.totalJobs || 0}</div>
                  <div className="flex items-center text-orange-500 text-xs mt-1 font-medium">
                    <Activity className="h-3 w-3 mr-1" />
                    +4 <span className="text-muted-foreground ml-1">posted today</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Financial Growth
                  </CardTitle>
                  <CardDescription>Escrow volume trend for the current quarter</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats?.revenueHistory || [
                        { date: 'Apr 01', amount: 1200000 },
                        { date: 'Apr 08', amount: 1500000 },
                        { date: 'Apr 15', amount: 1300000 },
                        { date: 'Apr 22', amount: 1800000 },
                        { date: 'Apr 29', amount: 2400000 },
                        { date: 'May 02', amount: 2600000 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#888888" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false} 
                        />
                        <YAxis 
                          stroke="#888888" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false}
                          tickFormatter={(value) => `₦${(value / 1000).toLocaleString()}k`}
                        />
                        <Tooltip 
                          contentStyle={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: any) => [`₦${value.toLocaleString()}`, 'Amount']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="amount" 
                          stroke="#10b981" 
                          strokeWidth={3} 
                          dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-primary" />
                    User Distribution
                  </CardTitle>
                  <CardDescription>Breakdown by primary user role</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  <div className="h-[300px] w-full flex flex-col md:flex-row items-center justify-center gap-8">
                    <div className="h-full flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats?.userCategories || [
                              { name: 'Actors', value: 45 },
                              { name: 'Producers', value: 20 },
                              { name: 'Crew', value: 25 },
                              { name: 'Others', value: 10 },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {(stats?.userCategories || [
                              { name: 'Actors', value: 45 },
                              { name: 'Producers', value: 20 },
                              { name: 'Crew', value: 25 },
                              { name: 'Others', value: 10 },
                            ]).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3">
                      {(stats?.userCategories || [
                        { name: 'Actors', value: 45 },
                        { name: 'Producers', value: 20 },
                        { name: 'Crew', value: 25 },
                        { name: 'Others', value: 10 },
                      ]).map((entry, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-sm font-medium">{entry.name}</span>
                          <span className="text-sm text-muted-foreground ml-auto">{entry.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Recent Platform Activity</CardTitle>
                <CardDescription>Real-time feed of system-wide actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(stats?.recentActivity || [
                    { id: '1', action: 'New Project Created', user: 'Kunle Afolayan', time: '12 mins ago' },
                    { id: '2', action: 'Casting Call Posted', user: 'Trino Studios', time: '45 mins ago' },
                    { id: '3', action: 'Payment Released', user: 'System (Escrow)', time: '1 hour ago' },
                    { id: '4', action: 'New Talent Registered', user: 'Mercy Johnson', time: '2 hours ago' },
                    { id: '5', action: 'Audit Log Exported', user: 'Admin User', time: '3 hours ago' },
                  ]).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-muted-foreground/5">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Activity className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{item.action}</p>
                          <p className="text-xs text-muted-foreground">{item.user}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">{item.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
