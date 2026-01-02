import  mainApiClient  from '../api/client';
import type { StatisticsResponse, StatisticsData } from '../types';

export class StatisticsService {
  static async getStatistics(): Promise<StatisticsData> {
    try {
      const response = await mainApiClient.request<StatisticsResponse>({ url: '/statistics' });
      const responseData = response.data;
      
      if (!responseData.succeeded) {
        throw new Error(responseData.message || 'Failed to fetch statistics');
      }
      
      return responseData.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }

  static async getLocationStats(cityId: number): Promise<any> {
    try {
      return await mainApiClient.request({ url: `/statistics/city/${cityId}` });
    } catch (error) {
      console.error('Error fetching location stats:', error);
      throw error;
    }
  }

  static getFallbackStatistics(): StatisticsData {
    return {
      id: 0,
      statDate: new Date().toISOString(),
      totalItems: 1247,
      successfulMatches: 342,
      activeReports: 905,
      citiesCovered: 25,
      newUsersToday: 12,
      itemsReportedToday: 8,
      matchesMadeToday: 3,
      totalUsers: 5420,
      lostItemsCount: 623,
      foundItemsCount: 624,
      pendingReports: 156,
      verifiedReports: 1091,
      averageMatchTimeHours: 18.5,
      totalRewardAmount: 12450.00,
      mostActiveCity: 'New York',
      calculatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      successRate: 27.4,
      averageMatchTimeFormatted: '18.5 hours',
      totalRewardFormatted: '$12,450.00'
    };
  }
}

// Export type for external use
export type { StatisticsData };