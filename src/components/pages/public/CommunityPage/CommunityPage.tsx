import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Settings, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Heart, 
  TrendingUp,
  AlertCircle,
  ShieldAlert,
  Megaphone,
  BookOpen,
  Lock,
  Bell,
  BellOff,
  Clock,
  ArrowLeft,
  CalendarOff
} from 'lucide-react';
import { Button, Card, Avatar, Spinner, ShadcnBadge as Badge } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { CommunitySettingsModal, CreateReportModal, ModerationOverviewModal } from '@/components/modals';
import { cn } from '@/lib/utils';
import { useCommunityDetail } from '@/hooks/useCommunities';
import { CommunityChat } from '@/components/features/messages/CommunityChat';

// Global Sidebar Component
import NewsFeedSidebar from '@/components/pages/public/NewsFeedPage/components/NewsFeedSidebar';
import type { CommunityTabType } from '@/components/pages/public/NewsFeedPage/components/NewsFeedSidebar';

import { CommunityFeed } from './components/CommunityFeed';
import { NeedsBoard } from './components/NeedsBoard';
import { ResourcesWidget } from './components/ResourcesWidget';
import { CommunityMembers } from './components/CommunityMembers';
import { CommunityAbout } from './components/CommunityAbout';
import { CommunityTrade } from './components/CommunityTrade';
import { CommunityEvents, SAMPLE_EVENTS } from './components/CommunityEvents';
import { CommunityAnnouncements, SAMPLE_ANNOUNCEMENTS } from './components/CommunityAnnouncements';
import { CommunityResources } from './components/CommunityResources';

const CommunityPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user, openLoginModal } = useAuth();
  
  const activeTab = (searchParams.get('tab') as CommunityTabType) || 'feed';

  const { 
    community, 
    posts, 
    members, 
    joinRequests,
    loading, 
    join,
    approveRequest,
    rejectRequest,
    refresh
  } = useCommunityDetail(id);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isModerationOpen, setIsModerationOpen] = useState(false);

  const safeMembers = Array.isArray(members) ? members : [];
  const safeJoinRequests = Array.isArray(joinRequests) ? joinRequests : [];
  const isMember = community?.isMember || false;
  const isAdmin = community?.isAdmin || false;
  const isModerator = community?.isModerator || false;
  const isPrivileged = isAdmin || isModerator;

  const handleOpenReportModal = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (!isMember && !isAdmin) {
      // Logic for non-members - maybe show join prompt
      return;
    }
    setIsReportModalOpen(true);
  };

  const handleJoin = async () => {
    if (!isAuthenticated) return openLoginModal();
    await join();
  };

  const handleTabChange = (tab: CommunityTabType) => setSearchParams({ tab });

  if (loading || !community) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner size="lg" className="text-teal-600" />
      </div>
    );
  }

  const RestrictedContent = ({ title, description }: { title: string, description: string }) => (
    <div className="p-20 text-center flex flex-col items-center justify-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
      <div className="w-20 h-20 bg-teal-50 rounded-3xl flex items-center justify-center mb-6 text-teal-600">
        <Lock size={40} />
      </div>
      <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-2">{title}</h3>
      <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto">{description}</p>
      <Button 
        onClick={handleJoin}
        className="px-10 h-14 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl shadow-xl shadow-teal-100 uppercase tracking-widest text-xs"
      >
        Join Community to Unlock
      </Button>
    </div>
  );

  const STATIC_MEMBERS = [
    { id: 1, name: 'Alex Rivera' },
    { id: 2, name: 'Sarah Chen' },
    { id: 3, name: 'Mike Johnson' },
    { id: 4, name: 'Elena Cruz' },
    { id: 5, name: 'David Smith' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'feed':
        return (
          <CommunityFeed 
            communityId={id!} 
            posts={posts || []} 
            isMember={isMember}
            isAdmin={community.isAdmin}
            onRefresh={refresh}
          />
        );
      case 'announcements':
        return isMember || isAdmin ? (
          <CommunityAnnouncements isAdmin={isAdmin} />
        ) : (
          <RestrictedContent 
            title="Announcements Locked" 
            description="Official community updates are reserved for verified members only."
          />
        );
      case 'events':
        return isMember || isAdmin ? (
          <CommunityEvents />
        ) : (
          <RestrictedContent 
            title="Community Events Locked" 
            description="Join the community to see and participate in upcoming local events."
          />
        );
      case 'trade': return isMember || isPrivileged ? (
        <CommunityTrade />
      ) : (
        <RestrictedContent 
          title="Marketplace Locked" 
          description="Community trade and marketplace items are only visible to verified members."
        />
      );
      case 'resources':
        return isMember || isAdmin ? (
          <CommunityResources />
        ) : (
          <RestrictedContent 
            title="Private Resources" 
            description="Community guidelines and local resources are only visible to members."
          />
        );
      case 'needs': return <NeedsBoard />;
      case 'chat': return isMember || isAdmin ? (
        <CommunityChat communityId={id!} communityName={community.name} />
      ) : (
        <RestrictedContent 
          title="Community Chat Locked" 
          description="Live discussions are reserved for community members. Join to participate in the conversation."
        />
      );
      case 'members': return isMember || isPrivileged ? (
        <CommunityMembers 
          members={safeMembers} 
          joinRequests={safeJoinRequests}
          isAdmin={isAdmin} 
          isModerator={isModerator}
          onApprove={approveRequest}
          onReject={rejectRequest}
          onRefresh={refresh}
        />
      ) : (
        <RestrictedContent 
          title="Members Directory Hidden" 
          description="To protect our neighborhood's privacy, the members list is only visible to verified community members."
        />
      );
      case 'about': return <CommunityAbout community={community} />;
      default: return null;
    }
  };

  const today = '2026-01-12';
  const todayDisplay = 'Jan 12, 2026';

  const todaysAnnouncements = SAMPLE_ANNOUNCEMENTS.filter(ann => ann.dateKey === today);
  const todaysEvents = SAMPLE_EVENTS.filter(event => event.dateKey === today);

  return (
    <div className="min-h-screen lg:h-[calc(100vh-100px)] flex flex-col bg-slate-50 lg:overflow-hidden lg:-mt-8">
      {/* --- COMMUNITY HEADER: FULL WIDTH TOP SECTION --- */}
      <div className="w-full relative shrink-0">
        {/* Community Banner - Full Screen Width Background */}
        <div className="h-64 md:h-72 bg-slate-900 relative overflow-hidden text-white shadow-2xl">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500 rounded-full -mr-64 -mt-64 blur-[120px]"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500 rounded-full -ml-48 -mb-48 blur-[100px]"></div>
          </div>
          
          {/* Banner content - Full Width Content */}
          <div className="h-full w-full px-4 md:px-6 lg:px-8 flex items-end pb-12 md:pb-16">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 w-full relative z-10">
              {/* Profile Avatar / Logo - Overlapping Banner */}
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] md:rounded-[4rem] bg-white p-2 shadow-2xl z-20 -mb-20 md:-mb-28 border-4 border-white overflow-hidden flex items-center justify-center transition-transform hover:scale-105 duration-500">
                <div className="w-full h-full rounded-[2.2rem] md:rounded-[3.5rem] bg-gradient-to-br from-teal-500 to-emerald-400 flex items-center justify-center text-4xl md:text-7xl font-black text-white">
                  {community.name?.charAt(0)}
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left mb-2 md:mb-4">
                <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                  <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-md tracking-tight uppercase">{community.name}</h1>
                  <ShieldCheck className="text-emerald-400 fill-emerald-400/10 hidden md:block" size={40} />
                </div>
                <p className="text-teal-50 text-lg md:text-xl font-medium opacity-90 max-w-2xl line-clamp-1">{community.tagline}</p>
              </div>

              <div className="mb-4 md:mb-6 flex gap-3">
                <div className="flex gap-2">
                  {isAdmin && (
                    <>
                      <Button 
                        onClick={() => setIsModerationOpen(true)}
                        className="bg-rose-500 hover:bg-rose-600 text-white h-14 w-14 rounded-2xl flex items-center justify-center transition-all shadow-xl shadow-rose-500/20"
                        title="Moderation"
                      >
                        <ShieldAlert size={24} />
                      </Button>
                      <Button 
                        onClick={() => setIsSettingsOpen(true)}
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 h-14 w-14 rounded-2xl flex items-center justify-center transition-all"
                      >
                        <Settings size={24} />
                      </Button>
                    </>
                  )}
                  {isMember ? (
                    <div className="flex gap-3">
                      <Button 
                        disabled
                        className="bg-emerald-50 text-emerald-600 border border-emerald-100 h-14 rounded-2xl px-10 font-black cursor-default opacity-100"
                      >
                         Joined
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <Button 
                        onClick={handleJoin}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white h-14 rounded-2xl px-10 font-black shadow-xl shadow-emerald-500/30 transition-all active:scale-95"
                      >
                        Join Community
                      </Button>
                      <Button 
                        onClick={handleOpenReportModal}
                        variant="ghost"
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 h-14 rounded-2xl px-8 font-black transition-all"
                      >
                        <Plus className="mr-2 w-5 h-5" />
                        Create Post
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-6 lg:px-8 py-6 md:pt-10 flex-1 lg:h-[calc(100vh-100px)] lg:overflow-hidden min-h-0">
        <main className="w-full h-full grid grid-cols-1 lg:grid-cols-10 gap-8 lg:overflow-hidden">
        {/* --- LEFT SIDEBAR: SHARED NAVIGATION --- */}
        <div className="order-2 lg:order-1 lg:col-span-2 lg:h-full lg:overflow-y-auto scrollbar-hidden hover:custom-scrollbar transition-all pt-2 pb-6">
          <NewsFeedSidebar 
              className="w-full h-fit"
              isAuthenticated={isAuthenticated}
              user={user}
              openLoginModal={openLoginModal}
              navigate={navigate}
              currentView="communities"
              communityNav={{
                activeTab: activeTab,
                onTabChange: handleTabChange,
                communityName: community.name,
                memberCount: community.membersCount,
                isMember: isMember,
                isAdmin: isAdmin,
                isModerator: isModerator
              }}
          />
        </div>

        {/* --- CENTER: COMMUNITY CONTENT --- */}
        <div className={cn(
          "order-1 pb-20 lg:pb-6 lg:h-full lg:overflow-y-auto scrollbar-hidden hover:custom-scrollbar transition-all pt-2 px-1 scroll-smooth",
          (activeTab === 'feed' || activeTab === 'needs') ? "lg:col-span-5 lg:order-2" : "lg:col-span-8 lg:order-2"
        )}>
          {/* MAIN CONTENT AREA */}
          <div className="space-y-6">
            {renderTabContent()}
          </div>
        </div>

        {/* --- RIGHT SIDEBAR: COMMUNITY STATS & INFO --- */}
        {(activeTab === 'feed' || activeTab === 'needs') && (
          <aside className="hidden lg:flex lg:col-span-3 lg:order-3 flex-col space-y-4 pt-2 pb-6 lg:h-full lg:overflow-y-auto scrollbar-hidden hover:custom-scrollbar transition-all">
            {activeTab === 'needs' && <ResourcesWidget />}
            
            {/* TODAY'S UPDATES PILL */}
            <div 
              className="bg-white rounded-full py-5 px-8 shadow-sm border border-gray-50 flex items-center justify-between group/pill cursor-pointer hover:shadow-md transition-all shrink-0"
              onClick={() => handleTabChange('announcements')}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover/pill:scale-110 transition-transform">
                  <Megaphone className="text-blue-500 w-5 h-5" />
                </div>
                <h3 className="text-slate-900 font-black text-xl tracking-tight">Today's Updates</h3>
              </div>
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{todayDisplay}</span>
            </div>

            {/* JOIN THE ACTION PILL */}
            <div 
              className="bg-white rounded-full py-5 px-8 shadow-sm border border-gray-50 flex items-center justify-between group/pill cursor-pointer hover:shadow-md transition-all shrink-0"
              onClick={() => handleTabChange('events')}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center group-hover/pill:scale-110 transition-transform">
                  <Calendar className="text-emerald-500 w-5 h-5" />
                </div>
                <h3 className="text-slate-900 font-black text-xl tracking-tight">Join the Action</h3>
              </div>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{todayDisplay}</span>
            </div>

            {/* LOCAL STATISTICS CARD */}
            <Card className="p-10 border-none shadow-sm bg-white rounded-[3rem] overflow-hidden relative">
              <div className="space-y-8">
                <div>
                  <h3 className="text-slate-400 font-extrabold text-[11px] uppercase tracking-[0.2em] mb-8">
                    Local Statistics
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Location */}
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0">
                        <MapPin className="text-teal-600 w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Location</p>
                        <p className="text-base font-black text-slate-900">{community.location || 'Manolo Fortich Bukidnon'}</p>
                      </div>
                    </div>

                    {/* Active Since */}
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                        <Calendar className="text-blue-500 w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Active Since</p>
                        <p className="text-base font-black text-slate-900">{community.activeSince || '2024'}</p>
                      </div>
                    </div>

                    {/* Resolved Cases */}
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                        <Heart className="text-emerald-500 w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Resolved Cases</p>
                        <p className="text-base font-black text-slate-900">188 Items</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-50">
                  <h3 className="text-slate-400 font-extrabold text-[11px] uppercase tracking-[0.2em] mb-6">
                    Top Contributors
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-3">
                      {(safeMembers.length > 0 ? safeMembers : STATIC_MEMBERS).slice(0, 4).map((member, i) => (
                        <Avatar 
                          key={member.id || i} 
                          className="w-10 h-10 border-4 border-white shadow-sm ring-1 ring-slate-100 bg-teal-500 font-black text-[10px] text-white"
                        >
                          {member.name.charAt(0)}
                        </Avatar>
                      ))}
                      {(safeMembers.length > 4 || (!safeMembers.length && STATIC_MEMBERS.length > 4)) && (
                        <div className="w-10 h-10 rounded-full bg-slate-50 border-4 border-white flex items-center justify-center text-[10px] font-black text-slate-400 ring-1 ring-slate-100">
                          +{(safeMembers.length || STATIC_MEMBERS.length) - 4}
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" className="text-teal-600 font-black text-[10px] uppercase tracking-widest hover:bg-teal-50">
                      View All
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8 border-none shadow-sm rounded-[2.5rem] bg-teal-600 text-white relative overflow-hidden group">
               <div className="relative z-10">
                  <AlertCircle className="w-10 h-10 mb-4 opacity-50" />
                  <h4 className="text-xl font-black mb-2">Community Watch</h4>
                  <p className="text-teal-100 text-sm font-medium leading-relaxed mb-6 opacity-80">
                     Help keep our neighborhood safe by reporting suspicious activity.
                  </p>
                  <Button className="w-full bg-white text-teal-600 font-black rounded-xl hover:bg-teal-50 transition-colors">
                    Learn More
                  </Button>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[60px] -mr-16 -mt-16"></div>
            </Card>

            <Card className="p-8 border-none shadow-sm rounded-[2.5rem] bg-teal-600 text-white relative overflow-hidden group">
               <div className="relative z-10">
                  <AlertCircle className="w-10 h-10 mb-4 opacity-50" />
                  <h4 className="text-xl font-black mb-2">Community Watch</h4>
                  <p className="text-teal-100 text-sm font-medium leading-relaxed mb-6 opacity-80">
                     Help keep our neighborhood safe by reporting suspicious activity.
                  </p>
                  <Button className="w-full bg-white text-teal-600 font-black rounded-xl hover:bg-teal-50 transition-colors">
                    Learn More
                  </Button>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[60px] -mr-16 -mt-16"></div>
            </Card>

            <Card className="p-8 rounded-[2.5rem] bg-white border-none shadow-sm">
              <h4 className="font-black text-slate-900 mb-6 flex items-center gap-2">
                <ShieldCheck size={20} className="text-teal-600" />
                Rules
              </h4>
              <ul className="space-y-4">
                {Array.isArray(community.rules) && community.rules.length > 0 ? community.rules.slice(0, 3).map((rule, i) => (
                  <li key={rule} className="flex gap-4">
                    <span className="w-6 h-6 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-[10px] font-black shrink-0">{i + 1}</span>
                    <p className="text-xs text-slate-500 font-medium line-clamp-2">{rule}</p>
                  </li>
                )) : (
                  <li className="text-slate-400 italic text-sm">No rules specified.</li>
                )}
              </ul>
            </Card>
          </aside>
        )}
      </main>
    </div>

      {/* --- FOOTER CTA (Mobile) --- */}
      <div className="md:hidden sticky bottom-4 mx-4 mb-4 z-50">
        <Button 
          onClick={handleOpenReportModal}
          className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl shadow-xl flex items-center justify-center gap-2 text-lg font-bold transition-transform active:scale-95 border-none"
        >
          <Plus className="w-6 h-6 border-2 rounded-md" />
          {activeTab === 'needs' ? 'Post a Need' : 'Create Post'}
        </Button>
      </div>

      {/* MODALS */}
      <CommunitySettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        community={community as any}
      />

      <CreateReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={refresh}
        communityId={id}
        initialType={activeTab === 'needs' ? 'Resource' : 'News'}
      />

      <ModerationOverviewModal 
        isOpen={isModerationOpen}
        onClose={() => setIsModerationOpen(false)}
        communityId={id}
      />
    </div>
  );
};

export default CommunityPage;