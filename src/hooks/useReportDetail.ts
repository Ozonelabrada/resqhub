import { useState, useEffect, useCallback } from 'react';
import { ReportsService } from '@/services/reportsService';
import type { Report } from '@/types/items';

export interface UseReportDetailReturn {
  report: Report | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useReportDetail = (id: string | number | undefined): UseReportDetailReturn => {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await ReportsService.getReportById(id);
      if (data) {
        setReport(data as unknown as Report);
      } else {
        setError('Report not found');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch report detail';
      setError(message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return {
    report,
    loading,
    error,
    refetch: fetchReport
  };
};
