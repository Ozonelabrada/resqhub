import api from '../api/client';

export interface CommunityReportPayload {
  title: string;
  description: string;
  startDate: string; // ISO 8601 date string
  endDate: string; // ISO 8601 date string
  reportUrl?: string;
  category: string;
  type: string; // 'News' | 'Announcement' | 'Event' | etc.
  location: string;
  contactInfo: string;
  communityId: number | string;
  privacy?: 'community' | 'internal';
}

export interface CommunityReportResponse {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  reportUrl?: string;
  category: string;
  type: string;
  location: string;
  contactInfo: string;
  communityId: number;
  privacy?: 'community' | 'internal';
  createdAt: string;
  createdBy?: {
    id: string;
    name: string;
    username: string;
  };
}

export const CommunityReportService = {
  /**
   * Create a new community report with the specified payload
   * @param payload - The community report data
   * @returns Promise with success status and response data
   */
  async createCommunityReport(
    payload: CommunityReportPayload
  ): Promise<{ success: boolean; data?: CommunityReportResponse; message?: string }> {
    try {
      const response = await api.post('/reports/communities', payload);
      return {
        success: true,
        data: response.data?.data || response.data
      };
    } catch (error: any) {
      console.error('Error creating community report:', error);
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to create community report'
      };
    }
  },

  /**
   * Get community reports by community ID
   * @param communityId - The community ID
   * @param params - Optional query parameters (page, limit, type, etc.)
   * @returns Promise with array of community reports
   */
  async getCommunityReports(
    communityId: string | number,
    params?: { pageNumber?: number; pageSize?: number; type?: string }
  ): Promise<CommunityReportResponse[]> {
    try {
      const query = new URLSearchParams();
      if (params?.pageNumber) query.append('pageNumber', String(params.pageNumber));
      if (params?.pageSize) query.append('pageSize', String(params.pageSize));
      if (params?.type) query.append('type', params.type);

      const url = `/reports/communities/${communityId}${query.toString() ? '?' + query.toString() : ''}`;
      const response = await api.get<{ data: CommunityReportResponse[] }>(url);
      
      const data = response.data?.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching community reports:', error);
      return [];
    }
  },

  /**
   * Get a single community report by ID
   * @param reportId - The report ID
   * @returns Promise with the community report
   */
  async getCommunityReportById(reportId: string | number): Promise<CommunityReportResponse | null> {
    try {
      const response = await api.get<{ data: CommunityReportResponse }>(`/reports/communities/${reportId}`);
      return response.data?.data || null;
    } catch (error) {
      console.error('Error fetching community report:', error);
      return null;
    }
  },

  /**
   * Update a community report
   * @param reportId - The report ID
   * @param payload - Partial data to update
   * @returns Promise with success status
   */
  async updateCommunityReport(
    reportId: string | number,
    payload: Partial<CommunityReportPayload>
  ): Promise<{ success: boolean; data?: CommunityReportResponse; message?: string }> {
    try {
      const response = await api.put(`/reports/communities/${reportId}`, payload);
      return {
        success: true,
        data: response.data?.data || response.data
      };
    } catch (error: any) {
      console.error('Error updating community report:', error);
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to update community report'
      };
    }
  },

  /**
   * Delete a community report
   * @param reportId - The report ID
   * @returns Promise with success status
   */
  async deleteCommunityReport(reportId: string | number): Promise<{ success: boolean; message?: string }> {
    try {
      await api.delete(`/reports/communities/${reportId}`);
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting community report:', error);
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to delete community report'
      };
    }
  }
};
