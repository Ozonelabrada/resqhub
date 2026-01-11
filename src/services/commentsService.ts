import api from '../api/client';
import type { BaseApiResponse } from '../api/types';

export interface Comment {
  id: number;
  reportId: number;
  userId: string;
  comment: string;
  parentCommentId: number | null;
  isEdited: boolean;
  user: {
    fullName: string;
    profilePicture?: string;
    username: string;
  } | null;
  replies: Comment[];
  dateCreated: string;
  lastModifiedDate: string;
  reactionsCount?: number;
  isReacted?: boolean;
  isAbusive?: boolean;
}

export interface PaginatedCommentsData {
  pageSize: number;
  totalCount: number;
  totalPages: number;
  pageNumber: number;
  succeeded: boolean;
  data: Comment[];
  loadMore: boolean;
}

export interface CommentsResponse extends BaseApiResponse {
  data: PaginatedCommentsData;
}

export interface CommentResponse extends BaseApiResponse {
  data: Comment;
}

export interface GetCommentsResult {
  comments: Comment[];
  totalCount: number;
}

export const CommentsService = {
  async getComments(reportId: number, page: number = 1, pageSize: number = 20): Promise<GetCommentsResult> {
    try {
      // Use api client to ensure token is sent if user is logged in
      const response = await api.get<CommentsResponse>(`/report-comments/report/${reportId}`, {
        params: {
          pageNumber: page,
          pageSize: pageSize
        }
      });
      return {
        comments: response.data?.data?.data || [],
        totalCount: response.data?.data?.totalCount || 0
      };
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  async addComment(reportId: number, userId: string, comment: string, parentCommentId: number | null = null): Promise<Comment> {
    try {
      const response = await api.post<BaseApiResponse & { data: Comment }>(`/report-comments`, { 
        reportId, 
        userId,
        comment, 
        parentCommentId 
      });
      return response.data?.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  async toggleHelpful(commentId: number): Promise<void> {
    try {
      await api.post(`/comments/${commentId}/helpful`);
    } catch (error) {
      console.error('Error toggling helpful status:', error);
      throw error;
    }
  },

  async toggleLike(commentId: number): Promise<void> {
    try {
      await api.post(`/report-reaction/comments/${commentId}/like`);
    } catch (error) {
      console.error('Error toggling like status:', error);
      throw error;
    }
  },

  async updateComment(commentId: number, comment: string): Promise<Comment> {
    try {
      const response = await api.put<BaseApiResponse & { data: Comment }>(`/report-comments/${commentId}`, { comment });
      return response.data?.data;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  },
  async markAsAbusive(commentId: number | string): Promise<void> {
    try {
      await api.put(`/report-comments/${commentId}/mark-abusive`, { isAbusive: true });
    } catch (error) {
      console.error('Error marking comment as abusive:', error);
      throw error;
    }
  },
  async deleteComment(commentId: number): Promise<void> {
    try {
      await api.delete(`/report-comments/${commentId}`);
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }
};
