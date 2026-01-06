import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Textarea, 
  Avatar, 
  Badge, 
  Alert,
  Spinner
} from '../../ui';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { CommentsService, type Comment } from '../../../services/commentsService';
import { 
  MessageSquare, 
  Send, 
  LogIn, 
  AlertCircle, 
  Clock, 
  ThumbsUp, 
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import CommentCard from './CommentCard';

interface CommentSectionProps {
  itemId: number;
  itemType: 'lost' | 'found';
  itemOwnerId: number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ itemId, itemType, itemOwnerId }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user, openLoginModal } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load comments on component mount
  useEffect(() => {
    loadComments();
  }, [itemId]);

  const loadComments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await CommentsService.getComments(itemId);
      setComments(data);
    } catch (err: any) {
      setError('Failed to load comments. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !isAuthenticated) return;

    setIsSubmitting(true);
    try {
      const addedComment = await CommentsService.addComment(itemId, newComment);
      setComments(prev => [addedComment, ...prev]);
      setNewComment('');
    } catch (err: any) {
      setError('Failed to post comment. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleHelpful = async (commentId: number) => {
    if (!isAuthenticated) return;
    try {
      await CommentsService.toggleHelpful(commentId);
      setComments(prev => prev.map(c => 
        c.id === commentId ? { ...c, isHelpful: !c.isHelpful } : c
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleLike = async (commentId: number) => {
    if (!isAuthenticated) return;
    try {
      await CommentsService.toggleLike(commentId);
      setComments(prev => prev.map(c => 
        c.id === commentId ? { 
          ...c, 
          isLikedByUser: !c.isLikedByUser,
          likesCount: c.isLikedByUser ? c.likesCount - 1 : c.likesCount + 1
        } : c
      ));
    } catch (err) {
      console.error(err);
    }
  };

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
    <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
      <div className="p-8 md:p-10">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <MessageSquare size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">
                Community Discussion
              </h3>
              <p className="text-slate-500 font-medium text-sm">
                {comments.length} {comments.length === 1 ? 'comment' : 'comments'} shared by the community
              </p>
            </div>
          </div>
          <Badge 
            variant={itemType === 'lost' ? 'error' : 'success'} 
            className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest"
          >
            {itemType === 'lost' ? 'Lost Item' : 'Found Item'}
          </Badge>
        </div>

        {error && (
          <Alert variant="error" title="Error" className="mb-8 rounded-3xl">
            {error}
          </Alert>
        )}

        {/* Comment Input Section */}
        {isAuthenticated ? (
          <div className="mb-12 p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 group focus-within:border-blue-200 transition-all">
            <div className="flex items-start gap-4">
              <Avatar
                className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-sm"
              >
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
              <div className="flex-1">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={`Share information about this ${itemType} item... Any tips or suggestions?`}
                  className="bg-transparent border-none focus:ring-0 p-0 text-slate-900 font-medium placeholder:text-slate-400 min-h-[100px] resize-none"
                  maxLength={500}
                />
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200/60">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {newComment.length}/500 characters
                    </span>
                  </div>
                  <Button
                    className="rounded-2xl px-8 py-3 h-auto font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-xl shadow-blue-100"
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <Spinner size="sm" variant="white" />
                    ) : (
                      <Send size={14} />
                    )}
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-12 p-8 rounded-[2.5rem] bg-blue-600 text-white shadow-2xl shadow-blue-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-white/10 blur-[80px] rounded-full" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <LogIn size={24} />
                </div>
                <p className="font-bold text-lg leading-tight max-w-xs">
                  Sign in to join the conversation and help reunite items.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="rounded-xl px-6 py-3 h-auto font-black uppercase tracking-widest text-[10px] text-white hover:bg-white/10"
                  onClick={() => openLoginModal()}
                >
                  Sign In
                </Button>
                <Button
                  className="rounded-xl px-6 py-3 h-auto font-black uppercase tracking-widest text-[10px] bg-white text-blue-600 hover:bg-slate-50"
                  onClick={() => navigate('/signup')}
                >
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-20">
              <Spinner size="lg" className="mx-auto mb-4" />
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center text-slate-200 mx-auto mb-6 shadow-sm">
                <MessageSquare size={40} />
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-2">No comments yet</h4>
              <p className="text-slate-500 font-medium">Be the first to share information about this item!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  userName={comment.userName}
                  content={comment.content}
                  timestamp={comment.timestamp}
                  isOwner={comment.isOwner}
                  isHelpful={comment.isHelpful}
                  likesCount={comment.likesCount}
                  isLikedByUser={comment.isLikedByUser}
                  onLike={() => handleToggleLike(comment.id)}
                  onReply={() => {
                    setNewComment(`@${comment.userName} `);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  isAuthenticated={isAuthenticated}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

      {/* Comment Guidelines */}
      <Divider />
      <div className="text-center">
        <small className="text-gray-500">
          💡 <strong>Community Guidelines:</strong> Share helpful information, be respectful, 
          and avoid sharing personal contact details publicly. Use the contact feature to connect privately.
        </small>
      </div>
    </Card>
  );
};

export default CommentSection;