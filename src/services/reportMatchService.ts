import api from '../api/client';

export interface ReportMatchStatusRequest {
  id: number;
  status: 'confirmed' | 'resolved' | string;
  notes: string;
}

export const ReportMatchService = {
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
  }
};
