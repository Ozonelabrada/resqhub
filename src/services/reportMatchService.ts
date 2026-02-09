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
  actedByUser?: any;
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
   * Calls POST /report-matches/confirm with reportId and matchReportId
   */
  async createMatch(sourceReportId: number | string, targetReportId: number | string, notes: string = ''): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await api.post('/report-matches/confirm', {
        reportId: Number(sourceReportId),
        matchReportId: Number(targetReportId),
        notes: notes || 'Match initiated'
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
   * Get match suggestions/details for a specific match
   * @param matchId The ID of the match to get details/suggestions for
   */
  async getMatchesForReportRecord(matchId: number | string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await api.get(`/report-matches/${matchId}`);

      // The backend returns a wrapped data object as shown in the example
      const data = response.data?.data || response.data;
      return { success: true, data };
    } catch (error: any) {
      console.error('Error fetching match details:', error);
      return { 
        success: false, 
        message: error?.response?.data?.message || 'Failed to fetch match details' 
      };
    }
  },

  /**
   * Fetch a specific match by ID
   * @param matchId The ID of the match to retrieve
   */
  async getMatchById(matchId: number | string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await api.get(`/report-matches/${matchId}`);
      const data = response.data?.data || response.data;
      return { success: true, data };
    } catch (error: any) {
      console.error('Error fetching match by ID:', error);
      return { 
        success: false, 
        message: error?.response?.data?.message || 'Failed to fetch match details' 
      };
    }
  }
};
