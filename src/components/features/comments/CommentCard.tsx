import React from 'react';
import { Button, Avatar, Badge } from '../../ui';
import { ThumbsUp, Reply, MoreVertical, ShieldCheck, Clock, Heart } from 'lucide-react';

interface CommentCardProps {
  userName: string;
  content: string;
  timestamp: string;
  isOwner?: boolean;
  isHelpful?: boolean;
  reactionsCount: number;
  isReactedByUser: boolean;
  onLike: () => void;
  onReply: () => void;
  isAuthenticated: boolean;
}

const CommentCard: React.FC<CommentCardProps> = ({
  userName,
  content,
  timestamp,
  isOwner = false,
  isHelpful = false,
  reactionsCount,
  isReactedByUser,
  onLike,
  onReply,
  isAuthenticated
}) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className="group relative flex items-start gap-3 p-4 rounded-2xl bg-slate-50/50 border border-transparent hover:bg-white hover:border-slate-100 transition-all duration-300">
      <Avatar
        className={`w-9 h-9 rounded-xl font-black text-[10px] shrink-0 shadow-sm ${
          isOwner ? 'bg-teal-600 text-white' : 'bg-white text-slate-600'
        }`}
      >
        {userName ? userName.charAt(0).toUpperCase() : '?'}
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-800 text-xs truncate">@{userName}</span>
            {isOwner && (
              <span className="text-[8px] font-black uppercase tracking-widest text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-md">
                Author
              </span>
            )}
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{formatTimestamp(timestamp)}</span>
        </div>

        <p className="text-slate-600 font-medium text-sm leading-relaxed mb-3">
          {content}
        </p>

        <div className="flex items-center gap-4">
          <button
            onClick={onLike}
            disabled={!isAuthenticated}
            className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${
              isReactedByUser ? 'text-rose-600' : 'text-slate-400 hover:text-rose-600'
            }`}
          >
            <Heart size={12} className={isReactedByUser ? 'fill-current' : ''} />
            Helpful ({reactionsCount || 0})
          </button>

          {isAuthenticated && (
            <button
              onClick={onReply}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
            >
              <Reply size={12} />
              Reply
            </button>
          )}
        </div>
      </div>

      <button className="p-1.5 text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-all">
        <MoreVertical size={14} />
      </button>
    </div>
  );
};

export default CommentCard;