import { useState, useEffect, useCallback } from 'react';
import { MessagesService } from '../services/messagesService';
import type { Conversation, Message } from '../components/features/messages/types';

export const useMessages = (
  activeId: string | number | null, 
  isGroup: boolean = false,
  contextCommunityId?: string | number
) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Record<string, { page: number; hasMore: boolean }>>({});
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await MessagesService.getConversations(contextCommunityId);
      setConversations(data);
    } catch (err) {
      setError('Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  }, [contextCommunityId]);

  const fetchMessages = useCallback(async (id: string | number, page: number = 1) => {
    try {
      let result: { messages: Message[], totalPages: number };
      if (isGroup) {
        result = await MessagesService.getCommunityMessages(id, page);
      } else {
        result = await MessagesService.getDirectMessages(id, page, 20, contextCommunityId);
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
  }, [isGroup, contextCommunityId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (activeId) {
      fetchMessages(activeId, 1);
    }
  }, [activeId, fetchMessages]);

  const sendMessage = useCallback(async (recipientId: string | number, content: string, communityId?: number) => {
    try {
      // Use provided communityId or fallback to contextCommunityId for direct messages
      const finalCommunityId = communityId || (isGroup ? activeId : contextCommunityId);
      const isGroupMsg = isGroup && String(activeId) === String(finalCommunityId) && recipientId === 0;

      const payload = {
        directMessageReceiverId: isGroupMsg ? undefined : (recipientId || activeId),
        groupMessageCommunityId: Number(finalCommunityId) || 0,
        content,
        isGroupMessage: isGroupMsg
      };

      const newMessage = await MessagesService.sendMessage(payload);
      if (newMessage) {
        const key = isGroupMsg 
          ? `group-${finalCommunityId}` 
          : `direct-${recipientId || activeId}`;
        
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
  }, [fetchConversations, isGroup, activeId, contextCommunityId]);

  const loadMore = useCallback(() => {
    if (!activeId) return;
    const key = `${isGroup ? 'group' : 'direct'}-${activeId}`;
    const currentPager = pagination[key];
    if (currentPager?.hasMore) {
      fetchMessages(activeId, currentPager.page + 1);
    }
  }, [activeId, isGroup, pagination, fetchMessages]);

  const markMessageRead = useCallback(async (messageId: string | number) => {
    const success = await MessagesService.markAsRead(messageId);
    if (success) {
      // Update local message state to prevent loops
      if (activeId) {
        const key = `${isGroup ? 'group' : 'direct'}-${activeId}`;
        setMessages(prev => ({
          ...prev,
          [key]: (prev[key] || []).map(m => 
            String(m.id) === String(messageId) ? { ...m, isRead: true } : m
          )
        }));
      }
      fetchConversations();
    }
    return success;
  }, [activeId, isGroup, fetchConversations]);

  const markMessageUnread = useCallback(async (messageId: string | number) => {
    const success = await MessagesService.markAsUnread(messageId);
    if (success) {
      if (activeId) {
        const key = `${isGroup ? 'group' : 'direct'}-${activeId}`;
        setMessages(prev => ({
          ...prev,
          [key]: (prev[key] || []).map(m => 
            String(m.id) === String(messageId) ? { ...m, isRead: false } : m
          )
        }));
      }
      fetchConversations();
    }
    return success;
  }, [activeId, isGroup, fetchConversations]);

  const deleteMessage = useCallback(async (messageId: string | number) => {
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
  }, [activeId, isGroup, fetchConversations]);

  const markAllAsRead = useCallback(async (messageIds: (string | number)[]) => {
    if (messageIds.length === 0) return;
    
    const currentKey = activeId ? `${isGroup ? 'group' : 'direct'}-${activeId}` : null;
    if (currentKey) {
      setMessages(prev => ({
        ...prev,
        [currentKey]: (prev[currentKey] || []).map(m => 
          messageIds.some(id => String(id) === String(m.id)) ? { ...m, isRead: true } : m
        )
      }));
    }

    try {
      await Promise.all(messageIds.map(id => MessagesService.markAsRead(id)));
      fetchConversations();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, [activeId, isGroup, fetchConversations]);

  const key = activeId ? `${isGroup ? 'group' : 'direct'}-${activeId}` : '';

  return { 
    conversations, 
    messages, 
    loading, 
    error, 
    sendMessage, 
    markMessageRead,
    markAllAsRead,
    markMessageUnread,
    deleteMessage,
    loadMore,
    hasMore: !!pagination[key]?.hasMore,
    refreshConversations: fetchConversations 
  };
};
