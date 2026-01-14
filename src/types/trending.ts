import { BaseApiResponse } from '../api/types';

export interface TrendingReportItem {
  title: string;
  organizationId: number;
  category: string;
  reports: number;
  trend: string;
  weeklyData: number[];
  labels: string[];
  categoryId: number;
}

// Updated to match actual API response structure
export interface TrendingReportsResponse extends BaseApiResponse {
  data: {
    pageSize: number;
    totalCount: number;
    totalPages: number;
    pageNumber: number;
    succeeded: boolean;
    items?: TrendingReportItem[]; // The actual trending reports might be in 'items'
    results?: TrendingReportItem[]; // Or in 'results'
    data?: TrendingReportItem[]; // Or nested in another 'data' property
    trendingReports?: TrendingReportItem[]; // Or in 'trendingReports'
    [key: string]: any; // Allow for flexibility in property names
  };
  errors: any;
  baseEntity: any;
}
