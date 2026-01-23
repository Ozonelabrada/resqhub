import api from '../api/client';

export interface ReportMatchStatusRequest {
  id: number;
  status: 'confirmed' | 'resolved' | string;
  notes: string;
}

export interface ReportMatchData {
  id: number;
  sourceReportId: number;
  targetReportId: number;
  status: string;
  sourceReport?: any;
  targetReport?: any;
  initiator?: any;
}

export const ReportMatchService = {
  /**
   * Fetches existing matches for a specific report
   * @param reportId The ID of the report to check for matches
   */
  async getMatchesForReport(reportId: number | string): Promise<{ success: boolean; data?: ReportMatchData[]; message?: string }> {
    try {
      const response = await api.get(`/report-matches`, {
        params: {
          reportId: Number(reportId),
          limit: 50,
          page: 1,
          pageSize: 10
        }
      });
      return { 
        success: true, 
        data: response.data?.data || response.data?.matches || [] 
      };
    } catch (error: any) {
      console.error('Error fetching report matches:', error);
      return { 
        success: false, 
        message: error?.response?.data?.message || 'Failed to fetch matches' 
      };
    }
  },

  /**
   * Updates the status of a report match
   * @param matchId The ID of the match record
   * @param payload The status update payload
   */
  async updateMatchStatus(matchId: number | string, status: 'confirmed' | 'resolved' | string, notes: string = ''): Promise<{ success: boolean; message?: string }> {
    try {
      const payload: ReportMatchStatusRequest = {
        id: Number(matchId),
        status,
        notes
      };
      
      await api.patch(`/report-matches/${matchId}/status`, payload);
      return { success: true };
    } catch (error: any) {
      console.error('Error updating match status:', error);
      return { 
        success: false, 
        message: error?.response?.data?.message || 'Failed to update match status' 
      };
    }
  },

  /**
   * Initiates a match between two reports
   * backend may have a POST /report-matches endpoint
   */
  async createMatch(sourceReportId: number | string, targetReportId: number | string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await api.post('/report-matches', {
        sourceReportId: Number(sourceReportId),
        targetReportId: Number(targetReportId)
      });
      return { success: true, data: response.data?.data };
    } catch (error: any) {
      console.error('Error creating report match:', error);
      return { 
        success: false, 
        message: error?.response?.data?.message || 'Failed to initiate match' 
      };
    }
  },

  /**
   * Get matches for a specific report and check for confirmed matches
   * @param reportId The ID of the report to check
   */
  async getMatchesForReportRecord(reportId: number | string, page: number = 1, limit: number = 10, pageSize: number = 10): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await api.get(`/report-matches/reports/${reportId}`, {
        params: {
          page,
          limit,
          pageSize
        }
      });

      // The backend returns a wrapped data object as shown in the example
      const data = response.data?.data || response.data;
      return { success: true, data };
    } catch (error: any) {
      console.error('Error fetching report-specific matches:', error);
      return { 
        success: false, 
        message: error?.response?.data?.message || 'Failed to fetch report matches' 
      };
    }
  }
};
