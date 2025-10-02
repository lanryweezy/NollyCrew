import { logger } from './logger';

// System metrics collection
export class MetricsCollector {
  private static instance: MetricsCollector;
  private metrics: Map<string, number> = new Map();
  private timers: Map<string, number> = new Map();

  private constructor() {}

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  // Increment a counter metric
  increment(metric: string, value: number = 1): void {
    const current = this.metrics.get(metric) || 0;
    this.metrics.set(metric, current + value);
  }

  // Set a gauge metric
  set(metric: string, value: number): void {
    this.metrics.set(metric, value);
  }

  // Start a timer
  startTimer(name: string): void {
    this.timers.set(name, Date.now());
  }

  // Stop a timer and record the duration
  stopTimer(name: string): number {
    const start = this.timers.get(name);
    if (!start) {
      logger.warn('Timer not found', { name });
      return 0;
    }
    
    const duration = Date.now() - start;
    this.timers.delete(name);
    this.metrics.set(`timer_${name}`, duration);
    return duration;
  }

  // Get all metrics
  getMetrics(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [key, value] of this.metrics.entries()) {
      result[key] = value;
    }
    return result;
  }

  // Reset all metrics
  reset(): void {
    this.metrics.clear();
    this.timers.clear();
  }
}

// Health check service
export class HealthChecker {
  static async checkDatabase(): Promise<{ status: string; message?: string }> {
    try {
      // In a real implementation, you would check actual database connectivity
      // For now, we'll simulate a successful check
      return { status: 'healthy' };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        message: (error as Error).message 
      };
    }
  }

  static async checkRedis(): Promise<{ status: string; message?: string }> {
    try {
      // In a real implementation, you would check actual Redis connectivity
      // For now, we'll simulate a successful check
      return { status: 'healthy' };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        message: (error as Error).message 
      };
    }
  }

  static async checkExternalServices(): Promise<{ status: string; message?: string }> {
    try {
      // Check external services like Paystack, OpenAI, etc.
      // For now, we'll simulate a successful check
      return { status: 'healthy' };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        message: (error as Error).message 
      };
    }
  }

  static async getSystemHealth(): Promise<any> {
    const metrics = MetricsCollector.getInstance().getMetrics();
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB'
      },
      metrics,
      services: {
        database: await this.checkDatabase(),
        redis: await this.checkRedis(),
        external: await this.checkExternalServices()
      }
    };
  }
}

// Performance monitoring
export class PerformanceMonitor {
  static monitorRoutePerformance(req: any, res: any, next: any) {
    const startTime = Date.now();
    
    // Capture response finish
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const metrics = MetricsCollector.getInstance();
      
      // Record route performance
      metrics.increment(`route_${req.method.toLowerCase()}_${res.statusCode}`);
      metrics.set(`route_${req.method.toLowerCase()}_${res.statusCode}_duration`, duration);
      
      // Log slow requests
      if (duration > 1000) { // More than 1 second
        logger.warn('Slow request detected', {
          method: req.method,
          url: req.url,
          duration: `${duration}ms`,
          statusCode: res.statusCode
        });
      }
    });
    
    next();
  }
}