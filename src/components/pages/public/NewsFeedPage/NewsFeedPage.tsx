import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, 
  Search,
  ArrowUp
} from 'lucide-react';
import { useNewsFeed } from '@/hooks/useNewsFeed';
import { useStatistics } from '@/hooks/useStatistics';
import { useTrendingReports } from '@/hooks/useTrendingReports';
import { useCommunities } from '@/hooks/useCommunities';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Spinner
} from '../../../ui';
import { 
  CreateReportModal,
  InviteModal,
  ProfilePreviewModal
} from '../../../modals';
import { ReportDetailDrawer } from '@/components/features/reports/ReportDetail';
import { cn } from '@/lib/utils';
import { MessagesContainer } from '../../../features/messages/MessagesContainer';
import { CommunitiesContainer } from '../../../features/communities/CommunitiesContainer';
import { CommunityService } from '@/services/communityService';
import NewsFeedSidebar from './components/NewsFeedSidebar';
import NewsFeedHeader from './components/NewsFeedHeader';
import NewsFeedSkeleton from './components/NewsFeedSkeleton';
import NewsFeedCard from './components/NewsFeedCard';
import CommunitySidebar from './components/CommunitySidebar';

const NewsFeedPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isAuthenticated, user, openLoginModal } = useAuth();
  
  // State
  const [currentView, setCurrentView] = useState<'feed' | 'messages' | 'communities'>('feed');
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined);
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'distance'>('recent');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedCommunityForInvite, setSelectedCommunityForInvite] = useState<string>('');
  const [isSafetyExpanded, setIsSafetyExpanded] = useState(false);
  const [happeningToday, setHappeningToday] = useState<any[]>([]);
  const [happeningTodayLoading, setHappeningTodayLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  // Hooks
  const { 
    items: newsFeedItems, 
    loading: newsFeedLoading, 
    hasMore: newsFeedHasMore, 
    loadMore: loadMoreNewsFeed,
    refetch: refetchNewsFeed
  } = useNewsFeed({
    reportType: filter === 'all' ? undefined : filter.charAt(0).toUpperCase() + filter.slice(1),
    search: debouncedSearchQuery
  });
  
  const { 
    statistics 
  } = useStatistics();
  
  const { 
    trendingReports, 
    loading: trendingLoading 
  } = useTrendingReports();

  const {
    communities: joinedCommunities,
    refresh: refreshCommunities
  } = useCommunities();

  const handleJoinCommunity = async (id: string | number) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    
    try {
      const success = await CommunityService.joinCommunity(String(id));
      if (success) {
        refreshCommunities();
      }
    } catch (error) {
      console.error('Error joining community:', error);
    }
  };

  const handleActivityClick = (activity: any) => {
    setSelectedActivity(activity);
    setIsActivityModalOpen(true);
  };
  
  // New States for Profile previews
  const [selectedUserForPreview, setSelectedUserForPreview] = useState<any>(null);
  const [isProfilePreviewOpen, setIsProfilePreviewOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Implement Scroll Logic
  useEffect(() => {
    const handleScroll = () => {
      // Show button if page scrolled more than 400 pixels
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch unified "What's Happening Today" data (news, announcements, and events combined)
  useEffect(() => {
    const fetchHappeningToday = async () => {
      try {
        setHappeningTodayLoading(true);
        
        // Fetch combined activities from new unified endpoint
        const activities = await CommunityService.getTodayActivities();
        setHappeningToday(activities);
        
        setHappeningTodayLoading(false);
      } catch (error) {
        console.error('Error fetching happening today:', error);
        setHappeningTodayLoading(false);
      }
    };

    fetchHappeningToday();
  }, []);

  // Refs for Infinite Scroll
  const observerTarget = useRef<HTMLDivElement>(null);
  const handleOpenProfile = (user: any) => {
    setSelectedUserForPreview({
      ...user,
      location: 'FindrHub City Central',
      contactNumber: '+63 912 345 6789',
      joinDate: 'Joined March 2024'
    });
    setIsProfilePreviewOpen(true);
  };

  const handleStartMessage = (user: any) => {
    // In a real app, we'd check if a conversation exists or create one
    // For now, we'll just mock selecting "Sarah Johnson" if it's her (ID '1'), or default to '1'
    const mockId = user.username === 'sarahj' ? '1' : '1'; 
    setSelectedConversationId(mockId);
    setIsProfilePreviewOpen(false);
    setCurrentView('messages');
  };

  const handleOpenPostModal = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    setIsPostModalOpen(true);
  };

  const handleOpenCommunity = async (communityName: string) => {
    if (!communityName) return;
    
    // 1. Try to find in our already fetched joined communities list
    const community = joinedCommunities.find(c => 
      c.name.toLowerCase() === communityName.toLowerCase()
    );

    if (community) {
      navigate(`/community/${community.id || (community as any)._id}`);
      return;
    }

    // 2. If not found, call request to query the community by name
    try {
      const results = await CommunityService.searchCommunities(communityName);
      const matched = results.find(c => c.name.toLowerCase() === communityName.toLowerCase());
      
      if (matched) {
        navigate(`/community/${matched.id || (matched as any)._id}`);
      } else {
        // Fallback to search page if still not found
        navigate(`/communities/search?name=${encodeURIComponent(communityName)}`);
      }
    } catch (error) {
      console.error('Error finding community by name:', error);
      navigate(`/communities/search?name=${encodeURIComponent(communityName)}`);
    }
  };

  const handleViewChange = (view: 'feed' | 'messages' | 'communities') => {
    setCurrentView(view);
    // Sync with URL if possible, though mostly internal state for now
  };

  // Capture search query and actions from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search');
    if (q) {
      setSearchQuery(q);
      setDebouncedSearchQuery(q);
    }
    
    const action = params.get('action');
    if (action === 'create') {
      setIsPostModalOpen(true);
    }
  }, [location.search]);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Filter and Sort Logic
  const filteredItems = useMemo(() => {
    let result = newsFeedItems;

    // Sort by recent for now as standard, could add popular logic based on views
    if (sortBy === 'popular') {
      result = [...result].sort((a, b) => b.views - a.views);
    }

    return result;
  }, [newsFeedItems, sortBy]);

  // Infinite Scroll Handler
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries;
    if (target.isIntersecting && newsFeedHasMore && !newsFeedLoading) {
      loadMoreNewsFeed();
    }
  }, [newsFeedHasMore, newsFeedLoading, loadMoreNewsFeed]);

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0,
      root: null, // Use the viewport as root
      rootMargin: '200px', // Load more content before user reaches the end
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <div className="bg-gray-50 lg:h-[calc(100vh-100px)] lg:overflow-hidden flex flex-col lg:-mt-6">
      {/* --- UNIFIED FULL-WIDTH HEADER --- */}
      {currentView === 'feed' && (
        <div className="w-full px-3 md:px-6 lg:px-8 pt-1 md:pt-2 pb-1 md:pb-2 z-50 bg-gray-50 border-b border-gray-100/30">
          <div className="max-w-[1920px] mx-auto">
            <NewsFeedHeader 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filter={filter}
              setFilter={setFilter}
              showAdvancedFilters={showAdvancedFilters}
              setShowAdvancedFilters={setShowAdvancedFilters}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onPostClick={handleOpenPostModal}
            />
          </div>
        </div>
      )}

      <main className={cn(
        "w-full px-2 md:px-6 lg:px-8 py-2 md:py-4 flex-1 grid grid-cols-1 lg:grid-cols-10 gap-2 md:gap-4 lg:gap-8 min-h-0 overflow-y-auto lg:overflow-hidden",
        currentView !== 'feed' && "pt-2 md:pt-4"
      )}>
        {/* --- SIDEBAR: PROFILE & NAVIGATION --- */}
        <div className="hidden lg:block lg:col-span-2 lg:h-full lg:overflow-y-auto scrollbar-hidden hover:custom-scrollbar transition-all pt-1 md:pt-2 pb-6">
          <NewsFeedSidebar 
            className="w-full h-auto"
            isAuthenticated={isAuthenticated}
            user={user}
            openLoginModal={openLoginModal}
            navigate={navigate}
            currentView={currentView}
            onViewChange={handleViewChange}
          />
        </div>

        {/* --- CENTER: MAIN FEED (50%) or MESSAGES (ORDER 1 ON MOBILE, INDEPENDENT SCROLL ON DESKTOP) --- */}
        <div 
          className={cn(
            "order-1 pb-16 md:pb-20 lg:pb-6 scroll-smooth lg:h-full lg:overflow-y-auto scrollbar-hidden hover:custom-scrollbar transition-all pt-1 md:pt-2 px-1 md:px-1",
            currentView === 'feed' ? "lg:col-span-5 lg:order-2" : "lg:col-span-8 lg:order-2"
          )}
        >
          {currentView === 'feed' ? (
            <div className="space-y-2 md:space-y-4 h-auto w-full">
              {/* MAIN FEED */}
              <div className="space-y-2 md:space-y-4">
                {newsFeedItems.length === 0 && newsFeedLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <NewsFeedSkeleton key={i} />
                  ))
                ) : filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <NewsFeedCard 
                      key={item.id} 
                      item={item} 
                      onProfileClick={handleOpenProfile}
                      onCommunityClick={handleOpenCommunity}
                      onReportUpdate={refetchNewsFeed}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 md:py-12 bg-white rounded-2xl md:rounded-3xl border border-dashed border-gray-200 mx-1 md:mx-0">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="text-gray-300 w-8 h-8" />
                    </div>
                    <h3 className="text-gray-400 font-bold text-lg">{t('newsfeed.no_results')}</h3>
                    <p className="text-gray-400">{t('newsfeed.no_results_desc')}</p>
                    <Button 
                      variant="ghost" 
                      className="mt-4 text-teal-600"
                      onClick={() => {setFilter('all'); setSearchQuery('');}}
                    >
                      {t('newsfeed.clear_filters')}
                    </Button>
                  </div>
                )}

                {/* INFINITE SCROLL SENTINEL */}
                <div ref={observerTarget} className="py-6 md:py-8 flex justify-center">
                  {newsFeedLoading && (
                    <div className="flex flex-col items-center gap-2">
                      <Spinner size="lg" className="text-teal-600" />
                      <span className="text-xs text-teal-600 font-medium animate-pulse">{t('newsfeed.loading_rescues')}</span>
                    </div>
                  )}
                  {!newsFeedHasMore && filteredItems.length > 0 && (
                    <p className="text-gray-400 text-sm">{t('newsfeed.end_of_feed')}</p>
                  )}
                </div>
              </div>
            </div>
          ) : currentView === 'messages' ? (
            <MessagesContainer initialConversationId={selectedConversationId} />
          ) : (
            <CommunitiesContainer />
          )}
        </div>

        {/* --- SIDEBAR: COMMUNITY STATS & TRENDING - Hidden on mobile --- */}
        {currentView === 'feed' && (
          <div className="hidden lg:block lg:col-span-3 lg:h-full lg:overflow-y-auto scrollbar-hidden hover:custom-scrollbar transition-all pt-1 md:pt-2 pb-6 lg:order-3">
            <CommunitySidebar 
              className="w-full h-auto"
              statistics={statistics}
              trendingReports={trendingReports}
              trendingLoading={trendingLoading}
              navigate={navigate}
              joinedCommunities={joinedCommunities}
              onOpenInviteModal={(communityName) => {
                setSelectedCommunityForInvite(communityName);
                setIsInviteModalOpen(true);
              }}
              onOpenCreateCommunity={() => navigate('/communities/create')}
              onJoinCommunity={handleJoinCommunity}
              isSafetyExpanded={isSafetyExpanded}
              setIsSafetyExpanded={setIsSafetyExpanded}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              happeningToday={happeningToday}
              happeningTodayLoading={happeningTodayLoading}
              onActivityClick={handleActivityClick}
            />
          </div>
        )}
      </main>

      {/* --- FOOTER CTA - REMOVED FOR MOBILE OPTIMIZATION --- */}

      {/* MODALS */}
      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        communityName={selectedCommunityForInvite}
      />

      <CreateReportModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSuccess={refetchNewsFeed}
        initialType={
          filter === 'all' 
            ? 'Lost' 
            : filter.charAt(0).toUpperCase() + filter.slice(1)
        }
      />

      {/* Activity Detail Modal */}
      {isActivityModalOpen && selectedActivity && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[2rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {selectedActivity.type === 'event' && <span className="text-lg">🎉</span>}
                  {selectedActivity.type === 'announcement' && <span className="text-lg">⚠️</span>}
                  <span className={`text-xs font-black uppercase tracking-tighter px-2 py-1 rounded-full text-white ${
                    selectedActivity.type === 'event' ? 'bg-emerald-500' : 'bg-yellow-500'
                  }`}>
                    {selectedActivity.type === 'event' ? 'Event' : 'Announcement'}
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900">{selectedActivity.title}</h2>
                <p className="text-sm text-slate-500 mt-1">{selectedActivity.communityName || 'General Community'}</p>
              </div>
              <button
                onClick={() => setIsActivityModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Description */}
              {selectedActivity.description && (
                <div>
                  <h3 className="text-sm font-black text-slate-600 uppercase tracking-tight mb-2">Description</h3>
                  <p className="text-slate-700 leading-relaxed">{selectedActivity.description}</p>
                </div>
              )}

              {/* Event-specific details */}
              {selectedActivity.type === 'event' && (
                <>
                  {selectedActivity.startDate && (
                    <div>
                      <h3 className="text-sm font-black text-slate-600 uppercase tracking-tight mb-2">Date & Time</h3>
                      <p className="text-slate-700">
                        {new Date(selectedActivity.startDate).toLocaleString()}
                        {selectedActivity.endDate && ` - ${new Date(selectedActivity.endDate).toLocaleTimeString()}`}
                      </p>
                    </div>
                  )}

                  {selectedActivity.location && (
                    <div>
                      <h3 className="text-sm font-black text-slate-600 uppercase tracking-tight mb-2">Location</h3>
                      <p className="text-slate-700">{selectedActivity.location}</p>
                    </div>
                  )}

                  {selectedActivity.contactInfo && (
                    <div>
                      <h3 className="text-sm font-black text-slate-600 uppercase tracking-tight mb-2">Contact</h3>
                      <p className="text-slate-700">{selectedActivity.contactInfo}</p>
                    </div>
                  )}
                </>
              )}

              {/* Category */}
              {selectedActivity.category && (
                <div>
                  <h3 className="text-sm font-black text-slate-600 uppercase tracking-tight mb-2">Category</h3>
                  <p className="text-slate-700">{selectedActivity.category}</p>
                </div>
              )}

              {/* Date Created */}
              {selectedActivity.dateCreated && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-slate-400">
                    Posted on {new Date(selectedActivity.dateCreated).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-gray-100 p-6 flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setIsActivityModalOpen(false)}
              >
                {t('common.close') || 'Close'}
              </Button>
              {selectedActivity.communityId && (
                <Button
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  onClick={() => {
                    setIsActivityModalOpen(false);
                    navigate(`/community/${selectedActivity.communityId}`);
                  }}
                >
                  View Community
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <ProfilePreviewModal
        isOpen={isProfilePreviewOpen}
        onClose={() => setIsProfilePreviewOpen(false)}
        onMessageClick={handleStartMessage}
        user={selectedUserForPreview}
      />

      {/* Community profile is now a dedicated page at /community/:id */}

      {/* Floating Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-28 md:bottom-10 right-4 md:right-10 z-[100] p-4 bg-teal-600 text-white rounded-2xl shadow-2xl hover:bg-teal-700 hover:scale-110 active:scale-95 transition-all duration-300 animate-in fade-in zoom-in"
          title="Scroll to top"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}

      {/* Report Detail Drawer */}
      <ReportDetailDrawer />
    </div>
  );
};

export default NewsFeedPage;
