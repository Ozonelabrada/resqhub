// Optional: Auto-trigger trending calculation when new reports are submitted
import { useState } from 'react';
import { TrendingReportsService } from '../services/trendingReportsService';

// Example 2: If the correct named export is 'ReportService' and it has submitReport
// Update the import path to match the actual file name and location
// For example, if the file is named 'reportservice.ts' (all lowercase), use:
// Use the correct import based on your actual file name and location:
// Update the import path and casing to match your actual file name
// Update the import below to match the actual export from userService.ts
import { ReportsService } from '../services/itemsService';
// Make sure the file exists at the specified path and the export is correct

// Make sure to update the usage below if you change the import name

export const useReportSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReport = async (reportData: any) => {
    try {
      setIsSubmitting(true);
      
      // Submit the report (your existing logic)
      const result = await ReportsService.submitReport(reportData);
      
      // Silently trigger trending calculation in the background
      // Don't await this - let it run asynchronously
      TrendingReportsService.calculateTrendingReports().catch(err => 
        console.log('Background trending calculation failed:', err)
      );
      
      return result;
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