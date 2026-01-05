import api from '../api/client';
import { BaseApiResponse } from '../types';

export interface Comment {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  isOwner: boolean;
  isHelpful: boolean;
  likesCount: number;
  isLikedByUser: boolean;
}

export interface CommentsResponse extends BaseApiResponse {
  data: Comment[];
}

export interface CommentResponse extends BaseApiResponse {
  data: Comment;
}

export const CommentsService = {
  async getComments(reportId: number): Promise<Comment[]> {
    try {
      const response = await api.get<CommentsResponse>(`/reports/${reportId}/comments`);
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  async addComment(reportId: number, content: string): Promise<Comment> {
    try {
      const response = await api.post<CommentResponse>(`/reports/${reportId}/comments`, { content });
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
      await api.post(`/comments/${commentId}/like`);
    } catch (error) {
      console.error('Error toggling like status:', error);
      throw error;
    }
  }
};
