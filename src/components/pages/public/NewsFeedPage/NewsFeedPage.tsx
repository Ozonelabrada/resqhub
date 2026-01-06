import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Filter, 
  ChevronDown, 
  MapPin,
  Calendar,
  MessageSquare,
  Share2,
  TrendingUp,
  Award,
  ShieldAlert,
  Bell,
  ChevronRight,
  CheckCircle,
  Bookmark
} from 'lucide-react';
import { useNewsFeed } from '../../../../hooks/useNewsFeed';
import { useStatistics } from '../../../../hooks/useStatistics';
import { useTrendingReports } from '../../../../hooks/useTrendingReports';
import { useAuth } from '../../../../context/AuthContext';
import {
  Button,
  Card,
  Input,
  ShadcnSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
  Badge,
  Skeleton,
  Logo,
  Avatar
} from '../../../ui';
import { cn } from '../../../../lib/utils';
import type { NewsFeedItem } from '../PersonalHubPage/personalHub/NewsFeed';

const NewsFeedPage: React.FC = () => {
  const navigate = useNavigate();
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
  const [filter, setFilter] = useState<'all' | 'lost' | 'found' | 'reunited'>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'distance'>('recent');

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
      {/* --- STICKY HEADER --- */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo className="h-8 w-auto" />
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {isAuthenticated ? (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-500 hover:text-teal-600 relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-orange-600 rounded-full border-2 border-white" />
              </Button>
              <Button 
                onClick={() => navigate('/hub')}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-full px-4 md:px-6 transition-all"
              >
                My Hub
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => openLoginModal()}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-full px-6 transition-all"
            >
              Sign In
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* --- LEFT SIDE: FILTERS & MAIN FEED --- */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* SEARCH BAR (TOP) */}
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-600 w-5 h-5" />
              <Input 
                placeholder="Search lost items..." 
                className="pl-12 h-14 bg-transparent border-none text-lg font-medium placeholder:text-gray-400 focus-visible:ring-0 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search lost items"
              />
            </div>
          </div>

          {/* FILTER BAR */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between overflow-x-auto pb-2 scrollbar-none gap-2">
                <div className="flex items-center gap-2 flex-nowrap">
                  {(['all', 'lost', 'found', 'reunited'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilter(type)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap capitalize",
                        filter === type 
                          ? "bg-teal-600 text-white shadow-md shadow-teal-100" 
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={cn(
                    "flex items-center gap-1 transition-colors",
                    showAdvancedFilters ? "text-orange-600" : "text-gray-500 hover:text-teal-600"
                  )}
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Advanced</span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", showAdvancedFilters && "rotate-180")} />
                </Button>
              </div>

              {/* Advanced Controls */}
              {showAdvancedFilters && (
                <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
                  <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                    <SelectTrigger className="w-full sm:w-[180px] rounded-xl border-gray-200">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="distance">Near Me</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* MAIN FEED */}
          <div className="space-y-6">
            {newsFeedItems.length === 0 && newsFeedLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <NewsFeedSkeleton key={i} />
              ))
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <NewsFeedCard key={item.id} item={item} />
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
                  Clear all filters
                </Button>
              </div>
            )}

            {/* INFINITE SCROLL SENTINEL */}
            <div ref={observerTarget} className="py-8 flex justify-center">
              {newsFeedLoading && (
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="lg" className="text-teal-600" />
                  <span className="text-xs text-teal-600 font-medium animate-pulse">Loading amazing rescues...</span>
                </div>
              )}
              {!newsFeedHasMore && filteredItems.length > 0 && (
                <p className="text-gray-400 text-sm">You've reached the end of the line! 🎉</p>
              )}
            </div>
          </div>
        </div>

        {/* --- RIGHT SIDEBAR: DESKTOP ONLY --- */}
        <aside className="hidden lg:block lg:col-span-4 space-y-6 sticky top-24 h-fit">
          
          {/* STATS CARD */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-full -mr-12 -mt-12 opacity-50" />
            <h3 className="text-gray-900 font-bold text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="text-teal-600 w-5 h-5" />
              Community Impact
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Reports</span>
                <p className="text-2xl font-black text-gray-900">{statistics?.totalItems || 0}</p>
              </div>
              <div className="space-y-1">
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Resolved</span>
                <p className="text-2xl font-black text-teal-600">{statistics?.successfulMatches || 0}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-gray-600">Active searches</span>
                <span className="text-orange-600">{statistics?.activeReports || 0}</span>
              </div>
            </div>
          </div>

          {/* TRENDING CARD */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-gray-900 font-bold text-lg mb-4 flex items-center gap-2">
              <Award className="text-emerald-600 w-5 h-5" />
              Trending Now
            </h3>
            <div className="space-y-4">
              {trendingLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))
              ) : trendingReports.slice(0, 3).map((report: any) => (
                <div key={report.id} className="group flex items-start gap-3 cursor-pointer" onClick={() => navigate(`/hub/${report.id}`)}>
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {report.images?.[0] ? (
                      <img src={report.images[0]} alt="" className="object-cover w-full h-full group-hover:scale-110 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Plus className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-teal-600 transition-colors">{report.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{report.location}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 self-center group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-teal-600 text-xs font-semibold hover:bg-teal-50">
              View All Global Activity
            </Button>
          </div>

          {/* EMERGENCY CARD */}
          <div className="bg-orange-600 p-6 rounded-2xl shadow-lg shadow-orange-100 text-white relative overflow-hidden">
            <ShieldAlert className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10" />
            <h3 className="font-bold text-lg mb-2">Emergency?</h3>
            <p className="text-orange-100 text-sm mb-4">Immediate danger or suspicious activity should be reported to local authorities first.</p>
            <Button size="sm" className="bg-white text-orange-600 hover:bg-orange-50 font-bold rounded-xl w-full">
              Quick Resources
            </Button>
          </div>

        </aside>
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

      <footer className="hidden md:block bg-white border-t border-gray-100 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <p className="text-gray-400 text-xs">© 2026 ResQHub. All rescues reserved.</p>
            <Button 
              onClick={() => navigate('/hub/report')}
              className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-8 transition-all font-bold"
            >
              Report an Item
            </Button>
        </div>
      </footer>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const NewsFeedCard: React.FC<{ item: NewsFeedItem }> = ({ item }) => {
  const navigate = useNavigate();
  
  const getStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case 'lost': return { label: 'Lost', color: 'bg-orange-50 text-orange-600 border-orange-100' };
      case 'found': return { label: 'Found', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
      case 'reunited': return { label: 'Reunited', color: 'bg-teal-50 text-teal-600 border-teal-100' };
      default: return { label: status, color: 'bg-gray-50 text-gray-600 border-gray-100' };
    }
  };

  const status = getStatusDisplay(item.status);

  return (
    <Card 
      onClick={() => navigate(`/hub/${item.id}`)}
      className="group bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      <div className="flex flex-col md:flex-row">
        {/* Image Container */}
        <div className="relative w-full md:w-64 h-48 md:h-auto overflow-hidden bg-gray-100">
          {item.images?.[0] ? (
            <img 
              loading="lazy"
              src={item.images[0]} 
              alt={item.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 p-4 text-center">
              <Plus className="w-8 h-8 mb-2 opacity-20" />
              <span className="text-xs uppercase tracking-widest font-bold">No Image Available</span>
            </div>
          )}
          <Badge className={cn("absolute top-3 left-3 border shadow-sm px-3 py-1 font-bold", status.color)}>
            {status.label}
          </Badge>
          {item.reward?.amount > 0 && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-teal-600 px-2 py-1 rounded-lg text-xs font-black shadow-sm flex items-center gap-1 border border-teal-50">
              <Award className="w-3 h-3" />
              ${item.reward.amount} Reward
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col">
          <div className="flex justify-between items-start gap-4 mb-2">
            <div>
              <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-teal-600 transition-colors uppercase tracking-tight">
                {item.title}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-gray-500 text-sm">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-500" />
                  {item.location}
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-orange-400" />
                  {item.timeAgo}
                </span>
              </div>
            </div>
          </div>

          <p className="text-gray-600 line-clamp-2 text-sm mt-3 leading-relaxed mb-6">
            {item.description}
          </p>

          <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Avatar 
                  src={item.user.profilePicture} 
                  alt={item.user.fullName}
                  className="w-8 h-8 border-2 border-white shadow-sm"
                />
                {item.user.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-teal-500 rounded-full border border-white p-0.5">
                    <CheckCircle className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 leading-none">{item.user.fullName}</p>
                <p className="text-[10px] text-gray-500">@{item.user.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 md:gap-3">
               <button className="p-2 text-gray-400 hover:text-emerald-500 transition-colors rounded-full hover:bg-emerald-50">
                 <MessageSquare className="w-4 h-4" />
               </button>
               <button className="p-2 text-gray-400 hover:text-teal-500 transition-colors rounded-full hover:bg-teal-50">
                 <Share2 className="w-4 h-4" />
               </button>
               <button className="p-2 text-gray-400 hover:text-orange-500 transition-colors rounded-full hover:bg-orange-50">
                 <Bookmark className="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const NewsFeedSkeleton: React.FC = () => (
  <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm animate-pulse">
    <div className="flex flex-col md:row">
      <div className="w-full md:w-64 h-48 md:h-auto bg-gray-100" />
      <div className="flex-1 p-6 space-y-4">
        <div className="space-y-2">
          <div className="h-6 w-3/4 bg-gray-100 rounded-lg" />
          <div className="h-4 w-1/2 bg-gray-50 rounded-lg" />
        </div>
        <div className="h-20 w-full bg-gray-50 rounded-lg" />
        <div className="flex justify-between items-center pt-4 border-t border-gray-50">
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-100" />
            <div className="space-y-1">
              <div className="h-3 w-20 bg-gray-100 rounded" />
              <div className="h-2 w-16 bg-gray-50 rounded" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded bg-gray-50" />
            <div className="w-6 h-6 rounded bg-gray-50" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default NewsFeedPage;
