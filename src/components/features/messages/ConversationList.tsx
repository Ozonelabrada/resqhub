import React from 'react';
import { 
  Search, 
  Circle 
} from 'lucide-react';
import { 
  Avatar, 
  Input,
  ScrollArea
} from '../../ui';
import { cn } from "@/lib/utils";
import type { Conversation } from './types';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation
}) => {
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      {/* Search Header */}
      <div className="p-6 pb-2">
        <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Messages</h2>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input 
            placeholder="Search conversations..." 
            className="pl-10 h-12 bg-slate-50 border-none rounded-2xl text-sm font-medium focus-visible:ring-teal-500/20"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 px-4 py-2">
        <div className="space-y-2">
          {conversations.map((conv) => (
            <div
              key={conv.id}
            onClick={() => onSelectConversation(conv.id)}
            className={cn(
              "flex items-center gap-4 p-4 rounded-[1.5rem] cursor-pointer transition-all relative group",
              activeConversationId === conv.id 
                ? "bg-teal-50 shadow-sm" 
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
                  conv.unreadCount > 0 ? "text-slate-900" : "text-slate-700"
                )}>
                  {conv.user.fullName}
                </h4>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{conv.timestamp}</span>
              </div>
              <p className={cn(
                "text-xs truncate",
                conv.unreadCount > 0 ? "font-black text-teal-600" : "font-medium text-slate-500"
              )}>
                {conv.lastMessage}
              </p>
            </div>

            {conv.unreadCount > 0 && (
              <div className="bg-teal-600 text-white text-[10px] font-black h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full shadow-lg shadow-teal-100">
                {conv.unreadCount}
              </div>
            )}
            
            {activeConversationId === conv.id && (
              <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-teal-600 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
            )}
          </div>
        ))}
        </div>
      </ScrollArea>
    </div>
  );
};
