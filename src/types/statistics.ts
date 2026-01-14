import { BaseApiResponse } from '../api/types';

export interface StatisticsData {
  id: number;
  statDate: string;
  totalItems: number;
  successfulMatches: number;
  activeReports: number;
  citiesCovered: number;
  newUsersToday: number;
  itemsReportedToday: number;
  matchesMadeToday: number;
  totalUsers: number;
  lostItemsCount: number;
  foundItemsCount: number;
  pendingReports: number;
  verifiedReports: number;
  averageMatchTimeHours: number;
  totalRewardAmount: number;
  mostActiveCity: string | null;
  calculatedAt: string;
  createdAt: string;
  successRate: number;
  averageMatchTimeFormatted: string;
  totalRewardFormatted: string;
}

// Statistics API response
export interface StatisticsResponse extends BaseApiResponse {
  data: StatisticsData;
}
