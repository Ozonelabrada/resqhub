import api from '../api/client';
import { authManager } from '../utils/sessionManager';
import type { Conversation, Message } from '../components/features/messages/types';

export const MessagesService = {
  async getConversations(communityId?: string | number): Promise<Conversation[]> {
    try {
      // For the inbox list, we use the direct endpoint
      const params = communityId ? { communityId } : {};
      const response = await api.get<any>('/messages/direct', { params });
      
      // Handle both wrapped and unwrapped response structure
      const responseData = response.data;
      const rawData = responseData?.data ?? responseData;
      
      if (!rawData) return [];

      // Case 1: Already an array of Conversation objects
      if (Array.isArray(rawData) && rawData.length > 0 && 'user' in rawData[0]) {
        return rawData as Conversation[];
      }

      // Case 2: Response contains a messages array (inbox style)
      // We check for .messages or if rawData is the array itself
      let messages: Message[] = [];
      if (Array.isArray(rawData)) {
        messages = rawData;
      } else if (rawData && Array.isArray(rawData.messages)) {
        messages = rawData.messages;
      }
      
      if (messages.length === 0) return [];

      const currentUser = authManager.getUser();
      const currentUserId = currentUser ? String(currentUser.id) : null;
      if (!currentUserId) return [];

      const partnerMap = new Map<string, Conversation>();

      messages.forEach((msg: Message) => {
        // Partner is whoever is not the current user
        const partnerId = msg.senderId === currentUserId 
          ? msg.directMessageReceiverId 
          : msg.senderId;

        if (!partnerId) return;

        const existing = partnerMap.get(partnerId);
        
        // If this message is newer or we don't have one yet, use it for the summary
        const msgDate = new Date(msg.timestamp);
        const existingDate = existing ? new Date(existing.timestamp) : new Date(0);

        if (!existing || msgDate > existingDate) {
          partnerMap.set(partnerId, {
            id: partnerId,
            user: {
              fullName: msg.senderId === currentUserId ? 'Sent Message' : (msg.senderName || 'User'),
              username: 'user', 
              profilePicture: msg.senderId === currentUserId ? undefined : msg.senderProfilePicture,
            },
            lastMessage: msg.content,
            timestamp: msg.timestamp,
            unreadCount: existing?.unreadCount || 0
          });
        }

        // Increment unread count if message is for me and not read
        if (msg.directMessageReceiverId === currentUserId && !msg.isRead) {
          const conv = partnerMap.get(partnerId);
          if (conv) conv.unreadCount++;
        }
      });

      return Array.from(partnerMap.values()).sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  },

  async getDirectMessages(
    partnerId: string | number, 
    page: number = 1, 
    pageSize: number = 20,
    communityId?: string | number
  ): Promise<{ messages: Message[], totalPages: number }> {
    try {
      const params: any = { conversationPartnerId: partnerId, pageSize, page };
      if (communityId) params.communityId = communityId;

      const response = await api.get<any>(
        '/messages/direct', { params }
      );
      
      const responseData = response.data;
      const data = responseData?.data ?? responseData;
      
      return {
        messages: Array.isArray(data?.messages) ? data.messages : (Array.isArray(data) ? data : []),
        totalPages: data?.totalPages || 1
      };
    } catch (error) {
      console.error('Error fetching direct messages:', error);
      return { messages: [], totalPages: 1 };
    }
  },

  async getCommunityMessages(communityId: string | number, page: number = 1, pageSize: number = 20): Promise<{ messages: Message[], totalPages: number }> {
    try {
      const response = await api.get<any>(
        `/messages/community/${communityId}?pageSize=${pageSize}&page=${page}`
      );
      
      const responseData = response.data;
      const data = responseData?.data ?? responseData;

      return {
        messages: Array.isArray(data?.messages) ? data.messages : (Array.isArray(data) ? data : []),
        totalPages: data?.totalPages || 1
      };
    } catch (error) {
      console.error('Error fetching community messages:', error);
      return { messages: [], totalPages: 1 };
    }
  },

  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get<{ data: { unreadCount?: number; count?: number } | number }>('/messages/unread-count');
      const data = response.data?.data;
      
      // Handle { unreadCount: n }, { count: n } and raw number response formats
      if (typeof data === 'object' && data !== null) {
        if ('count' in data && typeof data.count === 'number') return data.count;
        if ('unreadCount' in data && typeof data.unreadCount === 'number') return data.unreadCount;
      }
      
      return typeof data === 'number' ? data : 0;
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
      const response = await api.post<{ data: Message }>('/messages', payload);
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
