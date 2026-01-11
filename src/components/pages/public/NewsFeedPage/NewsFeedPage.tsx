import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, 
  Search,
  ArrowUp,
  Filter,
  X
} from 'lucide-react';
import { useNewsFeed } from '@/hooks/useNewsFeed';
import { useStatistics } from '@/hooks/useStatistics';
import { useTrendingReports } from '@/hooks/useTrendingReports';
import { useCommunities } from '@/hooks/useCommunities';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Spinner,
  ShadcnSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../../ui';
import { 
  CreateCommunityModal, 
  InviteModal, 
  CreateReportModal,
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
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedCommunityForInvite, setSelectedCommunityForInvite] = useState<string>('');
  const [isSafetyExpanded, setIsSafetyExpanded] = useState(false);

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
    loading: communitiesLoading,
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
        <div className="w-full px-4 md:px-6 lg:px-8 pt-4 pb-2 z-50 bg-gray-50 border-b border-gray-100/30">
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
        "w-full px-4 md:px-6 lg:px-8 py-0 flex-1 grid grid-cols-1 lg:grid-cols-10 gap-8 min-h-0 overflow-y-auto lg:overflow-hidden",
        currentView !== 'feed' && "pt-4"
      )}>
        {/* --- SIDEBAR: PROFILE & NAVIGATION --- */}
        <div className="order-2 lg:order-1 lg:col-span-2 lg:h-full lg:overflow-y-auto scrollbar-hidden hover:custom-scrollbar transition-all pt-2 pb-6">
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
            "order-1 pb-20 lg:pb-6 scroll-smooth lg:h-full lg:overflow-y-auto scrollbar-hidden hover:custom-scrollbar transition-all pt-2 px-1",
            currentView === 'feed' ? "lg:col-span-5 lg:order-2" : "lg:col-span-8 lg:order-2"
          )}
        >
          {currentView === 'feed' ? (
            <div className="space-y-6 h-auto">
              {/* MAIN FEED */}
              <div className="space-y-6 px-1">
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
                    />
                  ))
                ) : (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="text-gray-300 w-8 h-8" />
                    </div>
                    <h3 className="text-gray-400 font-bold text-lg">No results</h3>
                    <p className="text-gray-400">Try adjusting your filters or search query.</p>
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
                <div ref={observerTarget} className="py-8 flex justify-center">
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

        {/* --- SIDEBAR: COMMUNITY STATS & TRENDING --- */}
        {currentView === 'feed' && (
          <div className="order-3 lg:order-3 lg:col-span-3 lg:h-full lg:overflow-y-auto scrollbar-hidden hover:custom-scrollbar transition-all pt-2 pb-6">
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
              onOpenCreateCommunity={() => setIsCommunityModalOpen(true)}
              onJoinCommunity={handleJoinCommunity}
              isSafetyExpanded={isSafetyExpanded}
              setIsSafetyExpanded={setIsSafetyExpanded}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
        )}
      </main>

      {/* --- FOOTER CTA --- */}
      <div className="md:hidden sticky bottom-4 mx-4 mb-4">
        <Button 
          onClick={handleOpenPostModal}
          className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl shadow-xl flex items-center justify-center gap-2 text-lg font-bold transition-transform active:scale-95"
        >
          <Plus className="w-6 h-6 border-2 rounded-md" />
          Report Lost/Found
        </Button>
      </div>

      {/* MODALS */}
      <CreateCommunityModal 
        isOpen={isCommunityModalOpen} 
        onClose={() => setIsCommunityModalOpen(false)} 
      />
      
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
