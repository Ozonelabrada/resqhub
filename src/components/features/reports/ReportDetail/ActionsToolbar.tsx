import React, { useState } from 'react';
import { ThumbsUp, MessageSquare, Share2, Bookmark, Flag } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

interface ActionsToolbarProps {
  reportId: number;
  reactionCount: number;
  commentsCount: number;
  onCommentClick: () => void;
  onShareClick: () => void;
  onReportClick: () => void;
}

const ActionsToolbar: React.FC<ActionsToolbarProps> = ({
  reactionCount,
  commentsCount,
  onCommentClick,
  onShareClick,
  onReportClick
}) => {
  const { isAuthenticated, openLoginModal } = useAuth();
  const { isFeatureEnabled } = useFeatureFlags();
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(reactionCount);

  const handleLike = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    // Optimistic update
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
    // TODO: Call API
  };

  return (
    <div className="flex items-center justify-between py-4 border-y border-slate-100">
      <div className="flex items-center gap-1 md:gap-4">
        {isFeatureEnabled('reactions') && (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center gap-2 px-2 md:px-3",
              isLiked ? "text-teal-600 bg-teal-50" : "text-slate-600"
            )}
            onClick={handleLike}
          >
            <ThumbsUp className={cn("h-5 w-5", isLiked && "fill-current")} />
            <span className="font-medium">{likes}</span>
          </Button>
        )}

        {isFeatureEnabled('comments') && (
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 px-2 md:px-3 text-slate-600"
            onClick={onCommentClick}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="font-medium">{commentsCount}</span>
          </Button>
        )}

        {isFeatureEnabled('sharing') && (
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 px-2 md:px-3 text-slate-600"
            onClick={onShareClick}
          >
            <Share2 className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-600 px-2"
          onClick={() => {}}
        >
          <Bookmark className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-400 px-2 hover:text-red-500"
          onClick={onReportClick}
        >
          <Flag className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ActionsToolbar;
