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
    const newMessage = await MessagesService.sendMessage(receiverId, content);
    if (newMessage && activeConversationId) {
      setMessages(prev => ({
        ...prev,
        [activeConversationId]: [...(prev[activeConversationId] || []), newMessage]
      }));
      // Optional: refresh conversations to update last message
      fetchConversations();
    }
    return newMessage;
  };

  return { conversations, messages, loading, error, sendMessage, refreshConversations: fetchConversations };
};
