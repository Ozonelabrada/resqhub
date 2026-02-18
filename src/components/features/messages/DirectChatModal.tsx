import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { ChatWindow } from './ChatWindow';
import { useMessages } from '@/hooks/useMessages';
import type { BackendUserData } from '@/services/userService';
import type { Conversation } from './types';

interface DirectChatModalProps {
  user: BackendUserData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DirectChatModal: React.FC<DirectChatModalProps> = ({
  user,
  isOpen,
  onClose
}) => {
  const { 
    messages, 
    sendMessage,
    deleteMessage,
    markMessageRead,
    markMessageUnread,
    loadMore,
    hasMore
  } = useMessages(user?.id || null);

  // Map user to basic conversation object for ChatWindow usage
  const conversation: Conversation | null = user ? {
    id: `temp-${user.id}`, // Temporary ID for UI
    user: {
      id: String(user.id),
      fullName: user.fullName || user.email,
      username: user.username || '',
      profilePicture: user.profilePicture || '',
      isOnline: false
    },
    lastMessage: '',
    timestamp: new Date().toISOString(),
    unreadCount: 0
  } : null;

  const key = user ? `direct-${user.id}` : '';
  const chatMessages = messages[key] || [];

  const handleSendMessage = async (content: string) => {
    if (user) {
      await sendMessage(user.id, content);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl bg-white animate-in zoom-in-95 duration-300">
        <DialogHeader className="hidden">
           <DialogTitle>Chat with {user?.fullName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-full">
            <ChatWindow 
                conversation={conversation}
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                onBack={onClose}
                onDeleteMessage={(id) => { deleteMessage(id); }}
                onMarkUnread={(id) => { markMessageUnread(id); }}
                onLoadMore={loadMore}
                hasMore={hasMore}
            />
        </div>
      </DialogContent>
    </Dialog>
  );
};
