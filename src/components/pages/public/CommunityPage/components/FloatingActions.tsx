import React from 'react';
import { Plus, MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { CommunityChat } from '@/components/features/messages/CommunityChat';
import { cn } from '@/lib/utils';

interface FloatingActionsProps {
  communityId: string;
  communityName: string;
  isMember: boolean;
  isAdmin: boolean;
  isChatOpen: boolean;
  onChatToggle: () => void;
  onCreatePost: () => void;
  activeTab: string;
}

const FloatingActions: React.FC<FloatingActionsProps> = ({
  communityId,
  communityName,
  isMember,
  isAdmin,
  isChatOpen,
  onChatToggle,
  onCreatePost,
  activeTab,
}) => {
  return (
    <>
      {/* FOOTER CTA (Mobile) */}
      <div className="md:hidden sticky bottom-4 mx-4 mb-4 z-50">
        <Button
          onClick={onCreatePost}
          className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl shadow-xl flex items-center justify-center gap-2 text-lg font-bold transition-transform active:scale-95 border-none"
        >
          <Plus className="w-6 h-6 border-2 rounded-md" />
          {activeTab === 'needs' ? 'Post a Need' : 'Create Post'}
        </Button>
      </div>

      {/* FLOATING CHAT */}
      {(isMember || isAdmin) && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          {isChatOpen && (
            <div className="w-[380px] h-[550px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden mb-2 animate-in slide-in-from-bottom-5 duration-300">
              <div className="bg-teal-600 p-5 flex items-center justify-between text-white shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                    <MessageSquare size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-wider">Community Live Chat</h4>
                    <p className="text-[10px] text-teal-100 font-bold opacity-80">{communityName}</p>
                  </div>
                </div>
                <button
                  onClick={onChatToggle}
                  className="hover:bg-white/10 p-2 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="h-[460px] relative">
                <CommunityChat communityId={communityId} communityName={communityName} />
              </div>
            </div>
          )}

          <Button
            onClick={onChatToggle}
            className={cn(
              "w-16 h-16 rounded-[2rem] shadow-2xl flex items-center justify-center transition-all active:scale-95 border-none",
              isChatOpen
                ? 'bg-slate-900 hover:bg-slate-800 rotate-90'
                : 'bg-teal-600 hover:bg-teal-700 hover:scale-110'
            )}
          >
            {isChatOpen ? <X size={28} className="text-white" /> : <MessageSquare size={28} className="text-white" />}
            {!isChatOpen && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500 border-2 border-white"></span>
              </span>
            )}
          </Button>
        </div>
      )}
    </>
  );
};

export default FloatingActions;
