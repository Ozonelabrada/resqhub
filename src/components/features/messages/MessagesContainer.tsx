import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ConversationList } from './ConversationList';
import { ChatWindow } from './ChatWindow';
import { NewMessageModal } from './NewMessageModal';
import { DirectChatModal } from './DirectChatModal'; // Added Import
import { Card, Spinner } from '../../ui';
import { useMessages } from '../../../hooks/useMessages';
import { Plus } from 'lucide-react';
import { Button } from '../../ui/button';
import { UserService } from '@/services/userService';
import type { BackendUserData } from '@/services/userService';

interface MessagesContainerProps {
  initialConversationId?: string;
}

export const MessagesContainer: React.FC<MessagesContainerProps> = ({ initialConversationId }) => {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversationId || null);
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const [selectedUserForDirectChat, setSelectedUserForDirectChat] = useState<BackendUserData | null>(null); // New State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedUsers, setSearchedUsers] = useState<BackendUserData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const { 
    conversations, 
    messages, 
    loading, 
    sendMessage, 
    markMessageRead,
    markMessageUnread,
    deleteMessage,
    loadMore,
    hasMore,
    refreshConversations 
  } = useMessages(activeConversationId);

  // Global search effect
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchedUsers([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await UserService.searchUsers(searchQuery);
        setSearchedUsers(results);
      } catch (error) {
        console.error('Global search failed:', error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const key = `direct-${activeConversationId}`;
    if (activeConversationId && messages[key]) {
      const activeMsgs = messages[key];
      // Find the last message that is unread and not from me
      const lastUnread = activeMsgs
        .filter(m => m.status === 'sent' && m.senderId !== 'me')
        .pop();
        
      if (lastUnread) {
        markMessageRead(lastUnread.id);
      }
    }
  }, [activeConversationId, messages, markMessageRead]);

  useEffect(() => {
    if (initialConversationId) {
      setActiveConversationId(initialConversationId);
    }
  }, [initialConversationId]);

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
  };

  const handleSendMessage = async (text: string) => {
    // If we have an active conversation, use the recipient from that
    if (activeConversationId) {
      const conversation = conversations.find(c => c.id === activeConversationId);
      if (conversation) {
        await sendMessage(conversation.user.id, text);
        return;
      }
    }
    console.warn('Attempted to send message without an active recipient');
  };

  const handleDeleteMessage = async (id: string) => {
    await deleteMessage(id);
  };

  const handleMarkUnread = async (id: string) => {
    await markMessageUnread(id);
  };

  const handleSelectNewUser = async (user: BackendUserData) => {
    // Check if conversation already exists in our sidebar
    const existingConv = conversations.find(c => c.user.id === user.id);
    if (existingConv) {
      setActiveConversationId(existingConv.id);
    } else {
      // REQUIREMENT: On click, open chat box (Shadcn Dialog) showing all chats with that user—do not auto-send.
      setSelectedUserForDirectChat(user);
    }
  };

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const lowerQuery = searchQuery.toLowerCase();
    return conversations.filter(c => 
      c.user.fullName.toLowerCase().includes(lowerQuery) || 
      c.lastMessage.toLowerCase().includes(lowerQuery)
    );
  }, [conversations, searchQuery]);

  const safeConversations = Array.isArray(filteredConversations) ? filteredConversations : [];
  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

  if (loading && conversations.length === 0) {
    return (
      <Card className="flex h-[calc(100vh-140px)] items-center justify-center border-none shadow-xl rounded-[2.5rem] bg-white">
        <Spinner size="lg" className="text-teal-500" />
      </Card>
    );
  }

  return (
    <Card className="flex h-[calc(100vh-140px)] border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden animate-in fade-in zoom-in-95 duration-500 relative">
      <div className="w-full lg:w-96 shrink-0 h-full border-r border-gray-100 flex flex-col">
        <ConversationList 
          conversations={safeConversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNewMessage={() => setIsNewMessageModalOpen(true)}
          searchedUsers={searchedUsers}
          onSelectUser={handleSelectNewUser}
          isSearching={isSearching}
        />
      </div>
      <div className="hidden lg:flex flex-1 h-full">
        <ChatWindow 
          conversation={activeConversation}
          messages={messages[`direct-${activeConversationId}`] || []}
          onSendMessage={handleSendMessage}
          onDeleteMessage={handleDeleteMessage}
          onMarkUnread={handleMarkUnread}
          onLoadMore={loadMore}
          hasMore={hasMore}
        />
      </div>

      {/* Mobile overlay for chat window when a conversation is selected */}
      {activeConversationId && (
        <div className="fixed inset-0 z-50 lg:hidden bg-white">
          <ChatWindow 
            conversation={activeConversation}
            messages={messages[`direct-${activeConversationId}`] || []}
            onSendMessage={handleSendMessage}
            onBack={() => setActiveConversationId(null)}
            onLoadMore={loadMore}
            hasMore={hasMore}
          />
        </div>
      )}

      {/* New Message FAB for mobile if needed, though sidebar header is better */}
      <Button 
        onClick={() => setIsNewMessageModalOpen(true)}
        className="absolute bottom-8 right-8 w-16 h-16 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-2xl flex items-center justify-center lg:hidden z-20"
      >
        <Plus className="w-8 h-8" />
      </Button>

      <NewMessageModal 
        isOpen={isNewMessageModalOpen}
        onClose={() => setIsNewMessageModalOpen(false)}
        onSelectUser={handleSelectNewUser}
      />

      <DirectChatModal 
        user={selectedUserForDirectChat}
        isOpen={!!selectedUserForDirectChat}
        onClose={() => setSelectedUserForDirectChat(null)}
      />
    </Card>
  );
};

