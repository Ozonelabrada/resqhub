// Optional: Auto-trigger trending calculation when new reports are submitted
import { useState } from 'react';
import { TrendingReportsService } from '../services/trendingReportsService';

export const useReportSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReport = async (reportData: any) => {
    try {
      setIsSubmitting(true);
      
      // Submit the report (your existing logic)
      // const result = await ReportsService.submitReport(reportData);
      
      // Silently trigger trending calculation in the background
      // Don't await this - let it run asynchronously
      TrendingReportsService.calculateTrendingReports().catch(err => 
        console.log('Background trending calculation failed:', err)
      );
      
      return true; // or return result
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