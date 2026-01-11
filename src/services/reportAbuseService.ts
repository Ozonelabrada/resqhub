import api from '../api/client';

export interface ReportAbuseRequest {
  userId: string;
  reason: string;
  details: string;
  reportId?: number | null;
  commentId?: number | null;
  status: 'Pending' | 'Under Review' | 'Resolved' | 'Rejected' | 'Closed';
}

export interface ReportAbuseResponse extends ReportAbuseRequest {
  id: number;
  dateCreated: string;
  report?: any; // The actual reported report object
  comment?: any; // The actual reported comment object
}

export const ReportAbuseService = {
  /**
   * Submit a new abuse report for an item or comment
   */
  async createReportAbuse(payload: Partial<ReportAbuseRequest>): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await api.post('/report-abuses/create', payload);
      return { 
        success: true, 
        data: response.data?.data || response.data 
      };
    } catch (error: any) {
      console.error('Error reporting abuse:', error);
      return { 
        success: false, 
        message: error?.response?.data?.message || 'Failed to submit report abuse' 
      };
    }
  },

  /**
   * Get all abuse reports (Admin functionality)
   */
  async getAllReports(params?: { status?: string, pageNumber?: number, pageSize?: number, communityId?: string | number }): Promise<ReportAbuseResponse[]> {
    try {
      const query = new URLSearchParams();
      if (params?.status) query.append('Status', params.status);
      if (params?.pageNumber) query.append('pageNumber', String(params.pageNumber));
      if (params?.pageSize) query.append('pageSize', String(params.pageSize));
      if (params?.communityId) query.append('communityId', String(params.communityId));

      const url = `/report-abuses/all${query.toString() ? '?' + query.toString() : ''}`;
      const response = await api.get(url);
      
      // Robust array extraction based on sample response
      const rawData = response.data;
      
      // Case 1: response.data.data.reportAbuses (Sample provided)
      if (rawData?.data?.reportAbuses && Array.isArray(rawData.data.reportAbuses)) {
        return rawData.data.reportAbuses;
      } 
      // Case 2: Standard response.data.data
      else if (rawData?.data && Array.isArray(rawData.data)) {
        return rawData.data;
      } 
      // Case 3: Flat array
      else if (Array.isArray(rawData)) {
        return rawData;
      } 
      // Case 4: Double nested (sometimes seen in paginated responses)
      else if (rawData?.data?.data && Array.isArray(rawData.data.data)) {
        return rawData.data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching abuse reports:', error);
      throw error; // Throw so the caller can handle it (and prevent empty state if it's an auth error)
    }
  },

  /**
   * Update the status of an abuse report (Admin functionality)
   */
  async updateStatus(id: number | string, status: ReportAbuseRequest['status']): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await api.put(`/report-abuses/${id}/status`, { status });
      return { 
        success: true, 
        data: response.data?.data || response.data 
      };
    } catch (error: any) {
      console.error('Error updating abuse report status:', error);
      return { 
        success: false, 
        message: error?.response?.data?.message || 'Failed to update status' 
      };
    }
  },

  /**
   * Fetch abuse reports associated with a specific report item
   */
  async getByReportId(reportId: number | string): Promise<ReportAbuseResponse[]> {
    try {
      const response = await api.get(`/report-abuses/report/${reportId}`);
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Error fetching abuse reports for item:', error);
      return [];
    }
  },

  /**
   * Fetch abuse reports associated with a specific comment
   */
  async getByCommentId(commentId: number | string): Promise<ReportAbuseResponse[]> {
    try {
      const response = await api.get(`/report-abuses/comment/${commentId}`);
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Error fetching abuse reports for comment:', error);
      return [];
    }
  }
};
