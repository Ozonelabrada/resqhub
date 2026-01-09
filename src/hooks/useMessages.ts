import { useState, useEffect, useCallback } from 'react';
import { MessagesService } from '../services/messagesService';
import type { Conversation, Message } from '../components/features/messages/types';

export const useMessages = (activeId: string | number | null, isGroup: boolean = false) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Record<string, { page: number; hasMore: boolean }>>({});
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await MessagesService.getConversations();
      setConversations(data);
    } catch (err) {
      setError('Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (id: string | number, page: number = 1) => {
    try {
      let result: { messages: Message[], totalPages: number };
      if (isGroup) {
        result = await MessagesService.getCommunityMessages(id, page);
      } else {
        result = await MessagesService.getDirectMessages(id, page);
      }
      
      const { messages: newMessages, totalPages } = result;
      const key = `${isGroup ? 'group' : 'direct'}-${id}`;
      
      setMessages(prev => ({ 
        ...prev, 
        [key]: page === 1 ? newMessages : [...newMessages, ...(prev[key] || [])] 
      }));
      setPagination(prev => ({
        ...prev,
        [key]: { page, hasMore: page < totalPages }
      }));
    } catch (err) {
      console.error('Failed to fetch messages for', id);
    }
  }, [isGroup]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (activeId) {
      fetchMessages(activeId, 1);
    }
  }, [activeId, fetchMessages]);

  const sendMessage = async (recipientId: string | number, content: string, communityId?: number) => {
    try {
      const isGroupMessage = !!communityId;
      const payload = {
        directMessageReceiverId: isGroupMessage ? undefined : recipientId,
        groupMessageCommunityId: communityId || 0,
        content,
        isGroupMessage
      };

      const newMessage = await MessagesService.sendMessage(payload);
      if (newMessage) {
        const key = `${isGroupMessage ? 'group' : 'direct'}-${communityId || recipientId}`;
        
        setMessages(prev => ({
          ...prev,
          [key]: [...(prev[key] || []), newMessage]
        }));
        
        await fetchConversations();
        return newMessage;
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
    return null;
  };

  const loadMore = useCallback(() => {
    if (!activeId) return;
    const key = `${isGroup ? 'group' : 'direct'}-${activeId}`;
    const currentPager = pagination[key];
    if (currentPager?.hasMore) {
      fetchMessages(activeId, currentPager.page + 1);
    }
  }, [activeId, isGroup, pagination, fetchMessages]);

  const markMessageRead = async (messageId: string | number) => {
    const success = await MessagesService.markAsRead(messageId);
    if (success) {
      fetchConversations();
    }
    return success;
  };

  const markMessageUnread = async (messageId: string | number) => {
    const success = await MessagesService.markAsUnread(messageId);
    if (success) {
      fetchConversations();
    }
    return success;
  };

  const deleteMessage = async (messageId: string | number) => {
    const success = await MessagesService.deleteMessage(messageId);
    if (success && activeId) {
      const key = `${isGroup ? 'group' : 'direct'}-${activeId}`;
      setMessages(prev => ({
        ...prev,
        [key]: (prev[key] || []).filter(m => m.id !== messageId)
      }));
      fetchConversations();
    }
    return success;
  };

  const key = activeId ? `${isGroup ? 'group' : 'direct'}-${activeId}` : '';

  return { 
    conversations, 
    messages, 
    loading, 
    error, 
    sendMessage, 
    markMessageRead,
    markMessageUnread,
    deleteMessage,
    loadMore,
    hasMore: !!pagination[key]?.hasMore,
    refreshConversations: fetchConversations 
  };
};
