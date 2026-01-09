import React from 'react';
import { ChatWindow } from './ChatWindow';
import type { Conversation } from './types';
import { useMessages } from '@/hooks';
import { Spinner } from '@/components/ui';

interface CommunityChatProps {
  communityId: string | number;
  communityName: string;
}

export const CommunityChat: React.FC<CommunityChatProps> = ({
  communityId,
  communityName
}) => {
  const { 
    messages, 
    loading, 
    sendMessage,
    deleteMessage,
    markMessageUnread,
    loadMore,
    hasMore
  } = useMessages(communityId, true);

  const key = `group-${communityId}`;
  const chatMessages = messages[key] || [];

  // Map community to fake conversation for ChatWindow compatibility
  const conversation: Conversation = {
    id: `group-${communityId}`,
    user: {
      fullName: communityName,
      username: `group-${communityId}`,
      isOnline: true
    },
    lastMessage: chatMessages[chatMessages.length - 1]?.content || '',
    timestamp: new Date().toISOString(),
    unreadCount: 0
  };

  const handleSendMessage = (content: string) => {
    sendMessage(0, content, Number(communityId));
  };

  if (loading && chatMessages.length === 0) {
    return (
      <div className="flex items-center justify-center p-20">
        <Spinner size="lg" className="text-teal-600" />
      </div>
    );
  }

  return (
    <div className="h-[600px] bg-white rounded-[2rem] shadow-sm border border-slate-50 overflow-hidden">
      <ChatWindow 
        conversation={conversation}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        onDeleteMessage={deleteMessage}
        onMarkUnread={markMessageUnread}
        onLoadMore={loadMore}
        hasMore={hasMore}
      />
    </div>
  );
};
