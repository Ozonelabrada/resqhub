import mainApiClient from '../api/client';
import type { TrendingReportItem } from '../types';

interface PaginatedTrendingReportsResponse {
  message: string;
  succeeded: boolean;
  statusCode: number;
  data: {
    pageSize: number;
    totalCount: number;
    totalPages: number;
    pageNumber: number;
    succeeded: boolean;
    items?: TrendingReportItem[]; // Could be 'items'
    results?: TrendingReportItem[]; // Could be 'results'
    data?: TrendingReportItem[]; // Could be 'data'
    trendingReports?: TrendingReportItem[]; // Could be 'trendingReports'
    [key: string]: any; // Allow for other possible property names
  };
  errors: any;
  baseEntity: any;
}

export class TrendingReportsService {
  static async getTrendingReports(): Promise<TrendingReportItem[]> {
    try {
      const response = await mainApiClient.request<PaginatedTrendingReportsResponse>({
        url: '/trending-reports/all'
      });
      
      console.log('Trending reports API response received');
      
      const responseData = response.data;
      if (responseData.succeeded && responseData.data) {
        const data = responseData.data;
        
        // Check various possible property names for the trending reports array
        const possibleArrayProperties = [
          'items',
          'results', 
          'data',
          'trendingReports',
          'reports',
          'list'
        ];
        
        for (const prop of possibleArrayProperties) {
          if (data[prop] && Array.isArray(data[prop])) {
            console.log(`Found trending reports in property: ${prop}`, data[prop]);
            return data[prop];
          }
        }
        
        // If no array found in known properties, check all properties
        const allKeys = Object.keys(data);
        for (const key of allKeys) {
          if (Array.isArray(data[key]) && data[key].length > 0) {
            // Check if the first item looks like a trending report
            const firstItem = data[key][0];
            if (firstItem && typeof firstItem === 'object' && 
                ('title' in firstItem || 'category' in firstItem || 'reports' in firstItem)) {
              console.log(`Found trending reports in property: ${key}`, data[key]);
              return data[key];
            }
          }
        }
        
        // If totalCount is 0, return empty array (no data available)
        if (data.totalCount === 0) {
          console.log('No trending reports available - totalCount is 0');
          return [];
        }
        
        // Log the data structure for debugging
        console.warn('Could not find trending reports array in response data:', data);
        console.log('Available properties:', Object.keys(data));
      }
      
      // If we reach here, the data structure is unexpected
      throw new Error('No trending reports found in API response');
      
    } catch (error) {
      console.error('Error fetching trending reports:', error);
      throw error;
    }
  }

  static getFallbackTrendingReports(): TrendingReportItem[] {
    return [
      { 
        title: 'AirPods Pro', 
        organizationId: 1,
        category: 'Electronics', 
        categoryId: 1,
        reports: 23, 
        trend: '+15%',
        weeklyData: [8, 12, 15, 18, 20, 22, 23], // Last 7 days
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      { 
        title: 'House Keys', 
        organizationId: 1,
        category: 'Keys',
        categoryId: 2,
        reports: 18, 
        trend: '+8%',
        weeklyData: [10, 11, 13, 14, 15, 17, 18],
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      { 
        title: 'Wallet', 
        organizationId: 1,
        category: 'Accessories',
        categoryId: 3,
        reports: 15, 
        trend: '+12%',
        weeklyData: [6, 8, 10, 11, 12, 14, 15],
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      { 
        title: 'Phone Charger', 
        organizationId: 1,
        category: 'Electronics',
        categoryId: 1,
        reports: 12, 
        trend: '+5%',
        weeklyData: [9, 10, 10, 11, 11, 12, 12],
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      }
    ];
  }

  /**
   * Calculate/update trending reports (Admin action)
   */
  static async calculateTrendingReports(): Promise<void> {
    try {
      const response = await mainApiClient.request<{
        message: string;
        succeeded: boolean;
        statusCode: number;
      }>({
        url: '/trending-reports/calculate',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.data.succeeded) {
        throw new Error(response.data.message || 'Failed to calculate trending reports');
      }
      
      console.log('Trending reports calculation triggered successfully');
    } catch (error) {
      console.error('Error calculating trending reports:', error);
      throw error;
    }
  }
}

// Export type for external use
export type { TrendingReportItem };