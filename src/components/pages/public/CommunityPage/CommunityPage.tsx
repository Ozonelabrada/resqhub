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
  Lock,
  Clock,
  X,
  MessageSquare
} from 'lucide-react';
import { Button, Card, Avatar, Spinner, ShadcnBadge as Badge } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { CommunitySettingsModal, CreateReportModal, ModerationOverviewModal, CreateEventAnnouncementModal, CreateCalendarModal, CommunityReportModal } from '@/components/modals';
import type { EventAnnouncementFormData } from '@/components/modals/EventAnnouncement/CreateEventAnnouncementModal';
import type { CreateCalendarFormData } from '@/components/modals/Calendar/CreateCalendarModal';
import { cn } from '@/lib/utils';
import { useCommunityDetail } from '@/hooks/useCommunities';
import { CommunityChat } from '@/components/features/messages/CommunityChat';
import { CommunityService } from '@/services/communityService';

// Global Sidebar Component
import NewsFeedSidebar from '@/components/pages/public/NewsFeedPage/components/NewsFeedSidebar';
import type { CommunityTabType } from '@/components/pages/public/NewsFeedPage/components/NewsFeedSidebar';

import { CommunityFeed } from './components/CommunityFeed';
import { NeedsBoard } from './components/NeedsBoard';
import { ResourcesWidget } from './components/ResourcesWidget';
import { CommunityMembers } from './components/CommunityMembers';
import { CommunityAbout } from './components/CommunityAbout';
import { CommunityTrade } from './components/CommunityTrade';
import { CommunityEvents } from './components/CommunityEvents';
import { CommunityAnnouncements } from './components/CommunityAnnouncements';
import { CommunityNews } from './components/CommunityNews';
import { CommunityResources } from './components/CommunityResources';
import { t } from 'i18next';

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
    error,
    join,
    approveRequest,
    rejectRequest,
    refresh
  } = useCommunityDetail(id);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCommunityReportModalOpen, setIsCommunityReportModalOpen] = useState(false);
  const [communityReportType, setCommunityReportType] = useState<'News' | 'Announcement' | 'Event' | 'Discussion'>('News');
  const [isUpdatesModalOpen, setIsUpdatesModalOpen] = useState(false);
  const [isUpdatesModalType, setIsUpdatesModalType] = useState<'announcement' | 'news' | 'events'>('news');
  const [activeUpdatesSubTab, setActiveUpdatesSubTab] = useState<'news' | 'announcements' | 'events'>('news');
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [calendarModalType, setCalendarModalType] = useState<'announcement' | 'events'>('announcement');
  const [isModerationOpen, setIsModerationOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

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

  const handleAnnouncementSuccess = (data: EventAnnouncementFormData) => {
    setIsUpdatesModalOpen(false);
    console.log('Announcement created:', data);
    refresh();
  };

  const handleNewsSuccess = (data: EventAnnouncementFormData) => {
    setIsUpdatesModalOpen(false);
    console.log('News created:', data);
    refresh();
  };

  const handleEventSuccess = (data: EventAnnouncementFormData) => {
    setIsUpdatesModalOpen(false);
    console.log('Event created:', data);
    refresh();
  };

  const handleCalendarSuccess = async (data: CreateCalendarFormData) => {
    try {
      // Send calendar entries to backend
      if (data.calendarEntries && data.calendarEntries.length > 0 && community?.id) {
        const calendarData = {
          communityId: community.id,
          events: data.calendarEntries.map(entry => {
            // Convert date + time to ISO datetime string
            const dateTimeStr = entry.time 
              ? `${entry.date}T${entry.time}:00`
              : `${entry.date}T00:00:00`;
            const dateTime = new Date(dateTimeStr).toISOString();
            
            return {
              title: entry.title,
              description: entry.description,
              category: entry.category,
              fromDate: dateTime,
              toDate: dateTime,
              time: entry.time || '00:00',
              location: entry.location || '',
            };
          }),
        };
        
        console.log('Sending calendar data to backend:', calendarData);
        const result = await CommunityService.createCalendarEvents(calendarData);
        
        if (result.success) {
          console.log('Calendar events saved to backend successfully');
          setIsCalendarModalOpen(false);
          refresh();
        } else {
          console.error('Failed to save calendar events:', result.message);
          alert(result.message || 'Failed to create calendar events');
        }
      } else {
        console.error('Missing required data for calendar creation');
      }
    } catch (error) {
      console.error('Error saving calendar events:', error);
      alert('Error saving calendar events. Please try again.');
    }
  };

  const handleCommunityReportSuccess = () => {
    setIsCommunityReportModalOpen(false);
    console.log('Community report created');
    refresh();
  };

  const handleOpenCalendarModal = (type: 'announcement' | 'events') => {
    setCalendarModalType(type);
    setIsCalendarModalOpen(true);
  };

  const handleOpenCommunityReportModal = (type: 'News' | 'Announcement' | 'Event' | 'Discussion') => {
    setCommunityReportType(type);
    setIsCommunityReportModalOpen(true);
  };

  const handleOpenUpdatesModal = (type: 'announcement' | 'news' | 'events') => {
    setIsUpdatesModalType(type);
    setIsUpdatesModalOpen(true);
  };

  const handleJoin = async () => {
    if (!isAuthenticated) return openLoginModal();
    await join();
  };

  const handleTabChange = (tab: CommunityTabType) => setSearchParams({ tab });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner size="lg" className="text-teal-600" />
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mb-6 text-rose-500 shadow-xl shadow-rose-100/50">
          <AlertCircle size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight mb-2">{t('newsfeed.community_not_found')}</h2>
        <p className="text-slate-500 font-medium mb-10 max-w-md mx-auto leading-relaxed">
          {error || t('newsfeed.community_not_found_desc')}
        </p>
        <Button 
          onClick={() => navigate('/communities')} 
          className="bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl px-12 h-16 shadow-xl shadow-teal-100 uppercase tracking-widest text-sm"
        >
          {t('newsfeed.explore_other_communities')}
        </Button>
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
        {t('newsfeed.join_to_unlock')}
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
      case 'updates':
        return isMember || isAdmin ? (
          <>
            {/* Sub-tabs for Updates */}
            <div className="flex gap-2 mb-6 border-b border-slate-200">
              <button
                onClick={() => setActiveUpdatesSubTab('news')}
                className={`px-6 py-3 font-bold text-sm transition-all border-b-2 -mb-[2px] ${
                  activeUpdatesSubTab === 'news'
                    ? 'text-teal-600 border-teal-600'
                    : 'text-slate-500 border-transparent hover:text-teal-600'
                }`}
              >
                {t('hub.news')}
              </button>
              <button
                onClick={() => setActiveUpdatesSubTab('announcements')}
                className={`px-6 py-3 font-bold text-sm transition-all border-b-2 -mb-[2px] ${
                  activeUpdatesSubTab === 'announcements'
                    ? 'text-teal-600 border-teal-600'
                    : 'text-slate-500 border-transparent hover:text-teal-600'
                }`}
              >
                {t('hub.announcements')}
              </button>
              <button
                onClick={() => setActiveUpdatesSubTab('events')}
                className={`px-6 py-3 font-bold text-sm transition-all border-b-2 -mb-[2px] ${
                  activeUpdatesSubTab === 'events'
                    ? 'text-teal-600 border-teal-600'
                    : 'text-slate-500 border-transparent hover:text-teal-600'
                }`}
              >
                {t('common.events')}
              </button>
            </div>

            {/* Sub-tab Content */}
            <div className="space-y-6">
              {activeUpdatesSubTab === 'news' && (
                <CommunityNews 
                  isAdmin={isPrivileged}
                  onOpenNewsModal={() => handleOpenUpdatesModal('news')}
                  communityId={community?.id}
                />
              )}
              {activeUpdatesSubTab === 'announcements' && (
                <CommunityAnnouncements 
                  isAdmin={isPrivileged} 
                  isAnnouncementModalOpen={false}
                  onOpenAnnouncementModal={() => handleOpenUpdatesModal('announcement')}
                  onOpenCalendarModal={() => handleOpenCalendarModal('announcement')}
                  communityId={community?.id}
                />
              )}
              {activeUpdatesSubTab === 'events' && (
                <CommunityEvents 
                  isAdmin={isPrivileged}
                  isEventModalOpen={false}
                  onOpenEventModal={() => handleOpenUpdatesModal('events')}
                  onOpenCalendarModal={() => handleOpenCalendarModal('events')}
                  communityId={community?.id}
                />
              )}
            </div>

            <CreateEventAnnouncementModal
              key="updates-modal-community"
              isOpen={isUpdatesModalOpen}
              onClose={() => setIsUpdatesModalOpen(false)}
              type={isUpdatesModalType}
              communityId={community?.id}
              onSuccess={(data) => {
                if (isUpdatesModalType === 'announcement') handleAnnouncementSuccess(data);
                else if (isUpdatesModalType === 'news') handleNewsSuccess(data);
                else handleEventSuccess(data);
              }}
            />

            <CreateCalendarModal
              key="calendar-modal-community"
              isOpen={isCalendarModalOpen}
              onClose={() => setIsCalendarModalOpen(false)}
              type={calendarModalType}
              onSuccess={handleCalendarSuccess}
            />
          </>
        ) : (
          <RestrictedContent 
            title={t('newsfeed.announcements_locked')} 
            description={t('newsfeed.announcements_locked_desc')}
          />
        );
      case 'trade': return isMember || isPrivileged ? (
        <CommunityTrade />
      ) : (
        <RestrictedContent 
          title={t('newsfeed.marketplace_locked')} 
          description={t('newsfeed.marketplace_locked_desc')}
        />
      );
      case 'resources':
        return isMember || isAdmin ? (
          <CommunityResources />
        ) : (
          <RestrictedContent 
            title={t('newsfeed.resources_locked')} 
            description={t('newsfeed.resources_locked_desc')}
          />
        );
      case 'needs': 
        return <NeedsBoard posts={posts?.filter(p => ['Resource', 'Service', 'Volunteer', 'Request', 'Need'].includes(p.reportType || ''))} />;
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
          title={t('newsfeed.members_locked')} 
          description={t('newsfeed.members_locked_desc')}
        />
      );
      case 'about': return <CommunityAbout community={community} />;
      default: return null;
    }
  };

  const today = new Date().toISOString().split('T')[0];

  // These will be populated from backend data in the respective components
  const todaysAnnouncements: any[] = [];
  const todaysEvents: any[] = [];

  return (
    <div className="min-h-screen lg:h-[calc(100vh-60px)] flex flex-col bg-slate-50 lg:overflow-hidden lg:-mt-10">
      {/* --- COMMUNITY HEADER: FULL WIDTH TOP SECTION --- */}
      <div className="w-full relative shrink-0 z-30">
        {/* Community Banner - Full Screen Width Background */}
        <div className="h-64 md:h-72 bg-slate-900 relative overflow-visible text-white shadow-2xl">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500 rounded-full -mr-64 -mt-64 blur-[120px]"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500 rounded-full -ml-48 -mb-48 blur-[100px]"></div>
          </div>
          
          {/* Banner content - Full Width Content */}
          <div className="h-full w-full px-4 md:px-6 lg:px-8 flex items-end pb-12 md:pb-16">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 w-full relative z-10">
              {/* Profile Avatar / Logo - Overlapping Banner */}
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] md:rounded-[4rem] bg-white p-2 shadow-2xl z-20 -mb-20 md:-mb-28 border-4 border-white overflow-hidden transition-transform hover:scale-105 duration-500">
                {community.logo || community.imageUrl ? (
                  <img 
                    src={community.logo || community.imageUrl || ''} 
                    alt={community.name} 
                    className="w-full h-full rounded-[2.2rem] md:rounded-[3.5rem] object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-[2.2rem] md:rounded-[3.5rem] bg-gradient-to-br from-teal-500 to-emerald-400 flex items-center justify-center text-4xl md:text-7xl font-black text-white">
                    {community.name?.charAt(0)}
                  </div>
                )}
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
                        title={t('newsfeed.moderation')}
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
                         {t('newsfeed.joined')}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <Button 
                        onClick={handleJoin}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white h-14 rounded-2xl px-10 font-black shadow-xl shadow-emerald-500/30 transition-all active:scale-95"
                      >
                        {t('newsfeed.join_community')}
                      </Button>
                      <Button 
                        onClick={handleOpenReportModal}
                        variant="ghost"
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 h-14 rounded-2xl px-8 font-black transition-all"
                      >
                        <Plus className="mr-2 w-5 h-5" />
                        {t('newsfeed.create_post')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-6 lg:px-8 py-2 md:pt-4 flex-1 lg:h-full lg:overflow-hidden min-h-0">
        <main className="w-full h-full grid grid-cols-1 lg:grid-cols-10 gap-6 lg:overflow-hidden">
        {/* --- LEFT SIDEBAR: SHARED NAVIGATION --- */}
        <div className="order-2 lg:order-1 lg:col-span-2 lg:h-full lg:overflow-y-auto lg:overflow-x-hidden scrollbar-hidden hover:custom-scrollbar transition-all pt-2 pb-6 min-w-0">
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
                memberCount: community.membersCount || 0,
                isMember: isMember,
                isAdmin: isAdmin,
                isModerator: isModerator
              }}
          />
        </div>

        {/* --- CENTER: COMMUNITY CONTENT --- */}
        <div className={cn(
          "order-1 pb-20 lg:pb-6 lg:h-full lg:overflow-y-auto lg:overflow-x-hidden scrollbar-hidden hover:custom-scrollbar transition-all pt-2 px-1 scroll-smooth min-w-0",
          (activeTab === 'feed' || activeTab === 'needs') ? "lg:col-span-5 lg:order-2" : "lg:col-span-8 lg:order-2"
        )}>
          {/* MAIN CONTENT AREA */}
          <div className="space-y-6">
            {renderTabContent()}
          </div>
        </div>

        {/* --- RIGHT SIDEBAR: COMMUNITY STATS & INFO --- */}
        {(activeTab === 'feed' || activeTab === 'needs') && (
          <aside className="hidden lg:flex lg:col-span-3 lg:order-3 flex-col space-y-4 pt-2 pb-6 lg:h-full lg:overflow-y-auto lg:overflow-x-hidden scrollbar-hidden hover:custom-scrollbar transition-all min-w-0">
            {activeTab === 'needs' && <ResourcesWidget />}
            
            {/* TODAY'S UPDATES SECTION */}
            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-50 flex flex-col gap-4 group/card hover:shadow-md transition-all shrink-0">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => handleTabChange('updates')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center group-hover/card:scale-110 transition-transform">
                    <Megaphone className="text-blue-500 w-5 h-5" />
                  </div>
                  <h3 className="text-slate-900 font-black text-lg tracking-tight">{t('common.todays_updates')}</h3>
                </div>
                <Badge variant="outline" className="text-[9px] border-blue-100 text-blue-500 font-black uppercase tracking-tighter">
                  {t('newsfeed.new_updates_count', { count: todaysAnnouncements.length })}
                </Badge>
              </div>

              <div className="space-y-3">
                {todaysAnnouncements.length > 0 ? (
                  todaysAnnouncements.slice(0, 2).map((ann) => (
                    <div key={ann.id} className="p-3 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-100 transition-colors cursor-pointer" onClick={() => handleTabChange('updates')}>
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{(ann as any).category || 'Zone 2'}</p>
                      <p className="text-sm font-bold text-slate-800 line-clamp-1">{ann.title}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic px-2">{t('newsfeed.no_new_updates')}</p>
                )}
              </div>
            </div>

            {/* JOIN THE ACTION SECTION */}
            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-50 flex flex-col gap-4 group/card hover:shadow-md transition-all shrink-0">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => handleTabChange('updates')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover/card:scale-110 transition-transform">
                    <Calendar className="text-emerald-500 w-5 h-5" />
                  </div>
                  <h3 className="text-slate-900 font-black text-lg tracking-tight">{t('common.join_the_action')}</h3>
                </div>
                <Badge variant="outline" className="text-[9px] border-emerald-100 text-emerald-500 font-black uppercase tracking-tighter">
                  {todaysEvents.length} {t('newsfeed.today_caps')}
                </Badge>
              </div>

              <div className="space-y-3">
                {todaysEvents.length > 0 ? (
                  todaysEvents.slice(0, 2).map((event) => (
                    <div key={event.id} className="flex items-center gap-3 p-3 bg-emerald-50/30 rounded-2xl hover:bg-emerald-50 transition-colors cursor-pointer" onClick={() => handleTabChange('updates')}>
                      <div className="flex flex-col items-center justify-center bg-white min-w-[40px] h-10 rounded-xl shadow-sm border border-emerald-100">
                        <span className="text-[10px] font-black text-emerald-600 leading-none">JAN</span>
                        <span className="text-sm font-black text-slate-800 leading-none">12</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{event.title}</p>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                          <Clock size={10} />
                          <span>{event.time || 'All Day'}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic px-2">{t('newsfeed.quiet_day_check_back')}</p>
                )}
              </div>
            </div>

            {/* LOCAL STATISTICS CARD */}
            <Card className="p-7 border-none shadow-sm bg-white rounded-[2.5rem] relative group">
              {/* Subtle Background Pattern */}
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <TrendingUp size={120} />
              </div>

              <div className="relative z-10 space-y-7">
                <div>
                  <h3 className="text-slate-400 font-extrabold text-[11px] uppercase tracking-[0.2em] mb-6">
                    {t('common.local_statistics')}
                  </h3>
                  
                  <div className="space-y-5">
                    {/* Location */}
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0">
                        <MapPin className="text-teal-600 w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">{t('common.location')}</p>
                        <p className="text-sm font-black text-slate-900 truncate">{community.location || 'Manolo Fortich, Bukidnon'}</p>
                      </div>
                    </div>

                    {/* Active Since */}
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                        <Calendar className="text-blue-500 w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">{t('common.active_since')}</p>
                        <p className="text-sm font-black text-slate-900 truncate">{community.foundedDate || '2024'}</p>
                      </div>
                    </div>

                    {/* Impact/Resolved Cases - Dynamic Data */}
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                        <Heart className="text-emerald-500 w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">{t('common.resolved_cases')}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-black text-slate-900">
                            {t('common.items_count', { count: 188 })}
                          </p>
                          <Badge className="bg-emerald-100 text-emerald-600 border-none text-[8px] font-bold px-1.5 h-3.5">
                            +{'12'}%
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Community Strength/Engagement */}
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                        <TrendingUp className="text-amber-500 w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">{t('newsfeed.engagement')}</p>
                        <p className="text-sm font-black text-slate-900 truncate">{t('newsfeed.high_activity')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contributors Section */}
                <div className="pt-6 border-t border-slate-50">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-slate-400 font-extrabold text-[11px] uppercase tracking-[0.2em]">
                      {t('common.top_contributors')}
                    </h3>
                    <Badge variant="outline" className="text-[8px] font-black text-teal-600 border-teal-100 uppercase">
                      {safeMembers.length || 0}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-3">
                      {(safeMembers.length > 0 ? safeMembers : STATIC_MEMBERS).slice(0, 4).map((member, i) => (
                        <Avatar 
                          key={member.id || i} 
                          className="w-10 h-10 border-4 border-white shadow-sm ring-1 ring-slate-100 bg-gradient-to-br from-teal-500 to-emerald-400 font-black text-[10px] text-white uppercase"
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
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleTabChange('members')}
                      className="text-teal-600 font-black text-[10px] uppercase tracking-widest hover:bg-teal-50 px-3 h-8 rounded-xl"
                    >
                      View All
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8 border-none shadow-sm rounded-[2.5rem] bg-teal-600 text-white relative group">
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

      {/* --- FLOATING COMMUNITY CHAT --- */}
      {(isMember || isAdmin) && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          {isChatOpen && (
            <div className="w-[380px] h-[550px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden mb-2 animate-in slide-in-from-bottom-5 duration-300">
              <div className="bg-teal-600 p-5 flex items-center justify-between text-white shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                    <MessageSquare size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-wider">Community Live Chat</h4>
                    <p className="text-[10px] text-teal-100 font-bold opacity-80">{community.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsChatOpen(false)} 
                  className="hover:bg-white/10 p-2 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="h-[460px] relative">
                 <CommunityChat communityId={id!} communityName={community.name} />
              </div>
            </div>
          )}
          
          <Button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={cn(
              "w-16 h-16 rounded-[2rem] shadow-2xl flex items-center justify-center transition-all active:scale-95 border-none",
              isChatOpen 
                ? "bg-slate-900 hover:bg-slate-800 rotate-90" 
                : "bg-teal-600 hover:bg-teal-700 hover:scale-110"
            )}
          >
            {isChatOpen ? <X size={28} className="text-white" /> : <MessageSquare size={28} className="text-white" />}
            {!isChatOpen && (
               <span className="absolute -top-1 -right-1 flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500 border-2 border-white"></span>
               </span>
            )}
          </Button>
        </div>
      )}

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

      <CommunityReportModal
        isOpen={isCommunityReportModalOpen}
        onClose={() => setIsCommunityReportModalOpen(false)}
        onSuccess={handleCommunityReportSuccess}
        communityId={id || ''}
        reportType={communityReportType}
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