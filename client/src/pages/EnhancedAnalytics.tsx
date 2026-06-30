import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { analytics } from "@/lib/api";
import Navigation from "@/components/Navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  Filter, 
  Calendar as CalendarIcon,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  DollarSign,
  Award,
  TrendingUp,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from "lucide-react";
import { 
  LineChart as ReLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell
} from "recharts";
import PageHeader from "@/components/PageHeader";
import EnhancedAnalyticsReporting from "@/components/EnhancedAnalyticsReporting";

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

export default function EnhancedAnalytics() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState<any>(null);
  const [financial, setFinancial] = useState<any>(null);
  const [benchmarks, setBenchmarks] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);

  useEffect(() => { loadAllData(); }, []);

  async function loadAllData() {
    setLoading(true);
    const [pred, fin, bench, trend] = await Promise.allSettled([
      analytics.getProjectSuccess(),
      analytics.getFinancialReport(),
      analytics.getPerformanceBenchmarks(),
      analytics.getTrendAnalysis(),
    ]);
    if (pred.status === 'fulfilled' && pred.value) setPredictions(pred.value.predictions || pred.value);
    if (fin.status === 'fulfilled' && fin.value) setFinancial(fin.value.report || fin.value);
    if (bench.status === 'fulfilled' && bench.value) setBenchmarks(bench.value.benchmarks || bench.value);
    if (trend.status === 'fulfilled' && trend.value) setTrends(trend.value.trends || trend.value);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        <Navigation isAuthenticated={isAuthenticated} />
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <PageHeader 
          title="Enhanced Analytics Dashboard" 
          description="Predictive analytics, financial insights, performance benchmarks, and trend analysis"
        >
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast({ title: "Filters applied" })}>
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" onClick={() => toast({ title: "Date range updated" })}>
              <CalendarIcon className="w-4 h-4 mr-2" />
              Last 30 days
            </Button>
            <Button onClick={() => {
              const data = JSON.stringify({ exportDate: new Date().toISOString(), type: 'analytics' });
              navigator.clipboard.writeText(data);
              toast({ title: "Analytics exported to clipboard" });
            }}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={() => toast({ title: "Date range coming soon" })}>
              <CalendarIcon className="w-4 h-4 mr-2" /> Last 30 days
            </Button>
            <Button onClick={() => toast({ title: "Export coming soon" })}>
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
          </div>
        </PageHeader>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Overview
              </TabsTrigger>
              <TabsTrigger value="predictive" className="flex items-center gap-2">
                <Target className="w-4 h-4" /> Predictive Analytics
              </TabsTrigger>
              <TabsTrigger value="financial" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Financial Reporting
              </TabsTrigger>
              <TabsTrigger value="benchmarks" className="flex items-center gap-2">
                <Award className="w-4 h-4" /> Performance Benchmarks
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Trend Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <EnhancedAnalyticsReporting />
            </TabsContent>

            <TabsContent value="predictive" className="space-y-6">
              {predictions ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {Array.isArray(predictions) ? predictions.map((p: any, i: number) => (
                    <Card key={i}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5" />
                          {p.project_name || p.name || `Prediction ${i + 1}`}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {p.success_probability !== undefined && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm">Success Probability</span>
                              <span className="font-semibold">{Math.round(p.success_probability * 100)}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div className="bg-primary rounded-full h-2" style={{ width: `${p.success_probability * 100}%` }} />
                            </div>
                          </div>
                        )}
                        {p.risk_factors && (
                          <div>
                            <p className="text-sm font-medium mb-1">Risk Factors</p>
                            {(Array.isArray(p.risk_factors) ? p.risk_factors : [p.risk_factors]).map((r: string, j: number) => (
                              <Badge key={j} variant="outline" className="mr-1 mb-1">{r}</Badge>
                            ))}
                          </div>
                        )}
                        {p.recommendations && (
                          <div>
                            <p className="text-sm font-medium mb-1">Recommendations</p>
                            <p className="text-sm text-muted-foreground">{Array.isArray(p.recommendations) ? p.recommendations.join('. ') : p.recommendations}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )) : (
                    <Card className="col-span-2">
                      <CardContent className="pt-6">
                        <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(predictions, null, 2)}</pre>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No prediction data available yet. Create projects to get AI-powered success predictions.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="financial" className="space-y-6">
              {financial ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {financial.total_revenue !== undefined && (
                    <Card>
                      <CardHeader><CardTitle>Revenue Overview</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-3xl font-bold">₦{(financial.total_revenue || 0).toLocaleString()}</div>
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                        {financial.breakdown && Object.entries(financial.breakdown).map(([key, val]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                            <span className="font-medium">₦{Number(val).toLocaleString()}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                  {financial.expenses && (
                    <Card>
                      <CardHeader><CardTitle>Expenses</CardTitle></CardHeader>
                      <CardContent>
                        <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(financial.expenses, null, 2)}</pre>
                      </CardContent>
                    </Card>
                  )}
                  {!financial.total_revenue && !financial.expenses && (
                    <Card className="col-span-2">
                      <CardContent className="pt-6">
                        <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(financial, null, 2)}</pre>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No financial data available yet. Process payments to see financial reports.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="benchmarks" className="space-y-6">
              {benchmarks ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {Array.isArray(benchmarks) ? benchmarks.map((b: any, i: number) => (
                    <Card key={i}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="w-5 h-5" />
                          {b.metric || b.name || `Benchmark ${i + 1}`}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {b.your_value !== undefined && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm">Your Value</span>
                              <span className="font-semibold">{b.your_value}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div className="bg-primary rounded-full h-2" style={{ width: `${Math.min((b.your_value / (b.industry_average || b.your_value || 1)) * 100, 100)}%` }} />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Industry Average: {b.industry_average}</p>
                          </div>
                        )}
                        {!b.your_value && <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(b, null, 2)}</pre>}
                      </CardContent>
                    </Card>
                  )) : (
                    <Card className="col-span-2">
                      <CardContent className="pt-6">
                        <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(benchmarks, null, 2)}</pre>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Award className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No benchmark data available yet.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              {trends ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {Array.isArray(trends) ? trends.map((t: any, i: number) => (
                    <Card key={i}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          {t.metric || t.category || `Trend ${i + 1}`}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {t.data_points && Array.isArray(t.data_points) ? (
                          <div className="h-40">
                            <ResponsiveContainer width="100%" height="100%">
                              <ReLineChart data={t.data_points}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" stroke="#888" fontSize={11} tickLine={false} />
                                <YAxis stroke="#888" fontSize={11} tickLine={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} />
                              </ReLineChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(t, null, 2)}</pre>
                        )}
                      </CardContent>
                    </Card>
                  )) : (
                    <Card className="col-span-2">
                      <CardContent className="pt-6">
                        <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(trends, null, 2)}</pre>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No trend data available yet. Use the platform more to generate trends.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
