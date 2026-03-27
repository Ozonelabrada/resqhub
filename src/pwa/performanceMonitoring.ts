/**
 * Performance Monitoring & Optimization
 * Tracks metrics for PWA performance optimization
 */

export interface PerformanceMetrics {
  // Core Web Vitals
  largestContentfulPaint: number | null;
  firstInputDelay: number | null;
  cumulativeLayoutShift: number | null;

  // Navigation timing
  pageLoadTime: number;
  firstPaint: number | null;
  firstContentfulPaint: number | null;
  domContentLoaded: number;
  resourceLoadTime: number;

  // Memory and battery
  memoryUsage: number | null;
  batteryLevel: number | null;
  batteryCharging: boolean | null;
  isLowPowerMode: boolean;

  // Network
  effectiveNetworkType: string;
  downlinkMbps: number | null;
  roundTripTime: number | null;
  connectionType: string;

  // Custom metrics
  serviceWorkerInitTime: number | null;
  cacheHitRate: number | null;
  offlineActionCount: number | null;
  timestamp: number;
}

/**
 * Collect performance metrics
 */
export async function collectPerformanceMetrics(): Promise<PerformanceMetrics> {
  // Get navigation timing
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const pageLoadTime = nav ? nav.loadEventEnd - nav.fetchStart : 0;
  const domContentLoaded = nav ? nav.domContentLoadedEventEnd - nav.fetchStart : 0;
  const resourceLoadTime = nav ? nav.loadEventEnd - nav.domContentLoadedEventEnd : 0;

  // Get paint entries
  const paintEntries = performance.getEntriesByType('paint');
  const firstPaint = paintEntries.find((e) => e.name === 'first-paint')?.startTime || null;
  const firstContentfulPaint = paintEntries.find((e) => e.name === 'first-contentful-paint')?.startTime || null;

  // Get Core Web Vitals
  let largestContentfulPaint: number | null = null;
  let firstInputDelay: number | null = null;
  let cumulativeLayoutShift: number | null = null;

  try {
    if ('PerformanceObserver' in window) {
      // LCP
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      if (lcpEntries.length > 0) {
        largestContentfulPaint = lcpEntries[lcpEntries.length - 1].startTime;
      }

      // CLS
      const clsEntries = performance.getEntriesByType('layout-shift');
      if (clsEntries.length > 0) {
        cumulativeLayoutShift = clsEntries.reduce((acc, entry: any) => {
          return entry.hadRecentInput ? acc : acc + entry.value;
        }, 0);
      }
    }
  } catch (error) {
    console.warn('Error collecting Core Web Vitals:', error);
  }

  // Get memory usage
  let memoryUsage: number | null = null;
  if ((performance as any).memory) {
    memoryUsage = (performance as any).memory.usedJSHeapSize / 1048576; // Convert to MB
  }

  // Get battery status
  let batteryLevel: number | null = null;
  let batteryCharging: boolean | null = null;

  try {
    if ('getBattery' in navigator) {
      const battery = await (navigator as any).getBattery();
      batteryLevel = battery.level * 100;
      batteryCharging = battery.charging;
    }
  } catch (error) {
    // Battery API not available
  }

  // Get network info
  const connection = (navigator as any).connection || (navigator as any).mozConnection;
  const effectiveNetworkType = connection?.effectiveType || 'unknown';
  const downlinkMbps = connection?.downlink || null;
  const roundTripTime = connection?.rtt || null;
  const connectionType = connection?.type || 'unknown';

  return {
    largestContentfulPaint,
    firstInputDelay,
    cumulativeLayoutShift,
    pageLoadTime,
    firstPaint: firstPaint || null,
    firstContentfulPaint: firstContentfulPaint || null,
    domContentLoaded,
    resourceLoadTime,
    memoryUsage,
    batteryLevel,
    batteryCharging,
    isLowPowerMode: (navigator as any).deviceMemory ? (navigator as any).deviceMemory < 4 : false,
    effectiveNetworkType,
    downlinkMbps,
    roundTripTime,
    connectionType,
    serviceWorkerInitTime: null,
    cacheHitRate: null,
    offlineActionCount: null,
    timestamp: Date.now(),
  };
}

