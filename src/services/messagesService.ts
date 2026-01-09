import api from '../api/client';
import type { Conversation, Message } from '../components/features/messages/types';

export const MessagesService = {
  async getConversations(): Promise<Conversation[]> {
    try {
      // For the inbox list, we use the direct endpoint without partner filter
      const response = await api.get<{ data: Conversation[] }>('/messages/direct');
      const data = response.data?.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  },

  async getDirectMessages(partnerId: string | number, page: number = 1, pageSize: number = 20): Promise<{ messages: Message[], totalPages: number }> {
    try {
      const response = await api.get<{ data: { messages: Message[], totalPages: number } }>(
        `/messages/direct?conversationPartnerId=${partnerId}&pageSize=${pageSize}&page=${page}`
      );
      const data = response.data?.data;
      return {
        messages: Array.isArray(data?.messages) ? data.messages : [],
        totalPages: data?.totalPages || 1
      };
    } catch (error) {
      console.error('Error fetching direct messages:', error);
      return { messages: [], totalPages: 1 };
    }
  },

  async getCommunityMessages(communityId: string | number, page: number = 1, pageSize: number = 20): Promise<{ messages: Message[], totalPages: number }> {
    try {
      const response = await api.get<{ data: { messages: Message[], totalPages: number } }>(
        `/messages/community/${communityId}?pageSize=${pageSize}&page=${page}`
      );
      const data = response.data?.data;
      return {
        messages: Array.isArray(data?.messages) ? data.messages : [],
        totalPages: data?.totalPages || 1
      };
    } catch (error) {
      console.error('Error fetching community messages:', error);
      return { messages: [], totalPages: 1 };
    }
  },

  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get<{ data: number }>('/messages/unread-count');
      return response.data?.data || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  async sendMessage(payload: {
    directMessageReceiverId?: string | number;
    groupMessageCommunityId?: number;
    content: string;
    isGroupMessage: boolean;
  }): Promise<Message | null> {
    try {
      // Endpoint is /message as per requirement
      const response = await api.post<{ data: Message }>('/message', payload);
      return response.data?.data || null;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  },

  async markAsRead(messageId: string | number): Promise<boolean> {
    try {
      await api.put(`/messages/${messageId}/read`);
      return true;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  },

  async markAsUnread(messageId: string): Promise<boolean> {
    try {
      await api.put(`/messages/${messageId}/unread`);
      return true;
    } catch (error) {
      console.error('Error marking message as unread:', error);
      return false;
    }
  },

  async deleteMessage(messageId: string): Promise<boolean> {
    try {
      await api.delete(`/messages/${messageId}`);
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }
};
