import React, { useState, useEffect } from 'react';
import { Card, Avatar, Button, ShadcnBadge as Badge } from '@/components/ui';
import { Newspaper, Shield, Trash2, Pin, MessageSquare, Heart, ChevronDown, ChevronUp, AlertCircle, Search, Info, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils';
import CommentSection from '@/components/features/comments/CommentSection';
import type { CommunityPost } from '@/types/community';
import { CommunityService } from '@/services/communityService';
import { ReactionsService } from '@/services/reactionsService';
import { useAuth } from '@/context/AuthContext';
import { CreateReportModal } from '@/components/modals';

interface CommunityFeedProps {
  communityId: string;
  posts: CommunityPost[];
  isMember: boolean;
  isAdmin?: boolean;
  onRefresh: () => Promise<void>;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  communityId,
  posts,
  isMember,
  isAdmin,
  onRefresh
}) => {
  const { isAuthenticated, user, openLoginModal } = useAuth();
  const [filter, setFilter] = useState<'all' | 'lost' | 'found' | 'news' | 'announcement' | 'discussion'>('all');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState<string>('discussion');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});

  const canPost = isAuthenticated && (isMember || isAdmin);

  // Sync postType with filter when filter changes (except for 'all')
  useEffect(() => {
    if (filter !== 'all') {
      setPostType(filter);
    } else {
      setPostType('discussion');
    }
  }, [filter]);

  const toggleComments = (postId: number) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const NEED_TYPES = ['Resource', 'Service', 'Volunteer', 'Request', 'Need'];
  
  const filteredPosts = posts.filter(p => {
    // Exclude need types from the main feed to keep purposes distinct
    const isNeed = NEED_TYPES.includes(p.reportType || '');
    if (isNeed) return false;
    
    return filter === 'all' || p.reportType?.toLowerCase() === filter.toLowerCase();
  });

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (!postTitle.trim() || !postContent.trim()) return;
    setIsSubmitting(true);
    try {
      await CommunityService.createPost(communityId, {
        title: postTitle,
        description: postContent,
        reportType: postType.charAt(0).toUpperCase() + postType.slice(1)
      } as any);
      setPostTitle('');
      setPostContent('');
      await onRefresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostReaction = async (postId: number) => {
    if (!isAuthenticated || !user?.id) {
      openLoginModal();
      return;
    }
    try {
      await ReactionsService.addReportReaction(postId, String(user.id), 'heart');
      await onRefresh();
    } catch (err) {
      console.error('Failed to react to post:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Feed Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2 flex items-center gap-3">
            <Newspaper className="text-teal-600" size={32} />
            Community Pulse
          </h2>
          <p className="text-slate-500 font-medium italic">General updates, alerts, and discussions from your neighbors.</p>
        </div>
        
        <Button 
          onClick={() => {
            if (!isAuthenticated) {
              openLoginModal();
              return;
            }
            setIsReportModalOpen(true);
          }}
          className="h-12 px-8 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-100 font-black text-[11px] uppercase tracking-widest border-none shrink-0"
        >
          <Plus className="w-4 h-4 mr-2 border-2 rounded-md" />
          Create Report
        </Button>
      </div>

      {/* Quick Filters - Pill Style consistent with NewsFeed */}
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {(['all', 'lost', 'found', 'news', 'announcement', 'discussion'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                filter === f 
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-100" 
                  : "bg-white text-slate-400 hover:bg-slate-50 border border-slate-100 shadow-sm"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => {
            if (!isAuthenticated) {
              openLoginModal();
              return;
            }
            setIsReportModalOpen(true);
          }}
          className="hidden lg:flex items-center gap-2 h-10 px-4 rounded-xl text-teal-600 font-bold text-xs bg-teal-50 hover:bg-teal-100 border-none transition-all mb-2"
        >
          <Plus className="w-4 h-4" />
          New Report
        </Button>
      </div>

      {/* Posts List - Standardized Layout */}
      <div className="space-y-6">
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <Card key={post.id} className="p-8 border-none shadow-sm rounded-[2.5rem] bg-white group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-teal-50">
              <div className="flex items-start gap-4 md:gap-6">
                <Avatar className="w-12 h-12 border-4 border-slate-50 shadow-md transition-transform shrink-0 bg-slate-100 uppercase font-black">
                  {post.user?.profilePicture ? (
                    <img src={post.user.profilePicture} alt={post.user.username} className="w-full h-full object-cover" />
                  ) : (
                    post.user?.username?.charAt(0) || '?'
                  )}
                </Avatar>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-slate-800 text-base">@{post.user?.username}</span>
                      <Badge className={cn(
                        "px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-[0.1em] border-none",
                        post.reportType?.toLowerCase() === 'lost' ? 'bg-orange-600 text-white' : 
                        post.reportType?.toLowerCase() === 'found' ? 'bg-emerald-600 text-white' :
                        post.reportType?.toLowerCase() === 'news' ? 'bg-teal-600 text-white' :
                        'bg-blue-600 text-white'
                      )}>
                        {post.reportType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{formatDate(post.dateCreated)}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-black text-xl text-slate-900 mb-2 group-hover:text-teal-600 transition-colors uppercase tracking-tight leading-tight">{post.title}</h3>
                  <p className="text-slate-600 font-medium text-base mb-4 leading-relaxed line-clamp-4">{post.description}</p>
                  
                  {/* Images Display */}
                  {post.images && post.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                      {post.images.map(img => (
                        <div key={img.id} className="aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-50">
                          <img 
                            src={img.imageUrl.startsWith('http') ? img.imageUrl : `${import.meta.env.VITE_APP_API_BASE_URL || 'https://resqhub-be.onrender.com'}/${img.imageUrl}`} 
                            alt={post.title} 
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {isAdmin && (
                    <div className="flex items-center gap-2 mb-6 p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-1.5 ml-1">
                        <Shield size={10} className="text-teal-600" />
                        Mod Tools
                      </span>
                      <Button variant="ghost" size="sm" className="h-8 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-teal-600 hover:bg-white gap-1.5 border-none shadow-none">
                        <Pin size={12} /> Pin
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-600 hover:bg-white gap-1.5 border-none shadow-none">
                        <Trash2 size={12} /> Delete
                      </Button>
                    </div>
                  )}

                  {/* Interaction Bar */}
                  <div className="flex items-center gap-6 py-4 border-t border-slate-50 mt-2">
                    <button 
                      onClick={() => handlePostReaction(post.id)}
                      className="flex items-center gap-2 group/btn"
                    >
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                        post.isReacted
                          ? "bg-rose-50 text-rose-500" 
                          : "bg-slate-50 text-slate-400 group-hover/btn:bg-rose-50 group-hover/btn:text-rose-500"
                      )}>
                        <Heart size={18} className={post.isReacted ? "fill-current" : ""} />
                      </div>
                      <span className={cn(
                        "text-xs font-black transition-colors uppercase tracking-widest",
                        post.isReacted ? "text-rose-600" : "text-slate-500 group-hover/btn:text-rose-600"
                      )}>
                        {post.reactionsCount || 0}
                      </span>
                    </button>

                    <button 
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-2 group/btn"
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/btn:bg-teal-50 group-hover/btn:text-teal-600 transition-all">
                        <MessageSquare size={18} />
                      </div>
                      <span className="text-xs font-black text-slate-500 group-hover/btn:text-teal-600 transition-colors uppercase tracking-widest">{post.commentsCount || 0}</span>
                      <div className="ml-1 text-slate-300">
                        {expandedComments[post.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </div>
                    </button>
                  </div>
                  
                  {expandedComments[post.id] && (
                    <div className="pt-6 border-t border-slate-50 mt-0 px-2 animate-in slide-in-from-top-4 duration-300">
                      <CommentSection 
                        itemId={post.id} 
                        itemType={post.reportType?.toLowerCase() === 'found' ? 'found' : 'lost'} 
                        itemOwnerId={Number(post.userId) || 0} 
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Newspaper className="text-slate-200" size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">No matching posts</h3>
            <p className="text-slate-400 font-medium mt-2">Be the first to share something with this community!</p>
          </div>
        )}
      </div>

      <CreateReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        onSuccess={onRefresh}
        communityId={communityId}
      />
    </div>
  );
};
