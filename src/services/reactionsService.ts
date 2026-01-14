import api from '../api/client';

export type ReactionAction = 'heart' | 'like' | 'helpful';

export const ReactionsService = {
  /**
   * Adds a reaction to a report
   */
  async addReportReaction(reportId: number, userId: string, action: ReactionAction = 'heart'): Promise<void> {
    try {
      await api.post(`/report-reactions/report/${reportId}/actions`, { action }, {
        params: { userId }
      });
    } catch (error) {
      console.error('Error adding report reaction:', error);
      throw error;
    }
  },

  /**
   * Removes a reaction from a report
   */
  async removeReportReaction(reportId: number, userId: string): Promise<void> {
    try {
      await api.delete(`/report-reactions/report/${reportId}`, {
        params: { userId }
      });
    } catch (error) {
      console.error('Error removing report reaction:', error);
      throw error;
    }
  },

  /**
   * Adds a reaction to a comment or reply
   */
  async addCommentReaction(commentId: number, userId: string, action: ReactionAction = 'heart'): Promise<void> {
    try {
      await api.post(`/report-reactions/comment/${commentId}/actions`, { action }, {
        params: { userId }
      });
    } catch (error) {
      console.error('Error adding comment reaction:', error);
      throw error;
    }
  },

  /**
   * Removes a reaction from a comment or reply
   */
  async removeCommentReaction(commentId: number, userId: string): Promise<void> {
    try {
      await api.delete(`/report-reactions/comment/${commentId}`, {
        params: { userId }
      });
    } catch (error) {
      console.error('Error removing comment reaction:', error);
      throw error;
    }
  }
};
