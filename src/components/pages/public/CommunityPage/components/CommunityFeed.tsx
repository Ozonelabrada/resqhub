import React, { useState, useEffect } from 'react';
import { Card, Avatar, Button, ShadcnBadge as Badge } from '@/components/ui';
import { Newspaper, Shield, Trash2, Pin, MessageSquare, Heart, ChevronDown, ChevronUp, AlertCircle, Search, Info, Plus, Handshake, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils';
import CommentSection from '@/components/features/comments/CommentSection';
import type { CommunityPost } from '@/types/community';
import { CommunityService } from '@/services/communityService';
import { ReactionsService } from '@/services/reactionsService';
import { useAuth } from '@/context/AuthContext';
import { CreateReportModal, ReportDetailModal } from '@/components/modals';
import { MatchModal } from '@/components/modals/MatchModal/MatchModal';

interface CommunityFeedProps {
  communityId: string;
  posts: CommunityPost[];
  isMember: boolean;
  isAdmin?: boolean;
  isModerator?: boolean;
  onRefresh: () => Promise<void>;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  communityId,
  posts,
  isMember,
  isAdmin,
  isModerator,
  onRefresh
}) => {
  const { isAuthenticated, user, openLoginModal } = useAuth();
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState<string>('discussion');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [selectedPostForMatch, setSelectedPostForMatch] = useState<CommunityPost | null>(null);
  const [selectedReportForDetail, setSelectedReportForDetail] = useState<CommunityPost | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const isUserMember = isMember || isAdmin;
  const canPost = isAuthenticated && isUserMember;

  const handleOpenDetail = (post: CommunityPost) => {
    setSelectedReportForDetail(post);
    setIsDetailModalOpen(true);
  };

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
  const RESTRICTED_TYPES = ['news', 'announcement', 'discussion'];
  
  const filteredPosts = posts.filter(p => {
    const postTypeLower = (p.reportType || '').toLowerCase();
    
    // Exclude need types from the main feed
    const isNeed = NEED_TYPES.includes(p.reportType || '');
    if (isNeed) return false;

    // Privacy logic: 
    // If internal: only isAdmin (isPrivileged) can see
    // If community: members and admins can see
    const canSeePrivacy = p.privacy === 'internal' 
      ? isAdmin 
      : (isUserMember || isAdmin);
    
    if (!canSeePrivacy) return false;

    // Restrict News/Announcements/Discussions for non-members
    const isRestrictedType = RESTRICTED_TYPES.includes(postTypeLower);
    if (!isUserMember && isRestrictedType && !isAdmin) return false;
    
    return filter === 'all' || postTypeLower === filter.toLowerCase();
  });

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (!isUserMember) return;
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
    if (!isUserMember) return;
    try {
      await ReactionsService.addReportReaction(postId, String(user.id), 'heart');
      await onRefresh();
    } catch (err) {
      console.error('Failed to react to post:', err);
    }
  };

  const [matchesOpenMap, setMatchesOpenMap] = useState<Record<number, boolean>>({});

  const handleOpenMatch = (postId: number, matchReportId: number | string) => {
    // Navigate to matched report detail and include candidateFor query param
    window.location.href = `/reports/${matchReportId}?candidateFor=${postId}`;
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
      </div>

      {/* Quick Filters - Pill Style consistent with NewsFeed */}
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {(['all', 'lost', 'found'] as const).map(f => {
            const isRestrictedFilter = false;
            if (!isUserMember && isRestrictedFilter) return null;

            return (
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
            );
          })}
        </div>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => {
            if (!isAuthenticated) {
              openLoginModal();
              return;
            }
            if (!isUserMember) return;
            setIsReportModalOpen(true);
          }}
          className={cn(
            "hidden lg:flex items-center gap-2 h-10 px-4 rounded-xl font-bold text-xs border-none transition-all mb-2",
            isUserMember ? "text-teal-600 bg-teal-50 hover:bg-teal-100" : "text-slate-300 bg-slate-50 cursor-not-allowed opacity-50"
          )}
        >
          <Plus className="w-4 h-4" />
          New Report
        </Button>
      </div>

      {/* Posts List - Standardized Layout */}
      <div className="space-y-6">
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <Card 
              key={post.id} 
              onClick={() => handleOpenDetail(post)}
              className="p-8 border-none shadow-sm rounded-[2.5rem] bg-white group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-teal-50 cursor-pointer"
            >
              <div className="flex items-start gap-4 md:gap-6">
                <Avatar className="w-12 h-12 border-4 border-slate-50 shadow-md transition-transform shrink-0 bg-slate-100 uppercase font-black">
                  {post.user?.profilePicture ? (
                    <img src={post.user.profilePicture.startsWith('http') ? post.user.profilePicture : `${import.meta.env.VITE_APP_API_BASE_URL || 'https://resqhub-be.onrender.com'}/${post.user.profilePicture}`} alt={post.user.username} className="w-full h-full object-cover" />
                  ) : (
                    post.user?.username?.charAt(0) || post.title?.charAt(0) || '?'
                  )}
                </Avatar>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-slate-800 text-base">@{post.user?.username || 'community_member'}</span>
                      {post.privacy === 'internal' && (
                        <Badge className="bg-rose-500/10 text-rose-500 border-none px-2 py-0.5 rounded-lg flex items-center gap-1 font-black text-[9px] uppercase tracking-wider">
                          <Eye size={10} strokeWidth={3} />
                          Internal
                        </Badge>
                      )}
                      <Badge className={cn(
                        "px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-[0.1em] border-none",
                        post.reportType?.toLowerCase() === 'lost' ? 'bg-orange-600 text-white' : 
                        post.reportType?.toLowerCase() === 'found' ? 'bg-emerald-600 text-white' :
                        post.reportType?.toLowerCase() === 'news' ? 'bg-teal-600 text-white' :
                        post.reportType?.toLowerCase() === 'announcement' ? 'bg-blue-600 text-white' :
                        'bg-slate-600 text-white'
                      )}>
                        {post.reportType || 'Post'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{formatDate(post.dateCreated)}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-black text-xl text-slate-900 mb-2 group-hover:text-teal-600 transition-colors uppercase tracking-tight leading-tight">{post.title}</h3>
                  <p className="text-slate-600 font-medium text-base mb-4 leading-relaxed line-clamp-4">{post.description}</p>
                  
                  {/* Images Display - Enhanced Collage Layout */}
                  {post.images && post.images.length > 0 && (
                    <div className="w-full h-80 overflow-hidden bg-gray-100 rounded-2xl mb-6">
                      {/* Dynamic Collage Grid */}
                      <div className="w-full h-full grid gap-0.5" style={{gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(4, 1fr)'}}>
                        {post.images.length === 1 ? (
                          // 1 Image: Full container
                          <img 
                            src={post.images[0].imageUrl.startsWith('http') ? post.images[0].imageUrl : `${import.meta.env.VITE_APP_API_BASE_URL || 'https://resqhub-be.onrender.com'}/${post.images[0].imageUrl}`}
                            alt={post.title}
                            className="w-full h-full object-cover col-span-4 row-span-4 cursor-pointer hover:brightness-110 transition-all duration-300"
                          />
                        ) : post.images.length === 2 ? (
                          // 2 Images: Side-by-side full height
                          post.images.map((img) => (
                            <img 
                              key={img.id}
                              src={img.imageUrl.startsWith('http') ? img.imageUrl : `${import.meta.env.VITE_APP_API_BASE_URL || 'https://resqhub-be.onrender.com'}/${img.imageUrl}`}
                              alt={post.title}
                              className="w-full h-full object-cover col-span-2 row-span-4 cursor-pointer hover:brightness-110 transition-all duration-300"
                            />
                          ))
                        ) : post.images.length === 3 ? (
                          // 3 Images: Large left (2x4) + 2 stacked right (2x2 each)
                          <>
                            <img 
                              src={post.images[0].imageUrl.startsWith('http') ? post.images[0].imageUrl : `${import.meta.env.VITE_APP_API_BASE_URL || 'https://resqhub-be.onrender.com'}/${post.images[0].imageUrl}`}
                              alt={post.title}
                              className="w-full h-full object-cover col-span-2 row-span-4 cursor-pointer hover:brightness-110 transition-all duration-300"
                            />
                            <img 
                              src={post.images[1].imageUrl.startsWith('http') ? post.images[1].imageUrl : `${import.meta.env.VITE_APP_API_BASE_URL || 'https://resqhub-be.onrender.com'}/${post.images[1].imageUrl}`}
                              alt={post.title}
                              className="w-full h-full object-cover col-span-2 row-span-2 cursor-pointer hover:brightness-110 transition-all duration-300"
                            />
                            <img 
                              src={post.images[2].imageUrl.startsWith('http') ? post.images[2].imageUrl : `${import.meta.env.VITE_APP_API_BASE_URL || 'https://resqhub-be.onrender.com'}/${post.images[2].imageUrl}`}
                              alt={post.title}
                              className="w-full h-full object-cover col-span-2 row-span-2 cursor-pointer hover:brightness-110 transition-all duration-300"
                            />
                            <div className="col-span-2 row-span-1"></div>
                          </>
                        ) : post.images.length === 4 ? (
                          // 4 Images: Large left (2x4) + top right (2x2) + 2 bottom right (2x1 each)
                          <>
                            <img 
                              src={post.images[0].imageUrl.startsWith('http') ? post.images[0].imageUrl : `${import.meta.env.VITE_APP_API_BASE_URL || 'https://resqhub-be.onrender.com'}/${post.images[0].imageUrl}`}
                              alt={post.title}
                              className="w-full h-full object-cover col-span-2 row-span-4 cursor-pointer hover:brightness-110 transition-all duration-300"
                            />
                            <img 
                              src={post.images[1].imageUrl.startsWith('http') ? post.images[1].imageUrl : `${import.meta.env.VITE_APP_API_BASE_URL || 'https://resqhub-be.onrender.com'}/${post.images[1].imageUrl}`}
                              alt={post.title}
                              className="w-full h-full object-cover col-span-2 row-span-2 cursor-pointer hover:brightness-110 transition-all duration-300"
                            />
                            <img 
                              src={post.images[2].imageUrl.startsWith('http') ? post.images[2].imageUrl : `${import.meta.env.VITE_APP_API_BASE_URL || 'https://resqhub-be.onrender.com'}/${post.images[2].imageUrl}`}
                              alt={post.title}
                              className="w-full h-full object-cover col-span-1 row-span-2 cursor-pointer hover:brightness-110 transition-all duration-300"
                            />
                            <img 
                              src={post.images[3].imageUrl.startsWith('http') ? post.images[3].imageUrl : `${import.meta.env.VITE_APP_API_BASE_URL || 'https://resqhub-be.onrender.com'}/${post.images[3].imageUrl}`}
                              alt={post.title}
                              className="w-full h-full object-cover col-span-1 row-span-2 cursor-pointer hover:brightness-110 transition-all duration-300"
                            />
                            <div className="col-span-2 row-span-1"></div>
                          </>
                        ) : post.images.length === 5 ? (
                          // 5 Images: Large left (2x4) + top right (2x2) + 2 middle (1x1) + 1 bottom (2x1)
                          <>
                            <img 
                              src={post.images[0].imageUrl.startsWith('http') ? post.images[0].imageUrl : `${import.meta.env.VITE_APP_API_BASE_URL || 'https://resqhub-be.onrender.com'}/${post.images[0].imageUrl}`}
                              alt={post.title}
                              className="w-full h-full object-cover col-span-2 row-span-4 cursor-pointer hover:brightness-110 transition-all duration-300"
                            />
                            <img 
                              src={post.images[1].imageUrl.startsWith('http') ? post.images[1].imageUrl : `${import.meta.env.VITE_APP_API_BASE_URL || 'https://resqhub-be.onrender.com'}/${post.images[1].imageUrl}`}
                              alt={post.title}
                              className="w-full h-full object-cover col-span-2 row-span-2 cursor-pointer hover:brightness-110 transition-all duration-300"
                            />
                            <img 
                              src={post.images[2].imageUrl.startsWith('http') ? post.images[2].imageUrl : `${import.meta.env.VITE_APP_API_BASE_URL || 'https://resqhub-be.onrender.com'}/${post.images[2].imageUrl}`}
                              alt={post.title}
                              className="w-full h-full object-cover col-span-1 row-span-1 cursor-pointer hover:brightness-110 transition-all duration-300"
                            />
                            <img 
                              src={post.images[3].imageUrl.startsWith('http') ? post.images[3].imageUrl : `${import.meta.env.VITE_APP_API_BASE_URL || 'https://resqhub-be.onrender.com'}/${post.images[3].imageUrl}`}
                              alt={post.title}
                              className="w-full h-full object-cover col-span-1 row-span-1 cursor-pointer hover:brightness-110 transition-all duration-300"
                            />
                            <img 
                              src={post.images[4].imageUrl.startsWith('http') ? post.images[4].imageUrl : `${import.meta.env.VITE_APP_API_BASE_URL || 'https://resqhub-be.onrender.com'}/${post.images[4].imageUrl}`}
                              alt={post.title}
                              className="w-full h-full object-cover col-span-2 row-span-2 cursor-pointer hover:brightness-110 transition-all duration-300"
                            />
                          </>
                        ) : (
                          // 6+ Images: Large left (2x4) + top right (2x2) + 2 middle (1x1 each) + bottom right (2x1) with count overlay
                          <>
                            <img 
                              src={post.images[0].imageUrl.startsWith('http') ? post.images[0].imageUrl : `${import.meta.env.VITE_APP_API_BASE_URL || 'https://resqhub-be.onrender.com'}/${post.images[0].imageUrl}`}
                              alt={post.title}
                              className="w-full h-full object-cover col-span-2 row-span-4 cursor-pointer hover:brightness-110 transition-all duration-300"
                            />
                            <img 
                              src={post.images[1].imageUrl.startsWith('http') ? post.images[1].imageUrl : `${import.meta.env.VITE_APP_API_BASE_URL || 'https://resqhub-be.onrender.com'}/${post.images[1].imageUrl}`}
                              alt={post.title}
                              className="w-full h-full object-cover col-span-2 row-span-2 cursor-pointer hover:brightness-110 transition-all duration-300"
                            />
                            <img 
                              src={post.images[2].imageUrl.startsWith('http') ? post.images[2].imageUrl : `${import.meta.env.VITE_APP_API_BASE_URL || 'https://resqhub-be.onrender.com'}/${post.images[2].imageUrl}`}
                              alt={post.title}
                              className="w-full h-full object-cover col-span-1 row-span-1 cursor-pointer hover:brightness-110 transition-all duration-300"
                            />
                            <img 
                              src={post.images[3].imageUrl.startsWith('http') ? post.images[3].imageUrl : `${import.meta.env.VITE_APP_API_BASE_URL || 'https://resqhub-be.onrender.com'}/${post.images[3].imageUrl}`}
                              alt={post.title}
                              className="w-full h-full object-cover col-span-1 row-span-1 cursor-pointer hover:brightness-110 transition-all duration-300"
                            />
                            <div className="relative w-full h-full object-cover col-span-2 row-span-2 overflow-hidden bg-gray-200 cursor-pointer">
                              <img 
                                src={post.images[4].imageUrl.startsWith('http') ? post.images[4].imageUrl : `${import.meta.env.VITE_APP_API_BASE_URL || 'https://resqhub-be.onrender.com'}/${post.images[4].imageUrl}`}
                                alt={post.title}
                                className="w-full h-full object-cover hover:brightness-110 transition-all duration-300"
                              />
                              {post.images.length > 5 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center hover:bg-black/40 transition-all duration-300">
                                  <span className="text-white font-black text-3xl">+{post.images.length - 5}</span>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
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

                  {/* Possible Matches */}
                  {Array.isArray((post as any).possibleMatches) && (post as any).possibleMatches.length > 0 && (
                    <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <button
                        onClick={() => setMatchesOpenMap(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-white hover:bg-teal-50"
                      >
                        <span className="font-black text-sm">Possible Matches ({(post as any).possibleMatches.length})</span>
                        {matchesOpenMap[post.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>

                      {matchesOpenMap[post.id] && (
                        <div className="mt-3 space-y-2">
                          {((post as any).possibleMatches as Array<any>).map((m: any, i: number) => (
                            <div key={i} className="flex items-center justify-between bg-white p-2 rounded-md border border-slate-100">
                              <div className="truncate">
                                <div className="text-sm font-black truncate">{m.name || m.username || 'Unknown'}</div>
                                <div className="text-xs text-slate-400 truncate">{m.title || m.description || ''}</div>
                              </div>
                              <button onClick={() => handleOpenMatch(post.id, m.reportId || m.id)} className="text-xs font-black text-teal-600">View</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Interaction Bar */}
                  <div className="flex items-center gap-6 py-4 border-t border-slate-50 mt-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        isUserMember && handlePostReaction(post.id);
                      }}
                      className={cn(
                        "flex items-center gap-2 group/btn",
                        !isUserMember && "cursor-not-allowed opacity-70"
                      )}
                      title={!isUserMember ? "Join community to react" : ""}
                    >
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                        post.isReacted
                          ? "bg-rose-50 text-rose-500" 
                          : "bg-slate-50 text-slate-400 group-hover/btn:bg-rose-50 group-hover/btn:text-rose-500",
                        !isUserMember && "group-hover/btn:bg-slate-50 group-hover/btn:text-slate-400"
                      )}>
                        <Heart size={18} className={post.isReacted ? "fill-current" : ""} />
                      </div>
                      <span className={cn(
                        "text-xs font-black transition-colors uppercase tracking-widest",
                        post.isReacted ? "text-rose-600" : "text-slate-500 group-hover/btn:text-rose-600",
                        !isUserMember && "group-hover/btn:text-slate-500"
                      )}>
                        {post.reactionsCount || 0}
                      </span>
                    </button>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleComments(post.id);
                      }}
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

                    <button 
                      onClick={(e) => { 
                        e.stopPropagation();
                        setSelectedPostForMatch(post); 
                        setIsMatchModalOpen(true); 
                      }}
                      disabled={post.status?.toLowerCase() === 'reunited'}
                      className={cn(
                        "flex items-center gap-2 group/btn ml-2",
                        post.status?.toLowerCase() === 'reunited' && "cursor-not-allowed opacity-40"
                      )}
                      title={post.status?.toLowerCase() === 'reunited' ? "Already resolved" : "Possible Matches"}
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/btn:bg-orange-50 group-hover/btn:text-orange-600 transition-all">
                        <Handshake size={18} />
                      </div>
                    </button>
                    
                    {!isUserMember && expandedComments[post.id] && (
                      <div className="ml-auto text-[10px] font-black text-orange-400 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-lg">
                        Visitor Mode: Join to Comment
                      </div>
                    )}
                  </div>
                  
                  {expandedComments[post.id] && (
                    <div className="pt-6 border-t border-slate-50 mt-0 px-2 animate-in slide-in-from-top-4 duration-300">
                      <CommentSection 
                        itemId={post.id} 
                        itemType={post.reportType?.toLowerCase() === 'found' ? 'found' : 'lost'} 
                        itemOwnerId={Number(post.userId) || 0}
                        readOnly={!isUserMember}
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

      <ReportDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        report={selectedReportForDetail}
      />

      {selectedPostForMatch && (
        <MatchModal 
          isOpen={isMatchModalOpen}
          onClose={() => setIsMatchModalOpen(false)}
          report={{
            ...selectedPostForMatch,
            status: selectedPostForMatch.reportType?.toLowerCase()
          }}
        />
      )}
    </div>
  );
};
