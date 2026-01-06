import React, { useState, useEffect } from 'react';
import { ConversationList } from './ConversationList';
import type { Conversation, Message } from './types';
import { ChatWindow } from './ChatWindow';
import { Card } from '../../ui';

interface MessagesContainerProps {
  initialConversationId?: string;
}

export const MessagesContainer: React.FC<MessagesContainerProps> = ({ initialConversationId }) => {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversationId || null);

  useEffect(() => {
    if (initialConversationId) {
      setActiveConversationId(initialConversationId);
    }
  }, [initialConversationId]);

  // Mock Conversations ...
  const [conversations] = useState<Conversation[]>([
    {
      id: '1',
      user: {
        fullName: 'Sarah Johnson',
        username: 'sarahj',
        profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
        isOnline: true
      },
      lastMessage: "I think I found your keys near the cafe!",
      timestamp: '2:30 PM',
      unreadCount: 2
    },
    {
      id: '2',
      user: {
        fullName: 'Michael Chen',
        username: 'mchen',
        profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        isOnline: false
      },
      lastMessage: "Thanks for the update on the report.",
      timestamp: 'Yesterday',
      unreadCount: 0
    },
    {
      id: '3',
      user: {
        fullName: 'District 4 Patrol',
        username: 'd4patrol',
        profilePicture: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100',
        isOnline: true
      },
      lastMessage: "We've added your report to our priority watchlist.",
      timestamp: 'Jan 4',
      unreadCount: 0
    }
  ]);

  // Mock Messages
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    '1': [
      { id: 'm1', senderId: '1', text: "Hello! Is this Sarah?", timestamp: '10:00 AM', status: 'read' },
      { id: 'm2', senderId: 'me', text: "Yes, I'm Sarah. How can I help you?", timestamp: '10:05 AM', status: 'read' },
      { id: 'm3', senderId: '1', text: "I'm inquiring about the lost item you posted.", timestamp: '10:10 AM', status: 'read' },
      { id: 'm4', senderId: '1', text: "I think I found your keys near the cafe!", timestamp: '2:30 PM', status: 'delivered' }
    ],
    '2': [
      { id: 'm5', senderId: '2', text: "Hi, is the wallet still lost?", timestamp: 'Yesterday', status: 'read' }
    ]
  });

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
  };

  const handleSendMessage = (text: string) => {
    if (!activeConversationId) return;
    
    const newMessage = {
      id: `m${Date.now()}`,
      senderId: 'me',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setMessages((prev) => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), newMessage]
    }));
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

  return (
    <Card className="flex h-[calc(100vh-140px)] border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <div className="w-full lg:w-96 shrink-0 h-full border-r border-gray-100 flex flex-col">
        <ConversationList 
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
        />
      </div>
      <div className="hidden lg:flex flex-1 h-full">
        <ChatWindow 
          conversation={activeConversation}
          messages={messages[activeConversationId || ''] || []}
          onSendMessage={handleSendMessage}
        />
      </div>

      {/* Mobile overlay for chat window when a conversation is selected */}
      {activeConversationId && (
        <div className="fixed inset-0 z-50 lg:hidden bg-white">
          <ChatWindow 
            conversation={activeConversation}
            messages={messages[activeConversationId || ''] || []}
            onSendMessage={handleSendMessage}
            onBack={() => setActiveConversationId(null)}
          />
        </div>
      )}
    </Card>
  );
};
