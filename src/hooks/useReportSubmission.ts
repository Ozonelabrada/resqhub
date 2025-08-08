// Optional: Auto-trigger trending calculation when new reports are submitted
import { useState } from 'react';
import { TrendingReportsService } from '../services/trendingReportsService';

// Make sure to update the usage below if you change the import name

export const useReportSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReport = async (_reportData: any) => {
    try {
      setIsSubmitting(true);
      
      
      // Silently trigger trending calculation in the background
      // Don't await this - let it run asynchronously
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