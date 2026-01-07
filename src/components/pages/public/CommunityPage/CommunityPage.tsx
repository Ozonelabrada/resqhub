import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { 
  Container, 
  Card, 
  Button, 
  Avatar, 
  Tabs, 
  TabList, 
  TabTrigger, 
  TabContent, 
  Grid, 
  Spinner,
  Badge
} from '../../../ui';
import { 
  Newspaper, 
  Megaphone, 
  MessageSquare, 
  Users, 
  Info, 
  Plus, 
  MapPin, 
  ShieldCheck,
  Calendar,
  Heart,
  Search,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import CommentSection from '../../../features/comments/CommentSection';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

import { useCommunityDetail } from '../../../../hooks/useCommunities';

const CommunityPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, user, openLoginModal } = useAuth();
  
  const { 
    community, 
    posts, 
    members, 
    loading, 
    join, 
    leave,
    refresh
  } = useCommunityDetail(id);

  const [activeTab, setActiveTab] = useState<'news'|'announcements'|'discussions'|'members'|'about'>('news');
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const safePosts = Array.isArray(posts) ? posts : [];
  const safeMembers = Array.isArray(members) ? members : [];

  const news = safePosts.filter(p => p.type === 'news');
  const announcements = safePosts.filter(p => p.type === 'announcement');
  const discussions = safePosts.filter(p => p.type === 'general');
  
  const isMember = community?.isMember || false;

  const handleJoin = async () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    await join();
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !id) return;
    
    setIsSubmitting(true);
    try {
      await CommunityService.createPost({
        communityId: id,
        title: 'New Discussion', // Simplified for now
        content: newPostContent,
        type: 'general'
      });
      setNewPostContent('');
      refresh();
    } catch (error) {
      console.error('Failed to create post', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  if (loading || !community) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          {loading ? (
            <>
              <Spinner size="lg" className="mx-auto text-teal-600" />
              <p className="mt-4 text-slate-500 font-bold tracking-widest uppercase text-xs">Loading Community</p>
            </>
          ) : (
            <p className="mt-4 text-slate-500 font-bold tracking-widest uppercase text-xs">Community not found</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Dynamic Header Section */}
      <div className="bg-white border-b border-slate-100 pb-0">
        <div className="h-48 md:h-64 bg-teal-900 relative overflow-hidden">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400 rounded-full -ml-24 -mb-24 blur-3xl"></div>
          </div>
          
          <Container size="full" className="h-full flex items-end pb-8">
             <div className="flex flex-col md:flex-row items-center md:items-end gap-6 w-full max-w-[1600px] mx-auto">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-white p-2 shadow-2xl shadow-black/20 z-10 -mb-12 md:-mb-16 border-4 border-white overflow-hidden flex items-center justify-center">
                   <div className="w-full h-full rounded-[2rem] bg-gradient-to-br from-teal-500 to-emerald-400 flex items-center justify-center text-5xl font-black text-white">
                      {community.name?.charAt(0)}
                   </div>
                </div>
                
                <div className="flex-1 text-center md:text-left z-10 mb-2">
                   <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                      <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-sm">{community.name}</h1>
                      <ShieldCheck className="text-emerald-400 fill-emerald-400/10 hidden md:block" size={28} />
                   </div>
                   <p className="text-teal-50 text-base md:text-lg font-medium opacity-90 max-w-2xl">{community.tagline}</p>
                </div>

                <div className="z-10 mb-4 flex gap-3">
                  {isMember ? (
                    <Button 
                      onClick={() => navigate('/hub')}
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 h-14 rounded-2xl px-8 font-black transition-all"
                    >
                      <Plus className="mr-2 w-5 h-5" />
                      Add Post
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleJoin}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white h-14 rounded-2xl px-10 font-black shadow-xl shadow-emerald-500/30 transition-all active:scale-95"
                    >
                      Join Community
                    </Button>
                  )}
                </div>
             </div>
          </Container>
        </div>
        
        {/* Navigation Tabs Bar */}
        <div className="pt-16 md:pt-20 border-t border-slate-50">
          <Container size="full">
            <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 pb-4">
               <div className="flex items-center gap-8 md:gap-12 overflow-x-auto w-full no-scrollbar pb-2 md:pb-0">
                  <button 
                    onClick={() => setActiveTab('news')}
                    className={cn(
                      "flex items-center gap-2 pb-4 text-sm font-black uppercase tracking-widest transition-all relative",
                      activeTab === 'news' ? "text-teal-600" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <Newspaper size={18} />
                    News
                    {activeTab === 'news' && <div className="absolute bottom-0 left-0 w-full h-1 bg-teal-600 rounded-full" />}
                  </button>
                  <button 
                    onClick={() => setActiveTab('announcements')}
                    className={cn(
                      "flex items-center gap-2 pb-4 text-sm font-black uppercase tracking-widest transition-all relative",
                      activeTab === 'announcements' ? "text-teal-600" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <Megaphone size={18} />
                    Announcements
                    {activeTab === 'announcements' && <div className="absolute bottom-0 left-0 w-full h-1 bg-teal-600 rounded-full" />}
                  </button>
                  <button 
                    onClick={() => setActiveTab('discussions')}
                    className={cn(
                      "flex items-center gap-2 pb-4 text-sm font-black uppercase tracking-widest transition-all relative",
                      activeTab === 'discussions' ? "text-teal-600" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <MessageSquare size={18} />
                    Discussions
                    {activeTab === 'discussions' && <div className="absolute bottom-0 left-0 w-full h-1 bg-teal-600 rounded-full" />}
                  </button>
                  <button 
                    onClick={() => setActiveTab('members')}
                    className={cn(
                      "flex items-center gap-2 pb-4 text-sm font-black uppercase tracking-widest transition-all relative",
                      activeTab === 'members' ? "text-teal-600" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <Users size={18} />
                    Members
                    {activeTab === 'members' && <div className="absolute bottom-0 left-0 w-full h-1 bg-teal-600 rounded-full" />}
                  </button>
                  <button 
                    onClick={() => setActiveTab('about')}
                    className={cn(
                      "flex items-center gap-2 pb-4 text-sm font-black uppercase tracking-widest transition-all relative",
                      activeTab === 'about' ? "text-teal-600" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <Info size={18} />
                    About
                    {activeTab === 'about' && <div className="absolute bottom-0 left-0 w-full h-1 bg-teal-600 rounded-full" />}
                  </button>
               </div>
               
               <div className="flex items-center gap-6 pb-4 md:pb-0 shrink-0">
                  <div className="flex -space-x-3">
                    {safeMembers.slice(0, 3).map(m => (
                      <Avatar key={m.id} className="w-10 h-10 border-4 border-white shadow-sm">{m.name.charAt(0)}</Avatar>
                    ))}
                    <div className="w-10 h-10 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center text-[10px] font-black text-slate-500 shadow-sm">
                      +{Math.max(0, (community.membersCount || 0) - 3)}
                    </div>
                  </div>
                  <div className="h-8 w-px bg-slate-100" />
                  <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-xl text-teal-700 font-black text-xs">
                     <TrendingUp size={14} />
                     High Activity
                  </div>
               </div>
            </div>
          </Container>
        </div>
      </div>

      {/* Main Content Area */}
      <Container size="full" className="py-12">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar: Community Stats & Quick Actions */}
          <aside className="lg:col-span-3 space-y-6 hidden lg:block">
            <Card className="p-8 border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Community Info</h3>
              <div className="space-y-6">
                 <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Location</p>
                      <p className="text-slate-800 font-bold">{community.location}</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Active Since</p>
                      <p className="text-slate-800 font-bold">{community.foundedDate}</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Heart size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Success Stories</p>
                      <p className="text-slate-800 font-bold">18 Resolved Cases</p>
                    </div>
                 </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-50 space-y-4">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Community Rules</h4>
                 {Array.isArray(community.rules) ? community.rules.map((rule: string, i: number) => (
                   <div key={i} className="flex gap-3 text-sm font-medium text-slate-600">
                      <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0 mt-0.5">{i+1}</div>
                      <p>{rule}</p>
                   </div>
                 )) : (
                   <p className="text-sm font-medium text-slate-400 italic">No rules defined for this community.</p>
                 )}
              </div>
            </Card>

            <Card className="p-8 border-none shadow-2xl shadow-emerald-900/10 rounded-[2.5rem] bg-emerald-600 text-white relative overflow-hidden">
               <div className="relative z-10">
                 <h4 className="text-xl font-black mb-2 leading-tight">Help the Community</h4>
                 <p className="text-emerald-100/80 text-sm font-medium leading-relaxed mb-6">
                   Active patrols and eyes on the street help reunite items faster.
                 </p>
                 <Button className="w-full h-12 rounded-xl bg-white text-emerald-600 font-black hover:bg-emerald-50 transition-all">
                    Volunteer Now
                 </Button>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            </Card>
          </aside>

          {/* Center: Main Feed Content */}
          <main className="lg:col-span-6 space-y-8">
            {/* Tab Search/Filter Bar */}
            <Card className="p-4 border-none shadow-sm rounded-3xl bg-white flex items-center gap-4">
               <div className="flex-1 bg-slate-50 rounded-2xl flex items-center px-4 py-2 border border-slate-100">
                  <Search className="text-slate-300 w-5 h-5 mr-3" />
                  <input 
                    type="text" 
                    placeholder={`Search within ${activeTab}...`} 
                    className="bg-transparent border-none focus:outline-none text-sm font-medium text-slate-700 w-full"
                  />
               </div>
               <Button variant="ghost" className="rounded-xl w-11 h-11 p-0 flex items-center justify-center text-slate-400 hover:bg-slate-50">
                  <Plus className="w-5 h-5" />
               </Button>
            </Card>

            {/* TAB CONTENT: NEWS */}
            {activeTab === 'news' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 {news.map(item => (
                   <Card key={item.id} className="p-8 border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white group hover:shadow-2xl transition-all duration-500 border-l-8 border-l-teal-500">
                      <div className="flex items-center justify-between mb-4">
                        <Badge className={cn(
                          "rounded-full px-4 py-1.5 font-black uppercase text-[10px] tracking-widest",
                          item.type === 'news' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-orange-50 text-orange-600 border border-orange-100"
                        )}>
                          {item.type}
                        </Badge>
                        <span className="text-xs font-black text-slate-300 uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 group-hover:text-teal-600 transition-colors mb-3 leading-tight uppercase tracking-tight">{item.title}</h3>
                      <p className="text-slate-600 font-medium leading-relaxed mb-6">{item.content}</p>
                      
                      <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                         <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-400">
                               {item.authorName.charAt(0)}
                            </div>
                            <span className="text-sm font-black text-slate-500">{item.authorName}</span>
                         </div>
                         <Button variant="ghost" className="text-teal-600 font-black text-xs hover:bg-teal-50 rounded-xl group/btn">
                            Read Full Story
                            <ChevronRight size={16} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
                         </Button>
                      </div>
                   </Card>
                 ))}
              </div>
            )}

            {/* TAB CONTENT: ANNOUNCEMENTS */}
            {activeTab === 'announcements' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 {announcements.map(item => (
                   <Card key={item.id} className="p-8 border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-bl-[4rem] flex items-center justify-center text-teal-600 opacity-50 group-hover:bg-teal-600 group-hover:text-white transition-all duration-500">
                         <Megaphone size={24} className="group-hover:rotate-12 transition-transform" />
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                         <Badge className="bg-teal-600 text-white rounded-lg px-3 py-1 text-[10px] font-black tracking-widest">{item.type}</Badge>
                         <span className="text-xs font-black text-slate-300 uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">{item.title}</h3>
                      <p className="text-slate-600 font-medium text-base mb-6 pr-12">{item.content}</p>
                      <Button className="bg-slate-900 text-white rounded-xl h-12 font-bold px-8">View Attachment</Button>
                   </Card>
                 ))}
              </div>
            )}

            {/* TAB CONTENT: DISCUSSIONS */}
            {activeTab === 'discussions' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {isMember && (
                  <Card className="p-6 border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white border border-teal-100">
                    <div className="flex gap-4">
                      <Avatar className="w-12 h-12 border-2 border-teal-50">{(user as any)?.name?.charAt(0) || 'U'}</Avatar>
                      <div className="flex-1">
                        <textarea 
                          placeholder="What's on your mind today?" 
                          className="w-full p-6 rounded-3xl bg-slate-50 border-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all resize-none text-slate-700 font-medium" 
                          rows={3} 
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          disabled={isSubmitting}
                        />
                        <div className="flex items-center justify-between mt-4">
                           <div className="flex gap-2">
                              <Button variant="outline" className="h-10 rounded-xl bg-white border-slate-100 text-slate-500 hover:text-teal-600 px-4 font-bold text-xs transition-all">
                                 Add Photo
                              </Button>
                              <Button variant="outline" className="h-10 rounded-xl bg-white border-slate-100 text-slate-500 hover:text-teal-600 px-4 font-bold text-xs transition-all">
                                 Add Alert
                              </Button>
                           </div>
                           <Button 
                             onClick={handleCreatePost}
                             disabled={!newPostContent.trim() || isSubmitting}
                             className="bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl px-8 h-10 shadow-lg shadow-teal-100"
                           >
                             {isSubmitting ? 'Posting...' : 'Post discussion'}
                           </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {discussions.map(post => (
                  <Card key={post.id} className="p-8 border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white">
                    <div className="flex items-start gap-4 h-full">
                      <Avatar className="w-14 h-14 border-2 border-slate-50 shadow-sm">{post.authorName.charAt(0)}</Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                           <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900">{post.authorName}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-xs font-bold text-slate-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                           </div>
                           <Button variant="ghost" className="h-8 w-8 p-0 rounded-full text-slate-300">...</Button>
                        </div>
                        <h3 className="font-black text-xl text-slate-900 mb-3">{post.title}</h3>
                        <p className="text-slate-600 font-medium text-base mb-8">{post.content}</p>
                        
                        <div className="pt-6 border-t border-slate-50">
                          <CommentSection itemId={post.id} itemType="lost" itemOwnerId={post.authorId} />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* TAB CONTENT: MEMBERS */}
            {activeTab === 'members' && (
              <Card className="p-10 border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-10">
                   <div>
                      <h4 className="text-2xl font-black text-slate-900 mb-1">Community Members</h4>
                      <p className="text-slate-400 font-medium">Connect with {safeMembers.length} verified residents</p>
                   </div>
                   <Button variant="outline" className="rounded-2xl border-slate-200 font-bold px-6 h-12">Search Members</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {safeMembers.map(m => (
                    <div key={m.id} className="flex items-center gap-4 p-5 rounded-[2rem] border border-slate-50 bg-slate-50/30 hover:bg-white hover:border-teal-100 hover:shadow-xl hover:shadow-teal-900/5 transition-all group">
                      <Avatar className="w-16 h-16 border-4 border-white shadow-md group-hover:scale-110 transition-transform">{m.name.charAt(0)}</Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                           <div className="font-black text-slate-900">{m.name}</div>
                           {m.role === 'admin' && <Badge className="bg-amber-100 text-amber-700 border-none text-[10px] font-black">Admin</Badge>}
                        </div>
                        <div className="text-xs font-bold text-slate-400">@{m.username}</div>
                        <Button variant="ghost" className="h-8 text-teal-600 font-black p-0 mt-2 hover:bg-transparent">Message</Button>
                      </div>
                      <ChevronRight size={20} className="text-slate-200 group-hover:text-teal-400 transition-colors" />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* TAB CONTENT: ABOUT */}
            {activeTab === 'about' && (
              <Card className="p-10 border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h4 className="text-3xl font-black text-slate-900 mb-6">Mission & Vision</h4>
                <p className="text-slate-600 text-lg font-medium leading-relaxed mb-10">
                  {community.description} Our goal is to create a digital neighborhood watch where everything that is lost finds its way home through community collective action.
                </p>
                
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Recent Achievements</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="p-6 rounded-[2rem] bg-emerald-50 border border-emerald-100 text-center">
                      <div className="text-3xl font-black text-emerald-600 mb-1">94%</div>
                      <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Success Rate</div>
                   </div>
                   <div className="p-6 rounded-[2rem] bg-teal-50 border border-teal-100 text-center">
                      <div className="text-3xl font-black text-teal-600 mb-1">124</div>
                      <div className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Total Members</div>
                   </div>
                   <div className="p-6 rounded-[2rem] bg-blue-50 border border-blue-100 text-center">
                      <div className="text-3xl font-black text-blue-600 mb-1">18</div>
                      <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Reunited Items</div>
                   </div>
                </div>
              </Card>
            )}
          </main>

          {/* Right Sidebar: Trending & Featured */}
          <aside className="lg:col-span-3 space-y-6">
             <Card className="p-8 border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Latest Success</h3>
                   <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <ShieldCheck size={18} />
                   </div>
                </div>
                
                <div className="space-y-6">
                   <div className="relative rounded-3xl overflow-hidden aspect-video mb-4">
                      <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=250&fit=crop" className="w-full h-full object-cover" alt="Success" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                         <span className="text-white font-black text-sm">Reunited: Golden Retriever</span>
                      </div>
                   </div>
                   <p className="text-slate-500 text-xs font-medium italic">"Thank you so much to everyone who helped look for Max. He's finally home!"</p>
                   <Button variant="ghost" className="w-full border border-slate-100 rounded-xl font-bold hover:bg-slate-50">Read Case Study</Button>
                </div>
             </Card>

             <Card className="p-8 border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                        <AlertCircle size={20} />
                      </div>
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Weekly Goal</h3>
                   </div>
                   
                   <div className="space-y-4">
                      <div className="flex justify-between items-end">
                         <span className="text-2xl font-black text-slate-800">8/10</span>
                         <span className="text-xs font-black text-teal-600">80%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                         <div className="h-full bg-teal-600 w-[80%] rounded-full shadow-lg shadow-teal-500/20" />
                      </div>
                      <p className="text-slate-400 text-[10px] font-bold leading-normal">
                         Matching 10 items this week. We are almost there! Keep verifying those reports.
                      </p>
                   </div>
                </div>
             </Card>
          </aside>
        </div>
      </Container>
    </div>
  );
};

export default CommunityPage;

