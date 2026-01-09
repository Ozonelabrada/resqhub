import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Smile, 
  MoreVertical, 
  Paperclip,
  Check,
  CheckCheck,
  ChevronLeft,
  Phone,
  Video,
  MessageSquare,
  Trash2,
  Mail
} from 'lucide-react';
import { 
  Avatar, 
  Button,
  ScrollArea
} from '../../ui';
import { cn } from "@/lib/utils";
import type { Conversation, Message } from './types';
import { useAuth } from '@/context/AuthContext';

interface ChatWindowProps {
  conversation: Conversation | null;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onDeleteMessage?: (messageId: string | number) => void;
  onMarkUnread?: (messageId: string | number) => void;
  onBack?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const TypingIndicator = () => (
  <div className="flex gap-1.5 px-4 py-3 bg-white rounded-2xl w-fit shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
    <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
    <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
    <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" />
  </div>
);

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  messages,
  onSendMessage,
  onDeleteMessage,
  onMarkUnread,
  onBack,
  onLoadMore,
  hasMore
}) => {
  const { user: currentUser } = useAuth();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeMenuMessageId, setActiveMenuMessageId] = useState<string | number | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isTyping]);

  // Mock typing indicator effect
  useEffect(() => {
    if (conversation && !isTyping && messages.length > 0) {
       const timer = setTimeout(() => {
         setIsTyping(true);
         setTimeout(() => setIsTyping(false), 3000);
       }, 8000);
       return () => clearTimeout(timer);
    }
  }, [conversation, messages.length]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 p-8 text-center animate-in fade-in duration-700">
        <div className="w-32 h-32 bg-teal-50 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner rotate-3">
           <MessageSquare className="w-12 h-12 text-teal-600 opacity-20 -rotate-3" />
        </div>
        <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Your Inbox</h3>
        <p className="text-slate-500 max-w-xs font-bold text-xs uppercase tracking-widest leading-relaxed">
          Select a member to start coordinating or view your chat history.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 relative overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 md:p-6 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between shadow-sm z-10 transition-all">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="lg:hidden rounded-2xl">
              <ChevronLeft className="w-6 h-6 text-slate-600" />
            </Button>
          )}
          <div className="relative group cursor-pointer">
            <Avatar 
              src={conversation.user.profilePicture} 
              alt={conversation.user.fullName}
              className="w-12 h-12 border-2 border-white shadow-md ring-1 ring-slate-100 transition-transform group-hover:scale-105"
            />
            {conversation.user.isOnline && (
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
            )}
          </div>
          <div>
            <h4 className="text-base font-black text-slate-900 leading-none mb-1.5">{conversation.user.fullName}</h4>
            <div className="flex items-center gap-2">
              <div className={cn("w-1.5 h-1.5 rounded-full", conversation.user.isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                {conversation.user.isOnline ? 'Active Now' : 'Offline'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-3">
          <Button variant="ghost" size="icon" className="hidden md:flex rounded-2xl text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all">
            <Phone size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="hidden md:flex rounded-2xl text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all">
            <Video size={18} />
          </Button>
          <div className="w-px h-6 bg-slate-100 mx-1 hidden md:block" />
          <Button variant="ghost" size="icon" className="rounded-2xl text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all">
            <MoreVertical size={20} />
          </Button>
        </div>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
        <div className="space-y-8 pb-4">
          {hasMore && (
            <div className="flex justify-center p-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onLoadMore}
                className="text-[10px] uppercase font-black tracking-widest text-teal-600 hover:bg-teal-50 rounded-xl"
              >
                Load Previous Messages
              </Button>
            </div>
          )}
          <div className="flex justify-center">
            <span className="px-4 py-1.5 bg-white/50 backdrop-blur shadow-sm border border-gray-100 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Messages are secured with end-to-end encryption
            </span>
          </div>

          {messages.map((msg) => {
            const isMe = String(msg.senderId) === String(currentUser?.id) || msg.senderId === 'me' || msg.senderId === 'current-user';
            const showSenderInfo = !isMe && msg.isGroupMessage;
            
            return (
              <div key={msg.id} className={cn(
                "flex flex-col max-w-[85%] group animate-in fade-in slide-in-from-bottom-2 duration-500",
                isMe ? "ml-auto items-end" : "mr-auto items-start"
              )}>
                {showSenderInfo && (
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1 px-3">
                    {msg.senderName || 'Member'}
                  </span>
                )}
                <div className="flex items-center gap-2 w-full relative">
                  {!isMe && (
                    <>
                      <div className="flex flex-col items-center">
                         {msg.senderProfilePicture && (
                           <Avatar src={msg.senderProfilePicture} className="w-6 h-6 mb-1 opacity-60" />
                         )}
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                           onClick={() => setActiveMenuMessageId(activeMenuMessageId === msg.id ? null : msg.id)}
                         >
                           <MoreVertical className="h-4 w-4 text-slate-400" />
                         </Button>
                      </div>
                      {activeMenuMessageId === msg.id && (
                        <div className="absolute left-12 top-0 z-50 min-w-[180px] bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                          <button
                            onClick={() => {
                              onMarkUnread?.(msg.id);
                              setActiveMenuMessageId(null);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left text-sm text-slate-700"
                          >
                            <Mail className="h-4 w-4" />
                            Mark as Unread
                          </button>
                          <div className="border-t border-gray-100" />
                          <button
                            onClick={() => {
                              onDeleteMessage?.(msg.id);
                              setActiveMenuMessageId(null);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left text-sm text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  <div className={cn(
                    "px-6 py-4 rounded-[2rem] text-sm leading-relaxed shadow-sm transition-all hover:shadow-md",
                    isMe 
                      ? "bg-teal-600 text-white rounded-tr-none shadow-teal-100/30" 
                      : "bg-white text-slate-700 rounded-tl-none border border-gray-50"
                  )}>
                    {msg.content}
                  </div>

                  {isMe && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setActiveMenuMessageId(activeMenuMessageId === msg.id ? null : msg.id)}
                      >
                        <MoreVertical className="h-4 w-4 text-slate-400" />
                      </Button>
                      {activeMenuMessageId === msg.id && (
                        <div className="absolute right-12 top-0 z-50 min-w-[140px] bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                          <button
                            onClick={() => {
                              onDeleteMessage?.(msg.id);
                              setActiveMenuMessageId(null);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left text-sm text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2 px-3">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter opacity-60">
                    {msg.timestamp && msg.timestamp !== "0001-01-01T00:00:00" 
                      ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : ''}
                  </span>
                  {isMe && (
                    <div className="flex items-center text-teal-500">
                      {msg.isRead ? <CheckCheck size={12} className="stroke-[3]" /> : <Check size={12} className="stroke-[3]" />}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
             <div className="mr-auto items-start animate-in fade-in duration-300">
                <TypingIndicator />
             </div>
          )}
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] transition-all">
        <div className="flex items-end gap-3 max-w-6xl mx-auto bg-slate-50 p-2 rounded-[2.5rem] border border-gray-100 focus-within:ring-4 focus-within:ring-teal-500/5 focus-within:bg-white transition-all">
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-12 h-12 rounded-full text-slate-400 hover:text-teal-600 hover:bg-slate-50 transition-all shrink-0"
          >
            <Paperclip size={20} />
          </Button>
          
          <div className="flex-1 relative pb-1">
            <textarea
              className="w-full bg-transparent border-none focus:ring-0 text-slate-700 placeholder:text-slate-400 text-sm font-medium py-3 px-2 resize-none max-h-32 scrollbar-none"
              placeholder="Type your message..."
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </div>

          <div className="flex items-center gap-1 shrink-0 pb-1 pr-1">
             <Button 
              variant="ghost" 
              size="icon" 
              className="w-12 h-12 rounded-full text-slate-400 hover:text-orange-500 hover:bg-slate-50 transition-all"
            >
              <Smile size={20} />
            </Button>
            <Button 
              onClick={handleSend}
              disabled={!inputText.trim()}
              className={cn(
                "w-12 h-12 rounded-full transition-all flex items-center justify-center p-0",
                inputText.trim() 
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-100 scale-100 rotate-0" 
                  : "bg-slate-100 text-slate-300 scale-90 rotate-[-45deg]"
              )}
            >
              <Send size={18} className={cn("transition-transform", inputText.trim() && "translate-x-0.5 -translate-y-0.5")} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

