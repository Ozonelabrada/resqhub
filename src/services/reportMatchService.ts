import api from '../api/client';

export interface ReportMatchStatusRequest {
  id: number;
  status: 'suggested' | 'confirmed' | 'resolved' | 'dismissed' | 'expired' | string;
  notes: string;
  rejectionReason?: string;
  reasonDetails?: string;
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
  async updateMatchStatus(matchId: number | string, status: 'confirmed' | 'resolved' | 'dismissed' | string, notes: string = '', rejectionReason?: string, reasonDetails?: string): Promise<{ success: boolean; message?: string }> {
    try {
      const payload: ReportMatchStatusRequest = {
        id: Number(matchId),
        status,
        notes,
        rejectionReason,
        reasonDetails
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
   * Rejects a match with a specific reason
   * Captures rejection reason and tracks for analytics
   */
  async rejectMatchWithReason(
    matchId: number | string,
    rejectionReason: string,
    reasonDetails?: string
  ): Promise<{ success: boolean; message?: string; reasonCaptured?: boolean }> {
    try {
      // Combine reason and details into notes field
      const notes = reasonDetails ? `${rejectionReason}: ${reasonDetails}` : rejectionReason;
      
      const response = await api.patch(`/report-matches/${matchId}/status`, {
        status: 'dismissed',
        notes: notes
      });
      return {
        success: true,
        reasonCaptured: true,
        message: response.data?.message
      };
    } catch (error: any) {
      console.error('Error rejecting match with reason:', error);
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to reject match',
        reasonCaptured: false
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
  },

  /**
   * Confirm handover for a match in confirmed status
   * @param matchId The ID of the match
   * @param userRole Either 'source' or 'target' indicating which user is confirming
   */
  async confirmHandover(matchId: number | string, userRole: 'source' | 'target'): Promise<{ success: boolean; message?: string; data?: any }> {
    try {
      const response = await api.patch(`/report-matches/${matchId}/handover-confirm`, {
        userRole,
        confirmedAt: new Date().toISOString()
      });
      return { 
        success: true, 
        data: response.data?.data,
        message: response.data?.message
      };
    } catch (error: any) {
      console.error('Error confirming handover:', error);
      return { 
        success: false, 
        message: error?.response?.data?.message || 'Failed to confirm handover' 
      };
    }
  },

  /**
   * Get rejection statistics for a user
   * Tracks rejection patterns and flags users with suspicious behavior
   */
  async getUserRejectionStats(userId: string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await api.get(`/report-matches/analytics/user-rejections/${userId}`);
      return {
        success: true,
        data: response.data?.data || response.data
      };
    } catch (error: any) {
      console.error('Error fetching user rejection stats:', error);
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch rejection stats'
      };
    }
  },

  /**
   * Get all rejected matches with reasons
   * Used for admin analytics dashboard
   */
  async getRejectionAnalytics(filters?: { userId?: string; reason?: string; startDate?: Date; endDate?: Date }): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const params = new URLSearchParams();
      if (filters?.userId) params.append('userId', filters.userId);
      if (filters?.reason) params.append('reason', filters.reason);
      if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());

      const response = await api.get(`/report-matches/analytics/rejections?${params.toString()}`);
      return {
        success: true,
        data: response.data?.data || response.data
      };
    } catch (error: any) {
      console.error('Error fetching rejection analytics:', error);
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch rejection analytics'
      };
    }
  },

  /**
   * Flag a user for suspicious rejection pattern (3+ rejections)
   */
  async flagUserForSuspiciousBehavior(userId: string, reason: string): Promise<{ success: boolean; message?: string }> {
    try {
      await api.post(`/report-matches/analytics/flag-user`, {
        userId,
        reason,
        flaggedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error flagging user:', error);
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to flag user'
      };
    }
  },

  /**
   * Verify ownership by answering a security question
   * @param matchId The ID of the match
   * @param answer The user's answer to the security question
   */
  async verifyOwnership(matchId: number | string, answer: string): Promise<{ success: boolean; isCorrect?: boolean; attemptsRemaining?: number; message?: string }> {
    try {
      const response = await api.post(`/report-matches/${matchId}/verify-ownership`, {
        answer: answer.trim().toLowerCase(),
        attemptedAt: new Date().toISOString()
      });

      return {
        success: true,
        isCorrect: response.data?.data?.isCorrect,
        attemptsRemaining: response.data?.data?.attemptsRemaining,
        message: response.data?.message
      };
    } catch (error: any) {
      console.error('Error verifying ownership:', error);
      return {
        success: false,
        isCorrect: false,
        attemptsRemaining: error?.response?.data?.attemptsRemaining,
        message: error?.response?.data?.message || 'Verification failed'
      };
    }
  },

  /**
   * Get next security question for a match
   * Returns only the question, never the answer
   */
  async getNextSecurityQuestion(matchId: number | string): Promise<{ success: boolean; data?: { questionId: string; questionText: string; attemptNumber: number }; message?: string }> {
    try {
      const response = await api.get(`/report-matches/${matchId}/security-question`);
      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message
      };
    } catch (error: any) {
      console.error('Error getting security question:', error);
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to get security question'
      };
    }
  },

  /**
   * Dismiss match due to failed ownership verification (3 attempts)
   */
  async dismissMatchDueToVerificationFailure(matchId: number | string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await api.patch(`/report-matches/${matchId}/status`, {
        status: 'dismissed',
        notes: 'Ownership verification failed - max attempts exceeded'
      });
      return {
        success: true,
        message: 'Match dismissed due to failed ownership verification'
      };
    } catch (error: any) {
      console.error('Error dismissing match:', error);
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to dismiss match'
      };
    }
  }
};
