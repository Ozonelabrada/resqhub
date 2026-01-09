import api from '../api/client';
import type { BaseApiResponse } from '../types/api';

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
  // UI helper fields (keep if useful for frontend logic)
  likesCount?: number;
  isLikedByUser?: boolean;
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

export const CommentsService = {
  async getComments(reportId: number, page: number = 1, pageSize: number = 20): Promise<Comment[]> {
    try {
      // Use api client to ensure token is sent if user is logged in
      const response = await api.get<CommentsResponse>(`/report-comments/report/${reportId}`, {
        params: {
          pageNumber: page,
          pageSize: pageSize
        }
      });
      return response.data?.data?.data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  async addComment(reportId: number, comment: string, parentCommentId: number | null = null): Promise<Comment> {
    try {
      const response = await api.post<BaseApiResponse & { data: Comment }>(`/report-comments`, { 
        reportId, 
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
  }
};
