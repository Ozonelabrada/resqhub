import React, { useState } from 'react';
import { EventData } from '../hooks/useEventData';
import { Button, Avatar } from '@/components/ui';
import { Heart, MessageCircle, Send } from 'lucide-react';

interface EventDiscussionProps {
  event: EventData;
  userFullName?: string;
}

/**
 * Event discussion/comments tab component
 * <80 lines - manages event comments and discussion
 */
const EventDiscussion: React.FC<EventDiscussionProps> = ({ event, userFullName }) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmitComment = () => {
    // TODO: Call API to submit comment
    setNewComment('');
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
        <MessageCircle size={20} />
        Discussion ({event?.comments?.length || 0})
      </h3>

      {/* Comment Input */}
      <div className="flex gap-3">
        <Avatar className="w-10 h-10 rounded-lg bg-teal-100 text-teal-600 font-bold text-sm flex-shrink-0">
          {userFullName?.charAt(0) || 'U'}
        </Avatar>
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Share your thoughts about this event..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          />
          <Button
            onClick={handleSubmitComment}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl px-4 py-3"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {event?.comments?.map((comment) => (
          <div key={comment.id} className="flex gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
            <Avatar className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 font-bold text-sm flex-shrink-0">
              {comment.avatar || comment.author.charAt(0)}
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="font-bold text-slate-800 text-sm">{comment.author}</p>
                <p className="text-xs text-slate-500">{comment.createdAt}</p>
              </div>
              <p className="text-slate-700 text-sm mb-2">{comment.content}</p>
              <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors">
                <Heart size={14} />
                Like {comment.likes ? `(${comment.likes})` : ''}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventDiscussion;
