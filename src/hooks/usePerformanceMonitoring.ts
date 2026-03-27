/**
 * usePerformanceMonitoring Hook
 * React hook for monitoring and optimizing PWA performance
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  PerformanceMonitor,
  getPerformanceMonitor,
  collectPerformanceMetrics,
  getOptimizationRecommendations,
  type PerformanceMetrics,
} from '@/pwa/performanceMonitoring';
import {
  testDeviceCapabilities,
  generateDiagnosticsReport,
  type DeviceCapabilityTest,
  type DiagnosticsReport,
} from '@/pwa/deviceTesting';

export interface UsePerformanceMonitoringReturn {
  metrics: PerformanceMetrics | null;
  averageMetrics: Partial<PerformanceMetrics>;
  isMonitoring: boolean;
  capabilities: DeviceCapabilityTest[];
  recommendations: string[];
  startMonitoring: (intervalMs?: number) => void;
  stopMonitoring: () => void;
  collectMetrics: () => Promise<void>;
  generateReport: () => Promise<DiagnosticsReport | null>;
  isLoading: boolean;
}

export function usePerformanceMonitoring(): UsePerformanceMonitoringReturn {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [averageMetrics, setAverageMetrics] = useState<Partial<PerformanceMetrics>>({});
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [capabilities, setCapabilities] = useState<DeviceCapabilityTest[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const monitorRef = useRef<PerformanceMonitor | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  /**
   * Initialize monitor
   */
  useEffect(() => {
    if (!monitorRef.current) {
      monitorRef.current = getPerformanceMonitor();
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  /**
   * Start monitoring
   */
  const startMonitoring = useCallback((intervalMs: number = 60000) => {
    if (!monitorRef.current) return;

    setIsMonitoring(true);

    // Subscribe to updates
    unsubscribeRef.current = monitorRef.current.onMetricsUpdate((newMetrics) => {
      setMetrics(newMetrics);
      setAverageMetrics(monitorRef.current?.getAverageMetrics() || {});
      setRecommendations(getOptimizationRecommendations(newMetrics));
    });

    monitorRef.current.startMonitoring(intervalMs);
  }, []);

  /**
   * Stop monitoring
   */
  const stopMonitoring = useCallback(() => {
    if (monitorRef.current) {
      monitorRef.current.stopMonitoring();
    }
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    setIsMonitoring(false);
  }, []);

  /**
   * Collect metrics immediately
   */
  const collectMetricsNow = useCallback(async () => {
    if (!monitorRef.current) return;
    setIsLoading(true);
    try {
      const newMetrics = await monitorRef.current.collectMetrics();
      setMetrics(newMetrics);
      setAverageMetrics(monitorRef.current.getAverageMetrics());
      setRecommendations(getOptimizationRecommendations(newMetrics));
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Generate diagnostics report
   */
  const generateReport = useCallback(async (): Promise<DiagnosticsReport | null> => {
    setIsLoading(true);
    try {
      const report = await generateDiagnosticsReport();
      return report;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load capabilities on mount
   */
  useEffect(() => {
    const loadCapabilities = async () => {
      setIsLoading(true);
      try {
        const tests = await testDeviceCapabilities();
        setCapabilities(tests);

        // Collect initial metrics
        const initialMetrics = await collectPerformanceMetrics();
        setMetrics(initialMetrics);
        setRecommendations(getOptimizationRecommendations(initialMetrics));
      } finally {
        setIsLoading(false);
      }
    };

    loadCapabilities();
  }, []);

  return {
    metrics,
    averageMetrics,
    isMonitoring,
    capabilities,
    recommendations,
    startMonitoring,
    stopMonitoring,
    collectMetrics: collectMetricsNow,
    generateReport,
    isLoading,
  };
}
