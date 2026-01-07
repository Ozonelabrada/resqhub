import api from '../api/client';
import type { Conversation, Message } from '../components/features/messages/types';

export const MessagesService = {
  async getConversations(): Promise<Conversation[]> {
    try {
      const response = await api.get<{ data: Conversation[] }>('/messages/direct');
      const data = response.data?.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  },

  async getCommunityMessages(communityId: string | number): Promise<Message[]> {
    try {
      const response = await api.get<{ data: Message[] }>(`/messages/community/${communityId}`);
      const data = response.data?.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching community messages:', error);
      return [];
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

  async getMessages(conversationId: string): Promise<Message[]> {
    // Keep this for now as most direct chat systems use ID-based fetching
    // though it wasn't explicitly in the image, /messages/direct usually returns 
    // the list, and specific IDs return the thread.
    try {
      const response = await api.get<{ data: Message[] }>(`/messages/${conversationId}`);
      const data = response.data?.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  async sendMessage(receiverId: string, content: string, communityId?: number): Promise<Message | null> {
    try {
      const isGroupMessage = communityId !== undefined && communityId !== null;
      const payload = {
        directMessageReceiverId: isGroupMessage ? undefined : receiverId,
        groupMessageCommunityId: isGroupMessage ? communityId : undefined,
        content,
        isGroupMessage
      };
      
      const response = await api.post<{ data: Message }>('/messages', payload);
      return response.data?.data || null;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  },

  async markAsRead(messageId: string): Promise<boolean> {
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
