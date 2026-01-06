import React, { useState } from 'react';
import { 
  Send, 
  Smile, 
  MoreVertical, 
  Image as ImageIcon,
  Paperclip,
  Check,
  CheckCheck,
  ChevronLeft
} from 'lucide-react';
import { 
  Avatar, 
  Button,
  Input,
  ScrollArea
} from '../../ui';
import { cn } from "@/lib/utils";
import type { Conversation, Message } from './types';

interface ChatWindowProps {
  conversation: Conversation | null;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onBack?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  messages,
  onSendMessage,
  onBack
}) => {
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8 text-center">
        <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
           <Send className="w-10 h-10 text-teal-600 opacity-20" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Select a Conversation</h3>
        <p className="text-slate-500 max-w-xs font-medium">Choose a thread to start coordinating with your community members.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 relative">
      {/* Chat Header */}
      <div className="p-4 md:p-6 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="lg:hidden">
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </Button>
          )}
          <div className="relative">
            <Avatar 
              src={conversation.user.profilePicture} 
              alt={conversation.user.fullName}
              className="w-12 h-12 border-2 border-white shadow-md ring-1 ring-slate-100"
            />
            {conversation.user.isOnline && (
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
            )}
          </div>
          <div>
            <h4 className="text-base font-black text-slate-900 leading-none mb-1">{conversation.user.fullName}</h4>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
              {conversation.user.isOnline ? 'Online Now' : 'Last active 2h ago'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-teal-600 hover:bg-teal-50">
            <MoreVertical size={20} />
          </Button>
        </div>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          {messages.map((msg, idx) => {
          const isMe = msg.senderId === 'me';
          return (
            <div key={msg.id} className={cn(
              "flex flex-col max-w-[80%]",
              isMe ? "ml-auto items-end" : "mr-auto items-start"
            )}>
              <div className={cn(
                "px-6 py-4 rounded-[2rem] text-sm leading-relaxed shadow-sm",
                isMe 
                  ? "bg-teal-600 text-white rounded-tr-none shadow-teal-100" 
                  : "bg-white text-slate-700 rounded-tl-none border border-gray-100"
              )}>
                {msg.text}
              </div>
              <div className="flex items-center gap-2 mt-2 px-2">
                <span className="text-[10px] font-black text-slate-400 uppercase">{msg.timestamp}</span>
                {isMe && (
                   <span className="text-teal-600">
                     {msg.status === 'read' ? <CheckCheck size={12} /> : <Check size={12} />}
                   </span>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <div className="flex items-end gap-3 max-w-6xl mx-auto bg-slate-50 p-2 rounded-[2.5rem] border border-gray-100 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-12 h-12 rounded-full text-slate-400 hover:text-teal-600 hover:bg-white transition-all shrink-0"
          >
            <Paperclip size={20} />
          </Button>
          
          <div className="flex-1 relative pb-1">
            <textarea
              className="w-full bg-transparent border-none focus:ring-0 text-slate-700 placeholder:text-slate-400 text-sm font-medium py-3 px-2 resize-none max-h-32"
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
              className="w-12 h-12 rounded-full text-slate-400 hover:text-orange-500 hover:bg-white transition-all"
            >
              <Smile size={20} />
            </Button>
            <Button 
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="w-12 h-12 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-100 transition-all active:scale-90 flex items-center justify-center p-0"
            >
              <Send size={18} className="-mr-0.5 mt-0.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
