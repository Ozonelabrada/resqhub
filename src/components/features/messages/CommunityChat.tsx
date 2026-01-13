import React, { useState, useEffect, useMemo } from 'react';
import { ChatWindow } from './ChatWindow';
import type { Conversation } from './types';
import { useMessages } from '@/hooks';
import { Spinner, Button, Avatar, Input } from '@/components/ui';
import { Search, Users, MessageSquare } from 'lucide-react';
import { CommunityService } from '@/services/communityService';
import type { CommunityMember } from '@/types/community';
import { authManager } from '@/utils/sessionManager';

interface CommunityChatProps {
  communityId: string | number;
  communityName: string;
}

type ChatView = 'list' | 'group' | 'direct';

export const CommunityChat: React.FC<CommunityChatProps> = ({
  communityId,
  communityName
}) => {
  const user = authManager.getUser();
  const userRole = user?.role || 'user';
  const isAdminOrMod = userRole === 'admin' || userRole === 'moderator';

  // State
  const [view, setView] = useState<ChatView>(isAdminOrMod ? 'list' : 'group');
  const [selectedRecipient, setSelectedRecipient] = useState<CommunityMember | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Derived Values - Ensure communityId is used consistently as a string if it's an ID
  const normalizedCommunityId = String(communityId);
  const isGroupActive = view === 'group';
  const activeChatId = isGroupActive 
    ? normalizedCommunityId 
    : (view === 'direct' ? selectedRecipient?.id : null);
  
  const { 
    messages, 
    sendMessage,
    markAllAsRead,
    deleteMessage,
    markMessageUnread,
    loadMore,
    hasMore
  } = useMessages(activeChatId || null, isGroupActive, normalizedCommunityId);

  // Key for accessing message cache
  const chatKey = isGroupActive 
    ? `group-${normalizedCommunityId}` 
    : (selectedRecipient ? `direct-${selectedRecipient.id}` : '');
  
  const chatMessages = messages[chatKey] || [];

  // Auto-mark as read
  useEffect(() => {
    if (activeChatId && messages[chatKey]) {
      const currentUserId = authManager.getUser()?.id;
      const unreadIds = messages[chatKey]
        .filter(m => !m.isRead && String(m.senderId) !== String(currentUserId))
        .map(m => m.id);
      
      if (unreadIds.length > 0) {
        markAllAsRead(unreadIds);
      }
    }
  }, [activeChatId, chatKey, messages, markAllAsRead]);

  useEffect(() => {
    if (!isAdminOrMod) return;

    const fetchMembers = async () => {
      setLoadingMembers(true);
      try {
        const data = await CommunityService.getCommunityMembers(normalizedCommunityId);
        setMembers(data);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoadingMembers(false);
      }
    };
    fetchMembers();
  }, [normalizedCommunityId, isAdminOrMod]);

  const filteredMembers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const currentUserId = String(authManager.getUser()?.id);
    return members.filter(m => 
      String(m.id) !== currentUserId && 
      (m.name?.toLowerCase().includes(query) || m.username?.toLowerCase().includes(query))
    );
  }, [members, searchQuery]);

  const handleSendMessage = (content: string) => {
    if (view === 'group') {
      sendMessage(0, content, Number(normalizedCommunityId));
    } else if (view === 'direct' && selectedRecipient) {
      sendMessage(selectedRecipient.id, content, Number(normalizedCommunityId));
    }
  };

  const handleBack = () => {
    if (isAdminOrMod) {
      setView('list');
      setSelectedRecipient(null);
    }
  };

  const handleMemberSelect = (member: CommunityMember) => {
    if (isAdminOrMod) {
      setSelectedRecipient(member);
      setView('direct');
    }
  };

  const messageAsLabel = isAdminOrMod 
    ? `Message as ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}` 
    : "Community Support Chat";

  // Map to conversation object for ChatWindow
  const activeConversation: Conversation | null = useMemo(() => {
    if (view === 'group') {
      return {
        id: `group-${normalizedCommunityId}`,
        user: { 
          fullName: communityName, 
          username: 'group', 
          isOnline: true,
          profilePicture: undefined 
        },
        lastMessage: chatMessages[chatMessages.length - 1]?.content || '',
        timestamp: new Date().toISOString(),
        unreadCount: 0
      };
    }
    if (view === 'direct' && selectedRecipient) {
      return {
        id: `direct-${selectedRecipient.id}`,
        user: { 
          fullName: selectedRecipient.name || selectedRecipient.username, 
          username: selectedRecipient.username,
          profilePicture: selectedRecipient.profilePicture,
          isOnline: true 
        },
        lastMessage: chatMessages[chatMessages.length - 1]?.content || '',
        timestamp: new Date().toISOString(),
        unreadCount: 0
      };
    }
    return null;
  }, [view, normalizedCommunityId, communityName, selectedRecipient, chatMessages]);

  if (view === 'list') {
    return (
      <div className="flex flex-col h-full bg-white animate-in fade-in duration-300">
        <div className="p-4 border-b border-slate-50 space-y-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500" />
            <Input 
              placeholder="Search members..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-slate-50 border-none rounded-xl text-xs font-bold"
            />
          </div>

          <Button 
            onClick={() => setView('group')}
            className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl shadow-lg shadow-teal-100 flex items-center justify-center gap-2"
          >
            <Users size={18} />
            GROUP DISCUSSION
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <h6 className="px-3 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2 mt-2">Members Message</h6>
          
          {loadingMembers ? (
            <div className="flex justify-center p-8"><Spinner size="sm" /></div>
          ) : filteredMembers.length > 0 ? (
            filteredMembers.map(member => (
              <div 
                key={member.id}
                onClick={() => handleMemberSelect(member)}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-all border border-transparent hover:border-slate-100 group"
              >
                <Avatar src={member.profilePicture} className="w-10 h-10 border-2 border-white shadow-sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-800 truncate">{member.name || member.username}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">@{member.username}</p>
                </div>
                <MessageSquare className="w-4 h-4 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))
          ) : (
            <div className="py-12 text-center opacity-40">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No members found</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white rounded-[2rem] shadow-sm overflow-hidden">
      <ChatWindow 
        conversation={activeConversation}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        onDeleteMessage={deleteMessage}
        onMarkUnread={markMessageUnread}
        onLoadMore={loadMore}
        hasMore={hasMore}
        onBack={isAdminOrMod ? handleBack : undefined}
        showBackButtonOnDesktop={isAdminOrMod}
        messageAsLabel={messageAsLabel}
      />
    </div>
  );
};
