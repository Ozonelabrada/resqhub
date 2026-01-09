import React, { useState } from 'react';
import { Card, Avatar, Button, ShadcnBadge as Badge } from '@/components/ui';
import { Newspaper, Shield, Trash2, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import CommentSection from '@/components/features/comments/CommentSection';
import type { CommunityPost } from '@/types/community';
import { CommunityService } from '@/services/communityService';
import { useAuth } from '@/context/AuthContext';

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
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'lost' | 'found' | 'news' | 'announcement' | 'general'>('all');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState<'lost' | 'found' | 'general'>('lost');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredPosts = posts.filter(p => filter === 'all' || p.type === filter);

  const handleSubmit = async () => {
    if (!postTitle.trim() || !postContent.trim()) return;
    setIsSubmitting(true);
    try {
      await CommunityService.createPost(communityId, {
        title: postTitle,
        content: postContent,
        type: postType as any
      });
      setPostTitle('');
      setPostContent('');
      await onRefresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Quick Filters - Pill Style consistent with NewsFeed */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {(['all', 'lost', 'found', 'news', 'announcement', 'general'] as const).map(f => (
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

      {/* Create Post Card - Cleaned Up */}
      {isMember && (
        <Card className="p-8 border-none shadow-sm rounded-[2.5rem] bg-white border border-teal-50">
          <div className="flex gap-4 md:gap-6">
            <Avatar className="w-12 h-12 border-4 border-teal-50 shadow-sm shrink-0 bg-slate-100">{user?.name?.charAt(0) || 'U'}</Avatar>
            <div className="flex-1 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  className="flex-1 px-5 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-teal-500/20 font-bold text-slate-700 transition-all text-sm" 
                  placeholder="Topic or title..." 
                  value={postTitle} 
                  onChange={(e) => setPostTitle(e.target.value)} 
                />
                <select 
                  value={postType} 
                  onChange={(e) => setPostType(e.target.value as any)} 
                  className="rounded-2xl bg-slate-50 border-none px-4 py-3 font-black text-slate-600 focus:ring-2 focus:ring-teal-500/20 text-xs uppercase tracking-widest cursor-pointer"
                >
                  <option value="lost">Lost</option>
                  <option value="found">Found</option>
                  <option value="general">Discussion</option>
                </select>
              </div>
              <textarea 
                rows={2} 
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-teal-500/20 resize-none font-medium text-slate-600 transition-all text-sm" 
                placeholder="Share more details with the community..." 
                value={postContent} 
                onChange={(e) => setPostContent(e.target.value)} 
              />
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Visible to all community members</p>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting || !postTitle.trim()} 
                    className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl px-10 h-11 shadow-lg shadow-teal-100 transition-all active:scale-95 text-sm"
                  >
                    {isSubmitting ? 'Posting...' : 'Post to Feed'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Posts List - Standardized Layout */}
      <div className="space-y-6">
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <Card key={post.id} className="p-8 border-none shadow-sm rounded-[2.5rem] bg-white group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-teal-50">
              <div className="flex items-start gap-4 md:gap-6">
                <Avatar className="w-12 h-12 border-4 border-slate-50 shadow-md transition-transform shrink-0 bg-slate-100">{post.authorName?.charAt(0)}</Avatar>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-slate-800 text-base">{post.authorName}</span>
                      <Badge className={cn(
                        "px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-[0.1em] border-none",
                        post.type === 'lost' ? 'bg-orange-600 text-white' : 
                        post.type === 'found' ? 'bg-emerald-600 text-white' :
                        post.type === 'news' ? 'bg-teal-600 text-white' :
                        'bg-blue-600 text-white'
                      )}>
                        {post.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <h3 className="font-black text-xl text-slate-900 mb-3 group-hover:text-teal-600 transition-colors uppercase tracking-tight leading-tight">{post.title}</h3>
                  <p className="text-slate-600 font-medium text-base mb-6 leading-relaxed line-clamp-4">{post.content}</p>

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
                  
                  <div className="pt-6 border-t border-slate-50 mt-4">
                    <CommentSection 
                      itemId={Number(post.id)} 
                      itemType={post.type === 'found' ? 'found' : 'lost'} 
                      itemOwnerId={Number(post.authorId)} 
                    />
                  </div>
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
    </div>
  );
};
