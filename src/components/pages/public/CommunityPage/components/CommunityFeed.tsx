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
import { ImageCollageDisplay } from '@/components/features/reports/ImageCollageDisplay';

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
              className="group bg-white border border-gray-100 rounded-2xl md:rounded-[2.5rem] overflow-visible shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col w-full"
            >
              <div className="flex flex-col md:flex-row w-full">
                {/* Image Container - Professional Collage Layout */}
                {post.images && post.images.length > 0 && (
                  <div className="relative w-full md:w-[32rem] h-48 sm:h-56 md:h-80 lg:h-96">
                    {/* Collage Display Component */}
                    <ImageCollageDisplay
                      images={post.images}
                      title={post.title}
                      containerHeight="h-full"
                    />

                    {/* Status Badge - Top Overlay */}
                    <div className="absolute top-4 left-4 flex gap-2 z-20 pointer-events-none">
                      <Badge className={cn(
                        "px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-[0.1em] border shadow-md",
                        post.reportType?.toLowerCase() === 'lost' ? 'bg-orange-600 text-white border-orange-500' : 
                        post.reportType?.toLowerCase() === 'found' ? 'bg-emerald-600 text-white border-emerald-500' :
                        post.reportType?.toLowerCase() === 'news' ? 'bg-teal-600 text-white border-teal-500' :
                        post.reportType?.toLowerCase() === 'announcement' ? 'bg-blue-600 text-white border-blue-500' :
                        'bg-slate-600 text-white border-slate-500'
                      )}>
                        {post.reportType || 'Post'}
                      </Badge>
                      {post.privacy === 'internal' && (
                        <Badge className="bg-rose-50 text-rose-600 border border-rose-100 px-3 py-1 rounded-full flex items-center gap-1 font-black text-[9px] uppercase tracking-wider shadow-md">
                          <Eye size={10} strokeWidth={3} />
                          Internal
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Content Area */}
                <div className="flex-1 p-4 md:p-8 flex flex-col">
                  <div className="flex justify-between items-start gap-2 w-full mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg md:text-2xl font-black text-slate-900 leading-snug group-hover:text-teal-600 transition-colors uppercase tracking-tight break-words">
                        {post.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-slate-500 font-bold text-[8px] sm:text-[9px] md:text-xs mt-2 min-w-0">
                        <span className="text-slate-300 flex-shrink-0">Posted by</span>
                        <span className="font-black text-slate-700 flex-shrink-0">@{post.user?.username || 'community_member'}</span>
                        <span className="text-slate-300 flex-shrink-0">•</span>
                        <span className="flex-shrink-0">{formatDate(post.dateCreated)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-1.5 sm:mt-2 md:mt-3 mb-2 sm:mb-3 md:mb-6">
                    <p className="text-slate-600 text-[11px] sm:text-sm md:text-base leading-relaxed line-clamp-4">
                      {post.description}
                    </p>
                  </div>

                  {/* Possible Matches */}
                  {Array.isArray((post as any).possibleMatches) && (post as any).possibleMatches.length > 0 && post.images && post.images.length > 0 && (
                    <div className="p-4 border-t border-slate-50 bg-slate-50 mb-4">
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setMatchesOpenMap(prev => ({ ...prev, [post.id]: !prev[post.id] })); 
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white shadow-sm hover:shadow-md"
                      >
                        <span className="text-sm font-black text-slate-700">Possible Matches ({(post as any).possibleMatches.length})</span>
                        {matchesOpenMap[post.id] ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </button>

                      {matchesOpenMap[post.id] && (
                        <div className="mt-3 space-y-2">
                          {((post as any).possibleMatches as Array<any>).map((m: any, i: number) => (
                            <button
                              key={i}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenMatch(post.id, m.reportId || m.id);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg bg-white/90 hover:bg-teal-50 border border-slate-100 flex items-center justify-between"
                            >
                              <div className="truncate">
                                <div className="text-sm font-black text-slate-800 truncate">{m.name || m.username || 'Unknown'}</div>
                                <div className="text-xs text-slate-400 truncate">{m.title || m.description || ''}</div>
                              </div>
                              <div className="text-xs text-teal-600 font-black">View</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mod Tools */}
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

                  {/* Action Buttons */}
                  <div className="mt-auto pt-1.5 sm:pt-2 md:pt-4 border-t border-gray-50 flex flex-col w-full">
                    <div className="flex items-center gap-1 w-full flex-wrap justify-start">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          isUserMember && handlePostReaction(post.id);
                        }}
                        disabled={!isUserMember}
                        className={cn(
                          "flex items-center gap-0.5 px-1.5 sm:px-2 md:px-4 py-0.5 sm:py-1 md:py-2 rounded-md sm:rounded-lg md:rounded-2xl font-black text-[8px] sm:text-[9px] md:text-xs transition-all whitespace-nowrap",
                          post.isReacted ? "bg-rose-50 text-rose-600" : "text-slate-400 hover:bg-gray-50 hover:text-rose-500",
                          !isUserMember && "cursor-not-allowed opacity-50"
                        )}
                      >
                        <Heart className={cn("w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0", post.isReacted && "fill-current")} />
                        <span className="min-w-max">{post.reactionsCount || 0}</span>
                      </button>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleComments(post.id);
                        }}
                        className={cn(
                          "flex items-center gap-0.5 px-1.5 sm:px-2 md:px-4 py-0.5 sm:py-1 md:py-2 rounded-md sm:rounded-lg md:rounded-2xl font-black text-[8px] sm:text-[9px] md:text-xs transition-all whitespace-nowrap text-slate-400 hover:bg-gray-50 hover:text-teal-500"
                        )}
                      >
                        <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                        <span className="min-w-max">{post.commentsCount || 0}</span>
                      </button>

                      <button 
                        onClick={(e) => { 
                          e.stopPropagation();
                          setSelectedPostForMatch(post); 
                          setIsMatchModalOpen(true); 
                        }}
                        disabled={post.status?.toLowerCase() === 'reunited'}
                        className={cn(
                          "flex items-center gap-0.5 px-1.5 sm:px-2 md:px-4 py-0.5 sm:py-1 md:py-2 rounded-md sm:rounded-lg md:rounded-2xl font-black text-[8px] sm:text-[9px] md:text-xs transition-all whitespace-nowrap text-slate-400 hover:bg-gray-50 hover:text-orange-500",
                          post.status?.toLowerCase() === 'reunited' && "cursor-not-allowed opacity-40"
                        )}
                        title={post.status?.toLowerCase() === 'reunited' ? "Already resolved" : "Find Matches"}
                      >
                        <Handshake className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                      </button>
                    </div>
                  </div>

                  {expandedComments[post.id] && (
                    <div className="pt-6 border-t border-slate-50 mt-4 px-2 animate-in slide-in-from-top-4 duration-300">
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
