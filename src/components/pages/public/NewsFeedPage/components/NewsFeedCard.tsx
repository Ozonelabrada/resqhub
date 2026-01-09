import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  MoreHorizontal, 
  CheckCircle, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Award,
  Send
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import {
  Button,
  Card,
  Input,
  Badge,
  Avatar,
  Spinner
} from '@/components/ui';
import { cn } from "@/lib/utils";
import type { NewsFeedItem } from '../../PersonalHubPage/personalHub/NewsFeed';
import { CommentsService, type Comment } from '@/services/commentsService';

interface NewsFeedCardProps {
  item: NewsFeedItem;
  onProfileClick?: (user: any) => void;
  onCommunityClick?: (communityName: string) => void;
}

const NewsFeedCard: React.FC<NewsFeedCardProps> = ({ item, onProfileClick, onCommunityClick }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, user, openLoginModal } = useAuth();
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (isCommentsOpen && item.id) {
      loadComments();
    }
  }, [isCommentsOpen, item.id]);

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const data = await CommentsService.getComments(Number(item.id));
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !item.id) return;
    
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    const newCommentContent = commentText.trim();
    setCommentText('');
    setIsSubmittingComment(true);

    // Optimistic UI update
    const optimisticComment: any = {
      id: Date.now(), // temporary id
      reportId: item.id,
      userId: user?.id?.toString() || '',
      comment: newCommentContent,
      parentCommentId: null,
      isEdited: false,
      user: {
        fullName: user?.name || 'Me',
        profilePicture: user?.profilePicture,
        username: 'me'
      },
      replies: [],
      dateCreated: new Date().toISOString(),
      lastModifiedDate: new Date().toISOString(),
      likesCount: 0,
      isLikedByUser: false
    };

    setComments(prev => [optimisticComment, ...prev]);

    try {
      const savedComment = await CommentsService.addComment(Number(item.id), newCommentContent);
      // Replace optimistic comment with actual saved comment
      setComments(prev => prev.map(c => c.id === optimisticComment.id ? savedComment : c));
    } catch (error) {
      // Rollback on error
      setComments(prev => prev.filter(c => c.id !== optimisticComment.id));
      setCommentText(newCommentContent); // restore text
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case 'lost': return { label: t('newsfeed.lost'), color: 'bg-orange-50 text-orange-600 border-orange-100 font-black' };
      case 'found': return { label: t('newsfeed.found'), color: 'bg-emerald-50 text-emerald-600 border-emerald-100 font-black' };
      case 'reunited': return { label: t('newsfeed.reunited'), color: 'bg-teal-50 text-teal-600 border-teal-100 font-black' };
      default: return { label: status, color: 'bg-gray-50 text-gray-600 border-gray-100' };
    }
  };

  const status = getStatusDisplay(item.status);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/item/${item.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.description,
        url: url,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const handleAction = (e: React.MouseEvent, callback: () => void) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    callback();
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (onProfileClick) onProfileClick(item.user);
  };

  const handleCommunityClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (onCommunityClick) onCommunityClick(item.communityName || 'Green Valley Residents');
  };

  return (
    <Card 
      className="group bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      <div 
        onClick={() => navigate(`/reports/${item.id}`)}
        className="flex flex-col md:flex-row cursor-pointer"
      >
        {/* Image Container */}
        <div className="relative w-full md:w-[28rem] h-64 md:h-80 min-h-[16rem] md:min-h-[20rem] overflow-hidden bg-gray-100 border-r border-gray-50">
          {item.images && item.images.length > 0 ? (
            <div className={cn(
              "w-full h-full grid gap-0.5",
              item.images.length === 1 ? "grid-cols-1" : 
              item.images.length === 2 ? "grid-cols-2" :
              "grid-cols-2" 
            )}>
              {item.images.length === 1 ? (
                <img 
                  loading="lazy"
                  src={item.images[0]} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              ) : item.images.length === 2 ? (
                item.images.map((img, idx) => (
                  <img key={idx} src={img} alt="" className="w-full h-full object-cover" />
                ))
              ) : (
                <>
                  <div className="h-full">
                    <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className={cn(
                    "grid gap-0.5 h-full",
                    item.images.length === 3 ? "grid-rows-2" : 
                    item.images.length === 4 ? "grid-rows-3" : 
                    "grid-cols-2 grid-rows-2"
                  )}>
                    {item.images.slice(1).map((img, idx) => (
                      <img key={idx} src={img} alt="" className="w-full h-full object-cover" />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 p-4 text-center">
              <Plus className="w-10 h-10 mb-2 opacity-20" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-black">No Image</span>
            </div>
          )}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className={cn("border shadow-md px-4 py-1.5 font-black uppercase text-[10px] tracking-widest rounded-full", status.color)}>
                {status.label}
            </Badge>
          </div>
          {item.reward?.amount > 0 && (
            <div className="absolute top-4 right-4 bg-orange-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black shadow-lg flex items-center gap-1.5 border border-orange-500">
              <Award className="w-3.5 h-3.5" />
              ${item.reward.amount} {t('common.reward')}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-8 flex flex-col">
          <div className="flex justify-between items-start gap-4 mb-3">
            <div className="flex-1">
              <h3 className="text-2xl font-black text-slate-900 leading-none group-hover:text-teal-600 transition-colors uppercase tracking-tight mb-2">
                {item.title}
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-slate-500 font-bold text-xs">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  {item.location}
                </span>
                <span className="text-slate-200">|</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-500" />
                  {item.timeAgo}
                </span>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-slate-400">
              <MoreHorizontal size={20} />
            </button>
          </div>

          <p className="text-slate-600 line-clamp-2 text-base mt-2 leading-relaxed mb-8">
            {item.description}
          </p>

          <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative group/avatar cursor-pointer" onClick={handleProfileClick}>
                <Avatar 
                  src={item.user?.profilePicture} 
                  alt={item.user?.fullName}
                  className="w-10 h-10 border-2 border-white shadow-md ring-1 ring-slate-100 group-hover/avatar:ring-teal-200 transition-all"
                />
                {item.user?.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-teal-500 rounded-full border-2 border-white p-0.5 shadow-sm">
                    <CheckCircle className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>
              <div className="cursor-pointer" onClick={handleProfileClick}>
                <p className="text-sm font-black text-slate-900 leading-none hover:text-teal-600 transition-colors">{item.user?.fullName || t('common.anonymous')}</p>
                <div className="flex items-center gap-2 mt-1">
                   <p className="text-[11px] font-bold text-slate-400">@{item.user?.username || 'user'}</p>
                   <span className="w-1 h-1 bg-slate-200 rounded-full" />
                   <button 
                     onClick={handleCommunityClick}
                     className="text-[11px] font-black text-teal-600 hover:text-teal-700 underline decoration-teal-200 underline-offset-2"
                   >
                     {item.communityName || 'Green Valley'}
                   </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 md:gap-2">
               <button 
                onClick={(e) => handleAction(e, () => setIsLiked(!isLiked))}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-xs transition-all",
                    isLiked ? "bg-orange-50 text-orange-600" : "text-slate-400 hover:bg-gray-50 hover:text-orange-500"
                )}
               >
                 <ThumbsUp className={cn("w-4 h-4", isLiked && "fill-current")} />
                 <span>{(item.reactionsCount || 0) + (isLiked ? 1 : 0)}</span>
               </button>
               <button 
                onClick={(e) => handleAction(e, () => setIsCommentsOpen(!isCommentsOpen))}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-xs transition-all",
                    isCommentsOpen ? "bg-teal-50 text-teal-600" : "text-slate-400 hover:bg-gray-50 hover:text-teal-500"
                )}
               >
                 <MessageSquare className="w-4 h-4" />
                 <span>{comments.length || item.commentsCount || 0}</span>
               </button>
               <button 
                onClick={handleShare}
                className="p-2 text-slate-400 hover:text-teal-500 transition-colors rounded-xl hover:bg-teal-50"
               >
                 <Share2 className="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Comments Section */}
      {isCommentsOpen && (
        <div className="border-t border-gray-50 bg-gray-50/30 p-8 animate-in slide-in-from-top-2 duration-300">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex gap-4">
              <Avatar src={user?.profilePicture} className="w-10 h-10 border-2 border-white shadow-sm flex-shrink-0" />
              <div className="flex-1 relative">
                <Input 
                   placeholder="Add a helpful comment..." 
                   value={commentText}
                   onChange={(e) => setCommentText(e.target.value)}
                   onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                   className="pr-12 py-6 rounded-2xl border-gray-200 bg-white shadow-sm font-medium"
                />
                <Button 
                   size="icon" 
                   className="absolute right-2 top-1/2 -translate-y-1/2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 w-10 transition-transform active:scale-90"
                   disabled={!commentText.trim() || isSubmittingComment}
                   onClick={handleAddComment}
                >
                  {isSubmittingComment ? <Spinner size="sm" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6 pt-2">
               {loadingComments ? (
                 <div className="flex justify-center py-4">
                   <Spinner size="md" className="text-teal-600" />
                 </div>
               ) : comments.length > 0 ? (
                 comments.map((comment) => (
                   <div key={comment.id} className="space-y-4">
                     <div className="flex gap-4 group">
                       <Avatar src={comment.user?.profilePicture} className="w-8 h-8 flex-shrink-0" />
                       <div className="flex-1 space-y-2">
                         <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                           <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-black text-slate-900 tracking-tight">
                                {comment.user?.fullName || comment.userId || t('common.anonymous')}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">
                                {new Date(comment.dateCreated).toLocaleDateString()}
                              </span>
                           </div>
                           <p className="text-sm text-slate-600 leading-relaxed">
                             {comment.comment}
                           </p>
                         </div>
                         <div className="flex items-center gap-4 px-2">
                           <button className="text-[10px] font-black text-slate-400 hover:text-teal-600 uppercase tracking-widest">Reply</button>
                           <button className="text-[10px] font-black text-slate-400 hover:text-orange-600 uppercase tracking-widest">
                             Helpful ({comment.likesCount || 0})
                           </button>
                         </div>
                       </div>
                     </div>

                     {/* Replies */}
                     {comment.replies && comment.replies.length > 0 && (
                       <div className="ml-12 space-y-4 border-l-2 border-slate-50 pl-6">
                         {comment.replies.map((reply) => (
                           <div key={reply.id} className="flex gap-3 group">
                             <Avatar src={reply.user?.profilePicture} className="w-6 h-6 flex-shrink-0" />
                             <div className="flex-1 space-y-1">
                               <div className="bg-white/80 p-3 rounded-2xl shadow-sm border border-gray-50">
                                 <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-black text-slate-800 tracking-tight">
                                      {reply.user?.fullName || reply.userId || t('common.anonymous')}
                                    </span>
                                    <span className="text-[8px] text-slate-400 font-bold uppercase">
                                      {new Date(reply.dateCreated).toLocaleDateString()}
                                    </span>
                                 </div>
                                 <p className="text-xs text-slate-600 leading-relaxed">
                                   {reply.comment}
                                 </p>
                               </div>
                             </div>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                 ))
               ) : (
                 <div className="text-center py-4 text-slate-400 text-sm italic">
                   No comments yet. Be the first to help!
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default NewsFeedCard;
