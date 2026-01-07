import { useState, useEffect, useCallback } from 'react';
import { MessagesService } from '../services/messagesService';
import type { Conversation, Message } from '../components/features/messages/types';

export const useMessages = (activeConversationId: string | null) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(false);
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

  const fetchMessages = useCallback(async (id: string) => {
    try {
      const data = await MessagesService.getMessages(id);
      setMessages(prev => ({ ...prev, [id]: data }));
    } catch (err) {
      console.error('Failed to fetch messages for conversation', id);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    }
  }, [activeConversationId, fetchMessages]);

  const sendMessage = async (receiverId: string, content: string) => {
    try {
      const newMessage = await MessagesService.sendMessage(receiverId, content);
      if (newMessage) {
        // Find if we have a conversation mapping for this receiver
        const conversation = conversations.find(c => c.user.id === receiverId);
        const targetId = conversation?.id || activeConversationId;
        
        if (targetId) {
          setMessages(prev => ({
            ...prev,
            [targetId]: [...(prev[targetId] || []), newMessage]
          }));
        }
        
        // Always refresh conversations to ensure the list is up to date (last message, new threads)
        await fetchConversations();
        return newMessage;
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
    return null;
  };

  const markMessageRead = async (messageId: string) => {
    const success = await MessagesService.markAsRead(messageId);
    if (success) {
      // Refresh to update unread counts
      fetchConversations();
    }
    return success;
  };

  const markMessageUnread = async (messageId: string) => {
    const success = await MessagesService.markAsUnread(messageId);
    if (success) {
      fetchConversations();
    }
    return success;
  };

  const deleteMessage = async (messageId: string) => {
    const success = await MessagesService.deleteMessage(messageId);
    if (success && activeConversationId) {
      // Local update
      setMessages(prev => ({
        ...prev,
        [activeConversationId]: prev[activeConversationId].filter(m => m.id !== messageId)
      }));
      fetchConversations();
    }
    return success;
  };

  return { 
    conversations, 
    messages, 
    loading, 
    error, 
    sendMessage, 
    markMessageRead,
    markMessageUnread,
    deleteMessage,
    refreshConversations: fetchConversations 
  };
};