/**
 * Monitor performance continuously
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private updateInterval: NodeJS.Timeout | null = null;
  private observers: Set<(metrics: PerformanceMetrics) => void> = new Set();

  /**
   * Start monitoring performance
   */
  public startMonitoring(intervalMs: number = 60000): void {
    if (this.updateInterval) {
      console.log('Already monitoring performance');
      return;
    }

    console.log(`📊 Starting performance monitoring (interval: ${intervalMs}ms)`);

    this.updateInterval = setInterval(async () => {
      const metrics = await collectPerformanceMetrics();
      this.metrics.push(metrics);

      // Keep only last 100 metrics
      if (this.metrics.length > 100) {
        this.metrics.shift();
      }

      // Notify observers
      this.observers.forEach((observer) => {
        try {
          observer(metrics);
        } catch (error) {
          console.error('Error in performance observer:', error);
        }
      });

      // Log if metrics are concerning
      this.checkMetricThresholds(metrics);
    }, intervalMs);

    // Collect initial metrics
    this.collectMetrics();
  }

  /**
   * Stop monitoring
   */
  public stopMonitoring(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('⏹️  Performance monitoring stopped');
    }
  }

  /**
   * Collect metrics immediately
   */
  public async collectMetrics(): Promise<PerformanceMetrics> {
    const metrics = await collectPerformanceMetrics();
    this.metrics.push(metrics);
    return metrics;
  }

  /**
   * Get all metrics
   */
  public getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get average metrics
   */
  public getAverageMetrics(): Partial<PerformanceMetrics> {
    if (this.metrics.length === 0) return {};

    const keys = Object.keys(this.metrics[0]) as (keyof PerformanceMetrics)[];
    const averages: any = {};

    keys.forEach((key) => {
      const values = this.metrics
        .map((m) => m[key])
        .filter((v) => typeof v === 'number' && !Number.isNaN(v)) as number[];

      if (values.length > 0) {
        averages[key] = values.reduce((a, b) => a + b, 0) / values.length;
      }
    });

    return averages;
  }

  /**
   * Subscribe to metrics updates
   */
  public onMetricsUpdate(observer: (metrics: PerformanceMetrics) => void): () => void {
    this.observers.add(observer);

    // Return unsubscribe function
    return () => {
      this.observers.delete(observer);
    };
  }

  /**
   * Check metric thresholds and warn
   */
  private checkMetricThresholds(metrics: PerformanceMetrics): void {
    const warnings: string[] = [];

    // LCP threshold: 2.5s
    if (metrics.largestContentfulPaint && metrics.largestContentfulPaint > 2500) {
      warnings.push(
        `⚠️ LCP above threshold: ${metrics.largestContentfulPaint.toFixed(0)}ms (target: <2500ms)`,
      );
    }

    // FID threshold: 100ms
    if (metrics.firstInputDelay && metrics.firstInputDelay > 100) {
      warnings.push(
        `⚠️ FID above threshold: ${metrics.firstInputDelay.toFixed(0)}ms (target: <100ms)`,
      );
    }

    // CLS threshold: 0.1
    if (metrics.cumulativeLayoutShift && metrics.cumulativeLayoutShift > 0.1) {
      warnings.push(
        `⚠️ CLS above threshold: ${metrics.cumulativeLayoutShift.toFixed(3)} (target: <0.1)`,
      );
    }

    // Memory threshold: 100MB
    if (metrics.memoryUsage && metrics.memoryUsage > 100) {
      warnings.push(
        `⚠️ High memory usage: ${metrics.memoryUsage.toFixed(1)}MB (target: <100MB)`,
      );
    }

    // Page load time threshold: 3s
    if (metrics.pageLoadTime > 3000) {
      warnings.push(
        `⚠️ Slow page load: ${metrics.pageLoadTime.toFixed(0)}ms (target: <3000ms)`,
      );
    }

    // Battery low
    if (metrics.batteryLevel && metrics.batteryLevel < 20 && !metrics.batteryCharging) {
      warnings.push(
        `⚠️ Low battery: ${metrics.batteryLevel.toFixed(0)}% (not charging)`,
      );
    }

    if (warnings.length > 0) {
      console.warn('Performance Issues Detected:');
      warnings.forEach((w) => console.warn(w));
    }
  }

  /**
   * Export metrics report
   */
  public exportReport(): {
    metrics: PerformanceMetrics[];
    averages: Partial<PerformanceMetrics>;
    timestamp: number;
  } {
    return {
      metrics: this.getMetrics(),
      averages: this.getAverageMetrics(),
      timestamp: Date.now(),
    };
  }

  /**
   * Get report as CSV
   */
  public exportAsCSV(): string {
    if (this.metrics.length === 0) return '';

    const headers = Object.keys(this.metrics[0]).join(',');
    const rows = this.metrics
      .map((m) => {
        return Object.values(m)
          .map((v) => {
            if (v === null) return '';
            if (typeof v === 'object') return JSON.stringify(v);
            return v;
          })
          .join(',');
      })
      .join('\n');

    return `${headers}\n${rows}`;
  }
}

/**
 * Global performance monitor instance
 */
let globalMonitor: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!globalMonitor) {
    globalMonitor = new PerformanceMonitor();
  }
  return globalMonitor;
}

/**
 * Recommendations based on metrics
 */
export function getOptimizationRecommendations(metrics: PerformanceMetrics): string[] {
  const recommendations: string[] = [];

  if (metrics.largestContentfulPaint && metrics.largestContentfulPaint > 2500) {
    recommendations.push('• Optimize LCP: Preload critical resources, minimize main bundle');
  }

  if (metrics.pageLoadTime > 3000) {
    recommendations.push('• Slow page load: Enable code splitting, lazy load non-critical code');
  }

  if (metrics.cumulativeLayoutShift && metrics.cumulativeLayoutShift > 0.1) {
    recommendations.push('• Layout shifts detected: Use fixed dimensions for images/ads');
  }

  if (metrics.memoryUsage && metrics.memoryUsage > 100) {
    recommendations.push('• High memory usage: Check for memory leaks, unsubscribe from events');
  }

  if (metrics.downlinkMbps && metrics.downlinkMbps < 1) {
    recommendations.push('• Slow network: Enable aggressive caching, compress resources');
  }

  if (metrics.batteryLevel && metrics.batteryLevel < 20) {
    recommendations.push('• Low battery: Stop background sync, reduce polling frequency');
  }

  if (recommendations.length === 0) {
    recommendations.push('✓ Performance metrics are healthy!');
  }

  return recommendations;
}
