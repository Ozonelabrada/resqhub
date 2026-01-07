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

  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const response = await api.get<{ data: Message[] }>(`/messages/${conversationId}`);
      const data = response.data?.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  async sendMessage(receiverId: string, content: string): Promise<Message | null> {
    try {
      const response = await api.post<{ data: Message }>('/messages', {
        receiverId,
        content
      });
      return response.data?.data || null;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  },

  async markAsRead(conversationId: string): Promise<boolean> {
    try {
      await api.put(`/messages/${conversationId}/read`);
      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
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
