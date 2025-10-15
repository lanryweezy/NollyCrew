import { useState, useEffect } from "react";
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
  Target,
  TrendingDown
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Types for our analytics data
interface ProjectSuccessPrediction {
  projectId: string;
  projectName: string;
  successProbability: number;
  riskFactors: string[];
  recommendations: string[];
  confidence: number;
}

interface FinancialReport {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  budgetUtilization: number;
  topPerformingProjects: Array<{
    projectId: string;
    projectName: string;
    revenue: number;
    profit: number;
  }>;
  expenseBreakdown: Record<string, number>;
}

interface PerformanceBenchmark {
  metric: string;
  currentValue: number;
  industryAverage: number;
  percentile: number;
  trend: 'improving' | 'declining' | 'stable';
  recommendations: string[];
}

interface TrendAnalysis {
  metric: string;
  historicalData: Array<{
    period: string;
    value: number;
  }>;
  trend: 'increasing' | 'decreasing' | 'stable';
  forecast: Array<{
    period: string;
    predictedValue: number;
    confidenceInterval: [number, number];
  }>;
}

// Mock data for initial display
const mockProjectPredictions: ProjectSuccessPrediction[] = [
  {
    projectId: 'proj-1',
    projectName: 'Nollywood Blockbuster',
    successProbability: 85,
    riskFactors: ['Tight deadline', 'Limited budget'],
    recommendations: ['Extend timeline', 'Increase budget allocation'],
    confidence: 0.85
  },
  {
    projectId: 'proj-2',
    projectName: 'TV Series Pilot',
    successProbability: 72,
    riskFactors: ['Small team size'],
    recommendations: ['Expand team', 'Allocate more resources'],
    confidence: 0.75
  }
];

const mockFinancialReport: FinancialReport = {
  totalRevenue: 2500000,
  totalExpenses: 1800000,
  netProfit: 700000,
  profitMargin: 28,
  budgetUtilization: 85,
  topPerformingProjects: [
    {
      projectId: 'project-1',
      projectName: 'Blockbuster Movie',
      revenue: 1200000,
      profit: 400000
    },
    {
      projectId: 'project-2',
      projectName: 'TV Series',
      revenue: 800000,
      profit: 250000
    }
  ],
  expenseBreakdown: {
    'crew': 600000,
    'equipment': 400000,
    'locations': 300000,
    'post_production': 350000,
    'marketing': 150000,
    'other': 100000
  }
};

const mockPerformanceBenchmarks: PerformanceBenchmark[] = [
  {
    metric: 'Project Completion Rate',
    currentValue: 78.5,
    industryAverage: 75,
    percentile: 65,
    trend: 'improving',
    recommendations: ['Maintain current practices', 'Consider taking on more projects']
  },
  {
    metric: 'Budget Utilization',
    currentValue: 82.3,
    industryAverage: 85,
    percentile: 45,
    trend: 'stable',
    recommendations: ['Optimize resource allocation', 'Review budget planning']
  },
  {
    metric: 'Client Satisfaction',
    currentValue: 4.3,
    industryAverage: 4.2,
    percentile: 75,
    trend: 'improving',
    recommendations: ['Continue excellent service', 'Request testimonials']
  }
];

