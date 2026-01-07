import React, { useState, useEffect } from 'react';
import { ConversationList } from './ConversationList';
import { ChatWindow } from './ChatWindow';
import { Card, Spinner } from '../../ui';
import { useMessages } from '../../../hooks/useMessages';

interface MessagesContainerProps {
  initialConversationId?: string;
}

export const MessagesContainer: React.FC<MessagesContainerProps> = ({ initialConversationId }) => {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversationId || null);
  const { conversations, messages, loading, sendMessage } = useMessages(activeConversationId);

  useEffect(() => {
    if (initialConversationId) {
      setActiveConversationId(initialConversationId);
    }
  }, [initialConversationId]);

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
  };

  const handleSendMessage = async (text: string) => {
    if (!activeConversationId) return;
    await sendMessage(activeConversationId, text);
  };

  const safeConversations = Array.isArray(conversations) ? conversations : [];
  const activeConversation = safeConversations.find(c => c.id === activeConversationId) || null;

  if (loading && safeConversations.length === 0) {
    return (
      <Card className="flex h-[calc(100vh-140px)] items-center justify-center border-none shadow-xl rounded-[2.5rem] bg-white">
        <Spinner size="lg" />
      </Card>
    );
  }

  return (
    <Card className="flex h-[calc(100vh-140px)] border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <div className="w-full lg:w-96 shrink-0 h-full border-r border-gray-100 flex flex-col">
        <ConversationList 
          conversations={safeConversations}
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
