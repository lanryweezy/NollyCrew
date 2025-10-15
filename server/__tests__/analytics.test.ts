import { 
  predictProjectSuccess, 
  generateFinancialReport, 
  generatePerformanceBenchmarks, 
  generateTrendAnalysis 
} from '../analytics';

// Mock storage module
jest.mock('../storage', () => ({
  storage: {
    getProjects: jest.fn().mockResolvedValue([
      {
        id: 'project-1',
        title: 'Test Project',
        description: 'A test project',
        genre: 'Drama',
        type: 'feature',
        status: 'completed',
        budget: '1000000',
        currency: 'NGN',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-06-01'),
        location: 'Lagos',
        poster: null,
        trailer: null,
        script: null,
        scriptBreakdown: null,
        createdById: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ])
  }
}));

describe('Analytics Service', () => {
  describe('predictProjectSuccess', () => {
    it('should generate project success predictions', async () => {
      const predictions = await predictProjectSuccess('user-1');
      
      expect(predictions).toBeInstanceOf(Array);
      expect(predictions.length).toBeGreaterThan(0);
      
      const prediction = predictions[0];
      expect(prediction).toHaveProperty('projectId');
      expect(prediction).toHaveProperty('projectName');
      expect(prediction).toHaveProperty('successProbability');
      expect(prediction).toHaveProperty('riskFactors');
      expect(prediction).toHaveProperty('recommendations');
      expect(prediction).toHaveProperty('confidence');
    });
  });

  describe('generateFinancialReport', () => {
    it('should generate financial report', async () => {
      const report = await generateFinancialReport('user-1');
      
      expect(report).toHaveProperty('totalRevenue');
      expect(report).toHaveProperty('totalExpenses');
      expect(report).toHaveProperty('netProfit');
      expect(report).toHaveProperty('profitMargin');
      expect(report).toHaveProperty('budgetUtilization');
      expect(report).toHaveProperty('topPerformingProjects');
      expect(report).toHaveProperty('expenseBreakdown');
      
      expect(report.topPerformingProjects).toBeInstanceOf(Array);
      expect(report.expenseBreakdown).toBeInstanceOf(Object);
    });
  });

  describe('generatePerformanceBenchmarks', () => {
    it('should generate performance benchmarks', async () => {
      const benchmarks = await generatePerformanceBenchmarks('user-1');
      
      expect(benchmarks).toBeInstanceOf(Array);
      expect(benchmarks.length).toBeGreaterThan(0);
      
      const benchmark = benchmarks[0];
      expect(benchmark).toHaveProperty('metric');
      expect(benchmark).toHaveProperty('currentValue');
      expect(benchmark).toHaveProperty('industryAverage');
      expect(benchmark).toHaveProperty('percentile');
      expect(benchmark).toHaveProperty('trend');
      expect(benchmark).toHaveProperty('recommendations');
    });
  });

  describe('generateTrendAnalysis', () => {
    it('should generate trend analysis', async () => {
      const trends = await generateTrendAnalysis('user-1');
      
      expect(trends).toBeInstanceOf(Array);
      expect(trends.length).toBeGreaterThan(0);
      
      const trend = trends[0];
      expect(trend).toHaveProperty('metric');
      expect(trend).toHaveProperty('historicalData');
      expect(trend).toHaveProperty('trend');
      expect(trend).toHaveProperty('forecast');
      
      expect(trend.historicalData).toBeInstanceOf(Array);
      expect(trend.forecast).toBeInstanceOf(Array);
    });
  });
});