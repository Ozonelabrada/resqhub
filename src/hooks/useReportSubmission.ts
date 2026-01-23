// Optional: Auto-trigger trending calculation when new reports are submitted
import { useState } from 'react';
import type { LostFoundItem } from '../types';
import { ItemsService } from '../services/itemsService';
import { TrendingReportsService } from '../services/trendingReportsService';

export const useReportSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReport = async (reportData: Partial<LostFoundItem>): Promise<void> => {
    try {
      setIsSubmitting(true);

      // Submit the report to the backend
      await ItemsService.createReport(reportData);

      // Silently trigger trending calculation in the background
      TrendingReportsService.calculateTrendingReports().catch(err =>
        console.log('Background trending calculation failed:', err)
      );
    } catch (error) {
      console.error('Failed to submit report:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitReport,
    isSubmitting
  };
};