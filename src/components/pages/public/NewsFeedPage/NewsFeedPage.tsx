import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, 
  Search,
} from 'lucide-react';
import { useNewsFeed } from '@/hooks/useNewsFeed';
import { useStatistics } from '@/hooks/useStatistics';
import { useTrendingReports } from '@/hooks/useTrendingReports';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Spinner,
} from '../../../ui';
import { 
  CreateCommunityModal, 
  InviteModal, 
  CreateReportModal,
  ProfilePreviewModal,
  CommunityProfileModal
} from '../../../modals';
import { cn } from '@/lib/utils';
import { MessagesContainer } from '../../../features/messages/MessagesContainer';
import NewsFeedSidebar from './components/NewsFeedSidebar';
import NewsFeedHeader from './components/NewsFeedHeader';
import NewsFeedSkeleton from './components/NewsFeedSkeleton';
import NewsFeedCard from './components/NewsFeedCard';
import CommunitySidebar from './components/CommunitySidebar';

const NewsFeedPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isAuthenticated, openLoginModal } = useAuth();
  
  // Hooks
  const { 
    items: newsFeedItems, 
    loading: newsFeedLoading, 
    hasMore: newsFeedHasMore, 
    loadMore: loadMoreNewsFeed
  } = useNewsFeed();
  
  const { 
    statistics 
  } = useStatistics();
  
  const { 
    trendingReports, 
    loading: trendingLoading 
  } = useTrendingReports();

  // State
  const [currentView, setCurrentView] = useState<'feed' | 'messages'>('feed');
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined);
  const [filter, setFilter] = useState<'all' | 'lost' | 'found' | 'reunited'>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'distance'>('recent');
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedCommunityForInvite, setSelectedCommunityForInvite] = useState<string>('');
  const [isSafetyExpanded, setIsSafetyExpanded] = useState(false);
  
  // New States for Profile and Community previews
  const [selectedUserForPreview, setSelectedUserForPreview] = useState<any>(null);
  const [isProfilePreviewOpen, setIsProfilePreviewOpen] = useState(false);
  const [selectedCommunityForPreview, setSelectedCommunityForPreview] = useState<any>(null);
  const [isCommunityPreviewOpen, setIsCommunityPreviewOpen] = useState(false);

  // Mock Communities
  const joinedCommunities = [
    { id: 1, name: 'Green Valley Residents', members: 124, lastActivity: '2h ago', icon: '🏡', description: 'A community for residents of Green Valley.' },
    { id: 2, name: 'Tech Park Employees', members: 850, lastActivity: '5m ago', icon: '🏢', description: 'Collaborative hub for tech professionals.' },
    { id: 3, name: 'University of SHERRA', members: 3200, lastActivity: '1d ago', icon: '🎓', description: 'Central student and faculty network.' },
  ];

  const handleOpenProfile = (user: any) => {
    setSelectedUserForPreview({
      ...user,
      location: 'SHERRA City Central',
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

  const handleOpenCommunity = (communityName: string) => {
    const community = joinedCommunities.find(c => c.name === communityName);
    if (community) {
      navigate(`/community/${community.id}`);
    } else {
      // fallback to searching by name
      navigate(`/community/search?name=${encodeURIComponent(communityName)}`);
    }
  };

  // Capture search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search');
    if (q) {
      setSearchQuery(q);
      setDebouncedSearchQuery(q);
    }
  }, [location.search]);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Refs for Infinite Scroll
  const observerTarget = useRef<HTMLDivElement>(null);

  // Filter and Sort Logic
  const filteredItems = useMemo(() => {
    let result = newsFeedItems;

    if (filter !== 'all') {
      result = result.filter(item => item.status === filter);
    }

    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query)
      );
    }

    // Sort by recent for now as standard, could add popular logic based on views
    if (sortBy === 'popular') {
      result = [...result].sort((a, b) => b.views - a.views);
    }

    return result;
  }, [newsFeedItems, filter, searchQuery, sortBy]);

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
      threshold: 1.0,
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 w-full px-4 md:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-10 gap-8">
        {/* --- LEFT SIDEBAR: PROFILE & NAVIGATION (20%) --- */}
        <NewsFeedSidebar 
          isAuthenticated={isAuthenticated}
          openLoginModal={openLoginModal}
          navigate={navigate}
          currentView={currentView}
          onViewChange={(view) => setCurrentView(view)}
        />

        {/* --- CENTER: MAIN FEED (50%) or MESSAGES --- */}
        <div className={cn(
          "space-y-6",
          currentView === 'messages' ? "lg:col-span-8" : "lg:col-span-5"
        )}>
          {currentView === 'feed' ? (
            <>
              <NewsFeedHeader 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filter={filter}
                setFilter={setFilter}
                showAdvancedFilters={showAdvancedFilters}
                setShowAdvancedFilters={setShowAdvancedFilters}
                sortBy={sortBy}
                setSortBy={setSortBy}
                onPostClick={() => setIsPostModalOpen(true)}
              />

              {/* MAIN FEED */}
              <div className="space-y-6">
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
            </>
          ) : (
            <MessagesContainer initialConversationId={selectedConversationId} />
          )}
        </div>

        {/* --- RIGHT SIDEBAR: COMMUNITY STATS & TRENDING (30%) --- */}
        {currentView === 'feed' && (
          <CommunitySidebar 
            statistics={statistics}
            trendingReports={trendingReports}
            trendingLoading={trendingLoading}
            navigate={navigate}
            joinedCommunities={joinedCommunities}
            onOpenInviteModal={(communityName) => {
              setSelectedCommunityForInvite(communityName);
              setIsInviteModalOpen(true);
            }}
            isSafetyExpanded={isSafetyExpanded}
            setIsSafetyExpanded={setIsSafetyExpanded}
          />
        )}
      </main>

      {/* --- FOOTER CTA --- */}
      <div className="md:hidden sticky bottom-4 mx-4 mb-4">
        <Button 
          onClick={() => navigate('/hub/report')}
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
      />

      <ProfilePreviewModal
        isOpen={isProfilePreviewOpen}
        onClose={() => setIsProfilePreviewOpen(false)}
        onMessageClick={handleStartMessage}
        user={selectedUserForPreview}
      />

      {/* Community profile is now a dedicated page at /community/:id */}
    </div>
  );
};

export default NewsFeedPage;
