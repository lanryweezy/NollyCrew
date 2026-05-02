import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MetricsCollector, HealthChecker, PerformanceMonitor } from '../utils/monitoring.js';
import { logger } from '../utils/logger.js';
import { EventEmitter } from 'events';

vi.mock('../utils/logger.js', () => ({
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('MetricsCollector', () => {
  let metricsCollector: MetricsCollector;

  beforeEach(() => {
    metricsCollector = MetricsCollector.getInstance();
    metricsCollector.reset();
    vi.clearAllMocks();
  });

  it('should be a singleton', () => {
    const instance1 = MetricsCollector.getInstance();
    const instance2 = MetricsCollector.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should increment a metric', () => {
    metricsCollector.increment('test_counter');
    expect(metricsCollector.getMetrics().test_counter).toBe(1);

    metricsCollector.increment('test_counter', 5);
    expect(metricsCollector.getMetrics().test_counter).toBe(6);
  });

  it('should set a metric', () => {
    metricsCollector.set('test_gauge', 42);
    expect(metricsCollector.getMetrics().test_gauge).toBe(42);

    metricsCollector.set('test_gauge', 100);
    expect(metricsCollector.getMetrics().test_gauge).toBe(100);
  });

  it('should record timer duration', () => {
    vi.useFakeTimers();
    const startTime = 1000;
    vi.setSystemTime(startTime);

    metricsCollector.startTimer('test_timer');

    vi.advanceTimersByTime(500);
    const duration = metricsCollector.stopTimer('test_timer');

    expect(duration).toBe(500);
    expect(metricsCollector.getMetrics().timer_test_timer).toBe(500);
    vi.useRealTimers();
  });

  it('should return 0 and log warning if stopTimer is called for non-existent timer', () => {
    const duration = metricsCollector.stopTimer('non_existent');
    expect(duration).toBe(0);
    expect(logger.warn).toHaveBeenCalledWith('Timer not found', { name: 'non_existent' });
  });

  it('should return all metrics', () => {
    metricsCollector.increment('c1');
    metricsCollector.set('g1', 10);
    const metrics = metricsCollector.getMetrics();
    expect(metrics).toEqual({ c1: 1, g1: 10 });
  });

  it('should reset metrics and timers', () => {
    metricsCollector.increment('c1');
    metricsCollector.startTimer('t1');
    metricsCollector.reset();
    expect(metricsCollector.getMetrics()).toEqual({});

    // After reset, stopping the timer should fail because timers map was cleared
    const duration = metricsCollector.stopTimer('t1');
    expect(duration).toBe(0);
  });
});

describe('HealthChecker', () => {
  it('should return healthy for database check', async () => {
    const health = await HealthChecker.checkDatabase();
    expect(health).toEqual({ status: 'healthy' });
  });

  it('should return healthy for redis check', async () => {
    const health = await HealthChecker.checkRedis();
    expect(health).toEqual({ status: 'healthy' });
  });

  it('should return healthy for external services check', async () => {
    const health = await HealthChecker.checkExternalServices();
    expect(health).toEqual({ status: 'healthy' });
  });

  it('should return full system health', async () => {
    const health = await HealthChecker.getSystemHealth();
    expect(health.status).toBe('ok');
    expect(health.timestamp).toBeDefined();
    expect(health.uptime).toBeTypeOf('number');
    expect(health.memory).toBeDefined();
    expect(health.metrics).toBeDefined();
    expect(health.services).toBeDefined();
  });
});

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    MetricsCollector.getInstance().reset();
    vi.clearAllMocks();
  });

  it('should monitor route performance and record metrics', () => {
    const req = { method: 'GET', url: '/test' };
    const res = new EventEmitter() as any;
    res.statusCode = 200;
    const next = vi.fn();

    PerformanceMonitor.monitorRoutePerformance(req, res, next);
    expect(next).toHaveBeenCalled();

    // Simulate response finishing
    res.emit('finish');

    const metrics = MetricsCollector.getInstance().getMetrics();
    expect(metrics['route_get_200']).toBe(1);
    expect(metrics['route_get_200_duration']).toBeDefined();
  });

  it('should log warning for slow requests', () => {
    vi.useFakeTimers();
    const req = { method: 'GET', url: '/slow' };
    const res = new EventEmitter() as any;
    res.statusCode = 200;
    const next = vi.fn();

    PerformanceMonitor.monitorRoutePerformance(req, res, next);

    vi.advanceTimersByTime(1500); // 1.5 seconds

    res.emit('finish');

    expect(logger.warn).toHaveBeenCalledWith('Slow request detected', expect.objectContaining({
      method: 'GET',
      url: '/slow',
      statusCode: 200
    }));
    vi.useRealTimers();
  });
});