const mockTrendAnalysis: TrendAnalysis[] = [
  {
    metric: 'Monthly Revenue',
    historicalData: [
      { period: 'Jan', value: 120000 },
      { period: 'Feb', value: 145000 },
      { period: 'Mar', value: 160000 },
      { period: 'Apr', value: 180000 },
      { period: 'May', value: 195000 },
      { period: 'Jun', value: 210000 }
    ],
    trend: 'increasing',
    forecast: [
      { period: 'Jul', predictedValue: 225000, confidenceInterval: [200000, 250000] },
      { period: 'Aug', predictedValue: 240000, confidenceInterval: [215000, 265000] },
      { period: 'Sep', predictedValue: 255000, confidenceInterval: [230000, 280000] }
    ]
  },
  {
    metric: 'Projects Completed',
    historicalData: [
      { period: 'Jan', value: 2 },
      { period: 'Feb', value: 3 },
      { period: 'Mar', value: 4 },
      { period: 'Apr', value: 3 },
      { period: 'May', value: 5 },
      { period: 'Jun', value: 6 }
    ],
    trend: 'increasing',
    forecast: [
      { period: 'Jul', predictedValue: 7, confidenceInterval: [5, 9] },
      { period: 'Aug', predictedValue: 8, confidenceInterval: [6, 10] },
      { period: 'Sep', predictedValue: 9, confidenceInterval: [7, 11] }
    ]
  }
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
  value: string | number;
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

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <TrendingUp className="w-4 h-4 text-green-500" />;
    }
  };

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
          {getTrendIcon()}
          <p className="text-xs text-muted-foreground">{change}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const ProjectSuccessCard = ({ prediction }: { prediction: ProjectSuccessPrediction }) => {
  const getStatusColor = (probability: number) => {
    if (probability >= 80) return "text-green-500";
    if (probability >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-500";
    if (confidence >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{prediction.projectName}</span>
          <Badge variant={prediction.successProbability >= 80 ? "default" : prediction.successProbability >= 60 ? "secondary" : "destructive"}>
            {prediction.successProbability}% Success
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Confidence Level</span>
              <span>{(prediction.confidence * 100).toFixed(0)}%</span>
            </div>
            <Progress value={prediction.confidence * 100} className="h-2" />
          </div>
          
          <div>
            <h4 className="font-medium text-sm mb-2">Risk Factors</h4>
            <div className="flex flex-wrap gap-2">
              {prediction.riskFactors.map((factor, index) => (
                <Badge key={index} variant="destructive" className="text-xs">
                  {factor}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-sm mb-2">Recommendations</h4>
            <ul className="text-sm space-y-1">
              {prediction.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const BenchmarkCard = ({ benchmark }: { benchmark: PerformanceBenchmark }) => {
  const getTrendIcon = () => {
    switch (benchmark.trend) {
      case "improving":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "declining":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: // stable case
        return <TrendingUp className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    if (benchmark.currentValue > benchmark.industryAverage) return "text-green-500";
    if (benchmark.currentValue < benchmark.industryAverage) return "text-red-500";
    return "text-gray-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{benchmark.metric}</span>
          {getTrendIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-sm">Your Performance</span>
            <span className={`font-bold ${getStatusColor()}`}>
              {benchmark.currentValue}{benchmark.metric.includes('Rating') ? '' : '%'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Industry Average</span>
            <span className="font-bold">
              {benchmark.industryAverage}{benchmark.metric.includes('Rating') ? '' : '%'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Percentile</span>
            <span className="font-bold">
              {benchmark.percentile}%
            </span>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-2">Recommendations</h4>
            <ul className="text-sm space-y-1">
              {benchmark.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function EnhancedAnalyticsReporting() {
  const [timeRange, setTimeRange] = useState("last-30-days");
  const [projectPredictions, setProjectPredictions] = useState<ProjectSuccessPrediction[]>(mockProjectPredictions);
  const [financialReport, setFinancialReport] = useState<FinancialReport>(mockFinancialReport);
  const [performanceBenchmarks, setPerformanceBenchmarks] = useState<PerformanceBenchmark[]>(mockPerformanceBenchmarks);
  const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysis[]>(mockTrendAnalysis);
  const [loading, setLoading] = useState(false);

  // In a real implementation, we would fetch data from the API
  // For now, we'll use mock data

  const refreshData = () => {
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Enhanced Analytics & Reporting</h2>
          <p className="text-muted-foreground">
            Predictive analytics, financial insights, performance benchmarks, and trend analysis
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
          <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Predictive Analytics - Project Success Predictions */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Predictive Analytics - Project Success</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projectPredictions.map((prediction, index) => (
            <ProjectSuccessCard key={index} prediction={prediction} />
          ))}
        </div>
      </div>

      {/* Financial Reporting */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-green-500" />
          <h3 className="text-lg font-semibold">Financial Reporting</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Total Revenue" 
            value={formatCurrency(financialReport.totalRevenue)} 
            change="+12% from last period" 
            icon={DollarSign}
            color="green"
            trend="up"
          />
          <StatCard 
            title="Net Profit" 
            value={formatCurrency(financialReport.netProfit)} 
            change="+8% from last period" 
            icon={Award}
            color="blue"
            trend="up"
          />
          <StatCard 
            title="Profit Margin" 
            value={`${financialReport.profitMargin.toFixed(1)}%`} 
            change="+2.3% from last period" 
            icon={TrendingUp}
            color="purple"
            trend="up"
          />
          <StatCard 
            title="Budget Utilization" 
            value={`${financialReport.budgetUtilization.toFixed(1)}%`} 
            change="+1.2% from last period" 
            icon={Briefcase}
            color="yellow"
            trend="up"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Expense Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(financialReport.expenseBreakdown).map(([key, value]) => ({
                        name: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                        value
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {Object.entries(financialReport.expenseBreakdown).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Top Performing Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financialReport.topPerformingProjects.map((project, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{project.projectName}</p>
                      <p className="text-sm text-muted-foreground">
                        Revenue: {formatCurrency(project.revenue)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-500">
                        {formatCurrency(project.profit)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Profit
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Performance Benchmarks */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold">Performance Benchmarks</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {performanceBenchmarks.map((benchmark, index) => (
            <BenchmarkCard key={index} benchmark={benchmark} />
          ))}
        </div>
      </div>

      {/* Trend Analysis */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold">Trend Analysis</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {trendAnalysis.map((trend, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  {trend.metric}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={trend.historicalData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => trend.metric.includes('Revenue') ? 
                          formatCurrency(Number(value)) : 
                          value
                        }
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke={COLORS[index % COLORS.length]} 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4">
                  <h4 className="font-medium text-sm mb-2">Forecast</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {trend.forecast.map((forecast, fIndex) => (
                      <div key={fIndex} className="text-center p-2 bg-muted rounded">
                        <p className="text-xs text-muted-foreground">{forecast.period}</p>
                        <p className="font-medium">
                          {trend.metric.includes('Revenue') ? 
                            formatCurrency(forecast.predictedValue) : 
                            forecast.predictedValue
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ({formatCurrency(forecast.confidenceInterval[0])} - {formatCurrency(forecast.confidenceInterval[1])})
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}