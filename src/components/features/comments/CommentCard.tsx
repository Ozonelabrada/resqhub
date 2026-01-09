import React from 'react';
import { Button, Avatar, Badge } from '../../ui';
import { ThumbsUp, Reply, MoreVertical, ShieldCheck, Clock, Heart } from 'lucide-react';

interface CommentCardProps {
  userName: string;
  content: string;
  timestamp: string;
  isOwner?: boolean;
  isHelpful?: boolean;
  likesCount: number;
  isLikedByUser: boolean;
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
  likesCount,
  isLikedByUser,
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
    <div className="group relative flex items-start gap-4 p-6 rounded-[2rem] bg-white border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-50/50 transition-all duration-300">
      <Avatar
        className={`w-12 h-12 rounded-2xl font-black text-sm ${
          isOwner ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
        }`}
      >
        {userName ? userName.charAt(0) : '?'}
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="font-black text-slate-900 truncate">{userName}</span>
            {isOwner && (
              <Badge variant="info" className="bg-blue-50 text-blue-600 border-none text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
                Author
              </Badge>
            )}
            {isHelpful && (
              <Badge variant="success" className="bg-emerald-50 text-emerald-600 border-none text-[10px] font-black uppercase tracking-widest px-2 py-0.5 flex items-center gap-1">
                <ShieldCheck size={10} />
                Helpful
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Clock size={12} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{formatTimestamp(timestamp)}</span>
          </div>
        </div>

        <p className="text-slate-600 font-medium leading-relaxed mb-4">
          {content}
        </p>

        <div className="flex items-center gap-6">
          <button
            onClick={onLike}
            disabled={!isAuthenticated}
            className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors ${
              isLikedByUser ? 'text-red-500' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Heart size={14} className={isLikedByUser ? 'fill-current' : ''} />
            {likesCount > 0 && likesCount}
            <span className="ml-1">Like</span>
          </button>

          {isAuthenticated && (
            <button
              onClick={onReply}
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
            >
              <Reply size={14} />
              Reply
            </button>
          )}
        </div>
      </div>

      <button className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-all">
        <MoreVertical size={18} />
      </button>
    </div>
  );
};

export default CommentCard;