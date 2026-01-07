import React from 'react';
import { 
  Search, 
  Plus,
  Filter,
  Users,
  MessageSquare
} from 'lucide-react';
import { 
  Avatar, 
  Input,
  ScrollArea,
  Button
} from '../../ui';
import { cn } from "@/lib/utils";
import type { Conversation } from './types';
import type { BackendUserData } from '@/services/userService';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewMessage: () => void;
  searchedUsers?: BackendUserData[];
  onSelectUser?: (user: BackendUserData) => void;
  isSearching?: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  searchQuery,
  onSearchChange,
  onNewMessage,
  searchedUsers = [],
  onSelectUser,
  isSearching = false
}) => {
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      {/* Search Header */}
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Messages</h2>
          <Button 
            onClick={onNewMessage}
            variant="ghost" 
            size="icon" 
            className="rounded-xl w-10 h-10 bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white transition-all shadow-sm"
          >
            <Plus size={20} className="stroke-[3]" />
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-teal-500 transition-colors" />
            <Input 
              placeholder="Search people..." 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-12 bg-slate-50 border-none rounded-2xl text-sm font-medium focus-visible:ring-teal-500/20 shadow-inner"
            />
          </div>

          <div className="flex gap-2 pb-2">
            <Button variant="ghost" className="h-8 rounded-full bg-slate-900 text-white text-[10px] uppercase font-black tracking-widest px-4 hover:bg-slate-800">
              All
            </Button>
            <Button variant="ghost" className="h-8 rounded-full bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest px-4 hover:bg-slate-100">
              Unread
            </Button>
            <Button variant="ghost" className="h-8 rounded-full bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest px-4 hover:bg-slate-100">
              Communities
            </Button>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 px-4 py-2">
        <div className="space-y-6">
          {/* SEARCHED USERS SECTION */}
          {searchQuery.length > 0 && (
            <div className="space-y-2">
              <h6 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <Users className="w-3 h-3" />
                Global Search
              </h6>
              {isSearching ? (
                 <div className="flex justify-center py-4">
                    <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                 </div>
              ) : searchedUsers.length > 0 ? (
                searchedUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => onSelectUser?.(user)}
                    className="flex items-center gap-4 p-4 rounded-[1.5rem] cursor-pointer transition-all hover:bg-teal-50 group border-2 border-transparent hover:border-teal-100"
                  >
                    <Avatar 
                      src={user.profilePicture} 
                      alt={user.fullName}
                      className="w-12 h-12 border-2 border-white shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 truncate">{user.fullName}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">@{user.username}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <MessageSquare className="w-4 h-4 text-teal-600" />
                    </Button>
                  </div>
                ))
              ) : searchQuery.length >= 2 && (
                <p className="text-center py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">No users found</p>
              )}
            </div>
          )}

          {/* RECENT CONVERSATIONS SECTION */}
          <div className="space-y-2">
            <h6 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
              {searchQuery.length > 0 ? 'Matching Conversations' : 'Recent Chats'}
            </h6>
            {conversations.length > 0 ? (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-[1.5rem] cursor-pointer transition-all relative group border-2 border-transparent",
                    activeConversationId === conv.id 
                      ? "bg-teal-50 shadow-sm border-teal-100/50" 
                      : "hover:bg-gray-50"
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar 
                      src={conv.user.profilePicture} 
                      alt={conv.user.fullName}
                      className="w-12 h-12 border-2 border-white shadow-sm"
                    />
                    {conv.user.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className={cn(
                        "text-sm font-black truncate",
                        conv.unreadCount > 0 ? "text-slate-900" : "text-slate-800"
                      )}>
                        {conv.user.fullName}
                      </h4>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">{conv.timestamp}</span>
                    </div>
                    <p className={cn(
                      "text-[11px] truncate",
                      conv.unreadCount > 0 ? "font-black text-teal-600" : "font-medium text-slate-500"
                    )}>
                      {conv.lastMessage}
                    </p>
                  </div>

                  {conv.unreadCount > 0 ? (
                    <div className="bg-teal-600 text-white text-[10px] font-black h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full shadow-lg shadow-teal-100">
                      {conv.unreadCount}
                    </div>
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Filter className="w-3 h-3 text-slate-300" />
                    </div>
                  )}
                  
                  {activeConversationId === conv.id && (
                    <div className="absolute left-[-1px] top-1/2 -translate-y-1/2 w-1.5 h-8 bg-teal-600 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.3)]" />
                  )}
                </div>
              ))
            ) : !isSearching && (
              <div className="flex flex-col items-center justify-center py-20 px-8 text-center opacity-40">
                <Search className="w-10 h-10 text-slate-300 mb-4" />
                <p className="text-sm font-bold text-slate-400">No matching history</p>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

