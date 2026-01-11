import React, { useState, useEffect, useRef } from 'react';
import { 
  Button, 
  Textarea, 
  Avatar,
  Alert,
  AlertDescription,
  Spinner,
  Input,
  Menu
} from '../../ui';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { CommentsService, type Comment } from '../../../services/commentsService';
import { ReactionsService } from '../../../services/reactionsService';
import { 
  MessageSquare, 
  Send, 
  LogIn,
  Clock,
  Heart,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Edit2,
  Trash2,
  Flag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from '@/utils/formatter';
import ReportAbuseModal from '../../modals/ReportAbuseModal';

interface CommentSectionProps {
  itemId: number;
  itemType: 'lost' | 'found';
  itemOwnerId: string | number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ itemId, itemType, itemOwnerId }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user, openLoginModal } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<number | null>(null);

  // Load comments on component mount
  useEffect(() => {
    loadComments(1, false);
  }, [itemId]);

  const loadComments = async (pageNum: number, isLoadMore: boolean) => {
    if (!isLoadMore) setIsLoading(true);
    setError(null);
    try {
      const pageSize = 10;
      const { comments: data, totalCount: serverTotal } = await CommentsService.getComments(itemId, pageNum, pageSize);
      if (isLoadMore) {
        setComments((prev) => {
          const existingIds = new Set(prev.map((c) => c.id));
          const newItems = data.filter((d) => !existingIds.has(d.id));
          const merged = [...prev, ...newItems];
          setHasMore(merged.length < serverTotal);
          return merged;
        });
      } else {
        setComments(data);
        setHasMore(data.length < serverTotal);
      }

      setTotalCount(serverTotal);
      setPage(pageNum);
    } catch (err: any) {
      setError('Failed to load comments. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    loadComments(page + 1, true);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !isAuthenticated || !user?.id) return;

    setIsSubmitting(true);
    const originalComment = newComment;
    
    // Optimistic UI
    const optimisticComment: any = {
      id: Date.now(),
      comment: newComment,
      userId: user.id,
      dateCreated: new Date().toISOString(),
      user: {
        username: user.username || 'me',
        profilePicture: user.profilePicture,
        fullName: user.name || ''
      },
      replies: [],
      reactionsCount: 0,
      isReactedByUser: false
    };

    setComments(prev => [optimisticComment, ...prev]);
    setTotalCount(prev => prev + 1);
    setNewComment('');

    try {
      const addedComment = await CommentsService.addComment(itemId, String(user.id), originalComment);
      setComments(prev => prev.map(c => c.id === optimisticComment.id ? addedComment : c));
    } catch (err: any) {
      setComments(prev => prev.filter(c => c.id !== optimisticComment.id));
      setTotalCount(prev => prev - 1);
      setNewComment(originalComment);
      setError('Failed to post comment. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (parentCommentId: number) => {
    if (!replyText.trim() || !isAuthenticated || !user?.id) return;

    setIsSubmitting(true);
    const originalReply = replyText;
    setReplyText('');
    setReplyingTo(null);

    // Optimistic UI
    const optimisticReply: any = {
      id: Date.now(),
      comment: originalReply,
      userId: user.id,
      parentCommentId,
      dateCreated: new Date().toISOString(),
      user: {
        username: user.username || 'me',
        profilePicture: user.profilePicture,
        fullName: user.name || ''
      },
      replies: [],
      reactionsCount: 0,
      isReactedByUser: false
    };

    setComments(prev => prev.map(c => {
      if (c.id === parentCommentId) {
        return { ...c, replies: [...(c.replies || []), optimisticReply] };
      }
      return c;
    }));
    setTotalCount(prev => prev + 1);
    setExpandedReplies(prev => new Set(prev).add(parentCommentId));

    try {
      const savedReply = await CommentsService.addComment(itemId, String(user.id), originalReply, parentCommentId);
      setComments(prev => prev.map(c => {
        if (c.id === parentCommentId) {
          return {
            ...c,
            replies: c.replies.map(r => r.id === optimisticReply.id ? savedReply : r)
          };
        }
        return c;
      }));
    } catch (err) {
      setComments(prev => prev.map(c => {
        if (c.id === parentCommentId) {
          return { ...c, replies: c.replies.filter(r => r.id !== optimisticReply.id) };
        }
        return c;
      }));
      setTotalCount(prev => prev - 1);
      setReplyText(originalReply);
      setReplyingTo(parentCommentId);
      console.error('Failed to reply:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await CommentsService.deleteComment(commentId);
      
      const removeComment = (list: Comment[]): Comment[] => {
        return list.filter(c => c.id !== commentId).map(c => ({
          ...c,
          replies: c.replies ? removeComment(c.replies) : []
        }));
      };
      
      setComments(prev => removeComment(prev));
      setTotalCount(prev => prev - 1);
    } catch (err) {
      console.error('Failed to delete comment:', err);
      setError('Failed to delete comment. Please try again.');
    }
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!editText.trim()) return;
    
    try {
      setIsSubmitting(true);
      const updated = await CommentsService.updateComment(commentId, editText);
      
      const updateList = (list: Comment[]): Comment[] => {
        return list.map(c => {
          if (c.id === commentId) {
            return { ...c, comment: editText };
          }
          return {
            ...c,
            replies: c.replies ? updateList(c.replies) : []
          };
        });
      };
      
      setComments(prev => updateList(prev));
      setEditingId(null);
      setEditText('');
    } catch (err) {
      console.error('Failed to update comment:', err);
      setError('Failed to update comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportComment = (commentId: number) => {
    setReportingCommentId(commentId);
    setIsReportModalOpen(true);
  };

  const handleToggleLike = async (commentId: number) => {
    if (!isAuthenticated || !user?.id) return;

    const findComment = (list: Comment[]): Comment | undefined => {
      for (const c of list) {
        if (c.id === commentId) return c;
        if (c.replies && c.replies.length > 0) {
          const found = findComment(c.replies);
          if (found) return found;
        }
      }
      return undefined;
    };

    const targetComment = findComment(comments);
    if (!targetComment) return;

    const isAlreadyReacted = !!targetComment.isReacted;

    // Optimistic UI
    const updateComments = (list: Comment[]): Comment[] => {
      return list.map(c => {
        if (c.id === commentId) {
          return { 
            ...c, 
            isReactedByUser: !isAlreadyReacted,
            reactionsCount: (c.reactionsCount || 0) + (isAlreadyReacted ? -1 : 1)
          };
        }
        if (c.replies && c.replies.length > 0) {
          return { ...c, replies: updateComments(c.replies) };
        }
        return c;
      });
    };

    setComments(prev => updateComments(prev));

    try {
      if (isAlreadyReacted) {
        await ReactionsService.removeCommentReaction(commentId, String(user.id));
      } else {
        await ReactionsService.addCommentReaction(commentId, String(user.id), 'heart');
      }
    } catch (err) {
      setComments(prev => updateComments(prev)); // Rollback (simplistic)
      console.error('Error toggling reaction:', err);
    }
  };

  const toggleReplies = (commentId: number) => {
    setExpandedReplies(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  };

  return (
    <div className="w-full space-y-6">
      {error && (
        <Alert variant="error" className="rounded-2xl">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {isAuthenticated ? (
        <div className="flex gap-4">
          <Avatar src={user?.profilePicture} className="w-10 h-10 border-2 border-white shadow-sm flex-shrink-0 rounded-xl" />
          <div className="flex-1 relative">
            <Input 
               placeholder="Add a helpful comment..." 
               value={newComment}
               onChange={(e) => setNewComment(e.target.value)}
               onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
               className="pr-12 py-6 rounded-2xl border-gray-200 bg-white shadow-sm font-medium"
            />
            <Button 
               size="icon" 
               className="absolute right-2 top-1/2 -translate-y-1/2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 w-10"
               disabled={!newComment.trim() || isSubmitting}
               onClick={handleSubmitComment}
            >
              {isSubmitting ? <Spinner size="sm" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-[2rem] bg-slate-50 border border-dashed border-slate-200 text-center">
          <p className="text-sm font-bold text-slate-500 mb-4">Sign in to join the discussion</p>
          <Button onClick={() => openLoginModal()} className="bg-teal-600 rounded-xl px-6">Sign In</Button>
        </div>
      )}

      {/* List */}
      <div className="space-y-6 pt-2">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner size="md" className="text-teal-600" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm italic bg-slate-50/50 rounded-[2rem]">
            No comments yet. Be the first to help!
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <RenderComment 
                key={comment.id}
                comment={comment}
                itemOwnerId={itemOwnerId}
                isAuthenticated={isAuthenticated}
                user={user}
                onReaction={handleToggleLike}
                onReplyClick={(id) => setReplyingTo(replyingTo === id ? null : id)}
                isReplying={replyingTo === comment.id}
                replyText={replyText}
                onReplyChange={setReplyText}
                onReplySubmit={handleReplySubmit}
                isSubmitting={isSubmitting}
                expandedReplies={expandedReplies}
                onToggleReplies={toggleReplies}
                onDelete={handleDeleteComment}
                onEdit={(id, text) => {
                  setEditingId(id);
                  setEditText(text);
                }}
                editingId={editingId}
                editText={editText}
                onEditChange={setEditText}
                onUpdate={handleUpdateComment}
                onCancelEdit={() => setEditingId(null)}
                onReport={handleReportComment}
              />
            ))}

            {hasMore && (
              <Button 
                variant="ghost" 
                onClick={handleLoadMore}
                className="w-full h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all mt-4"
              >
                Load more comments
              </Button>
            )}
          </div>
        )}
      </div>

      <ReportAbuseModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetId={reportingCommentId || 0}
        targetType="comment"
      />
    </div>
  );
};

interface RenderCommentProps {
  comment: Comment;
  itemOwnerId: string | number;
  isAuthenticated: boolean;
  user: any;
  onReaction: (id: number) => void;
  onReplyClick: (id: number) => void;
  isReplying: boolean;
  replyText: string;
  onReplyChange: (val: string) => void;
  onReplySubmit: (parentId: number) => void;
  isSubmitting: boolean;
  expandedReplies: Set<number>;
  onToggleReplies: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, text: string) => void;
  editingId: number | null;
  editText: string;
  onEditChange: (val: string) => void;
  onUpdate: (id: number) => void;
  onCancelEdit: () => void;
  onReport: (id: number) => void;
  isReply?: boolean;
}

const RenderComment: React.FC<RenderCommentProps> = ({ 
  comment, 
  itemOwnerId,
  isAuthenticated, 
  user,
  onReaction,
  onReplyClick,
  isReplying,
  replyText,
  onReplyChange,
  onReplySubmit,
  isSubmitting,
  expandedReplies,
  onToggleReplies,
  onDelete,
  onEdit,
  editingId,
  editText,
  onEditChange,
  onUpdate,
  onCancelEdit,
  onReport,
  isReply = false
}) => {
  const menuRef = useRef<any>(null);

  if (comment.isAbusive) return null;

  const isOwner = user?.id && String(comment.userId) === String(user.id);
  const isEditing = editingId === comment.id;

  const menuModel = isOwner ? [
    {
      label: 'Edit',
      icon: <Edit2 className="w-4 h-4" />,
      command: () => onEdit(comment.id, comment.comment)
    },
    {
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4 text-red-500" />,
      command: () => onDelete(comment.id)
    }
  ] : [
    {
      label: 'Report Abuse',
      icon: <Flag className="w-4 h-4 text-red-500" />,
      command: () => onReport(comment.id)
    }
  ];

  return (
    <div className={cn("space-y-4", isReply && "ml-10 border-l-2 border-slate-50 pl-6")}>
      <div className="flex gap-4 group">
        <Avatar src={comment.user?.profilePicture} className={cn("flex-shrink-0 rounded-xl border border-white shadow-sm", isReply ? "w-8 h-8" : "w-10 h-10")} />
        <div className="flex-1 space-y-2">
          <div className={cn("p-4 rounded-3xl shadow-sm border border-gray-100 relative", isReply ? "bg-white/80" : "bg-white")}>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900 tracking-tight">
                  {comment.user?.username || 'user'}
                </span>
                {comment.userId && String(comment.userId) === String(itemOwnerId) && (
                  <span className="bg-teal-50 text-teal-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-teal-100">
                    Author
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  {formatDistanceToNow(new Date(comment.dateCreated), { addSuffix: true })}
                </span>
                {isAuthenticated && (
                  <>
                    <button 
                      onClick={(e) => menuRef.current?.toggle(e)}
                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                    <Menu ref={menuRef} model={menuModel} popup />
                  </>
                )}
              </div>
            </div>
            
            {isEditing ? (
              <div className="space-y-2 mt-2">
                <Input 
                  value={editText}
                  onChange={(e) => onEditChange(e.target.value)}
                  className="rounded-xl text-sm"
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 rounded-lg text-xs font-black uppercase text-slate-400"
                    onClick={onCancelEdit}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    className="h-8 rounded-lg bg-teal-600 text-xs font-black uppercase text-white"
                    disabled={!editText.trim() || isSubmitting}
                    onClick={() => onUpdate(comment.id)}
                  >
                    {isSubmitting ? <Spinner size="sm" /> : 'Update'}
                  </Button>
                </div>
              </div>
            ) : (
              <p className={cn("text-slate-600 leading-relaxed", isReply ? "text-xs" : "text-sm")}>
                {comment.comment}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-4 px-2">
            {!isReply && (
              <button 
                onClick={() => onReplyClick(comment.id)}
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest transition-colors",
                  isReplying ? "text-teal-600" : "text-slate-400 hover:text-teal-600"
                )}
              >
                Reply
              </button>
            )}
            <button 
              onClick={() => onReaction(comment.id)}
              className={cn(
                "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest transition-colors",
                comment.isReacted ? "text-rose-600" : "text-slate-400 hover:text-rose-600"
              )}
            >
              <Heart className={cn("w-3 h-3", comment.isReacted && "fill-current")} />
              Helpful ({comment.reactionsCount || 0})
            </button>
            
            {comment.replies && comment.replies.length > 0 && (
              <button 
                onClick={() => onToggleReplies(comment.id)}
                className="text-[10px] font-black text-teal-600 hover:text-teal-700 uppercase tracking-widest flex items-center gap-1"
              >
                {expandedReplies.has(comment.id) ? 'Hide Replies' : `Show Replies (${comment.replies.length})`}
              </button>
            )}
          </div>

          {isReplying && (
            <div className="mt-4 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <Avatar src={user?.profilePicture} className="w-8 h-8 flex-shrink-0 rounded-lg" />
              <div className="flex-1 relative">
                <Input 
                  autoFocus
                  placeholder={`Reply to ${comment.user?.username || 'user'}...`}
                  value={replyText}
                  onChange={(e) => onReplyChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && onReplySubmit(comment.id)}
                  className="pr-10 py-4 rounded-2xl border-gray-200 bg-white shadow-sm text-sm"
                />
                <Button 
                  size="icon" 
                  variant="ghost"
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-teal-600 hover:text-teal-700 h-8 w-8"
                  disabled={!replyText.trim() || isSubmitting}
                  onClick={() => onReplySubmit(comment.id)}
                >
                  {isSubmitting ? <Spinner size="sm" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && expandedReplies.has(comment.id) && (
        <div className="space-y-4">
          {comment.replies.map(reply => (
            <RenderComment 
              key={reply.id}
              comment={reply}
              itemOwnerId={itemOwnerId}
              isAuthenticated={isAuthenticated}
              user={user}
              onReaction={onReaction}
              onReplyClick={onReplyClick}
              isReplying={false}
              replyText=""
              onReplyChange={() => {}}
              onReplySubmit={() => {}}
              isSubmitting={isSubmitting}
              expandedReplies={expandedReplies}
              onToggleReplies={onToggleReplies}
              isReply={true}
              onDelete={onDelete}
              onEdit={onEdit}
              editingId={editingId}
              editText={editText}
              onEditChange={onEditChange}
              onUpdate={onUpdate}
              onCancelEdit={onCancelEdit}
              onReport={onReport}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;