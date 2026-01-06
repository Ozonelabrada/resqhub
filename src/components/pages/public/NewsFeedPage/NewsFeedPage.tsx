import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  PlusCircle,
  Filter, 
  ChevronDown, 
  MapPin,
  Calendar,
  MessageSquare,
  Share2,
  TrendingUp,
  Award,
  ShieldAlert,
  ChevronRight,
  CheckCircle,
  Bookmark,
  Home,
  ThumbsUp,
  MoreHorizontal,
  Send,
} from 'lucide-react';
import { useNewsFeed } from '../../../../hooks/useNewsFeed';
import { useStatistics } from '../../../../hooks/useStatistics';
import { useTrendingReports } from '../../../../hooks/useTrendingReports';
import { useAuth } from '../../../../context/AuthContext';
import { useTranslation } from 'react-i18next';
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
      <main className="flex-1 w-full px-4 md:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-10 gap-8">
        {/* --- LEFT SIDEBAR: PROFILE & NAVIGATION (20%) --- */}
        <aside className="hidden lg:flex lg:col-span-2 flex-col space-y-6 sticky top-24 h-[calc(100vh-120px)] overflow-y-auto pr-2 custom-scrollbar">
          {/* User Profile Summary */}
          {isAuthenticated ? (
            <Card className="p-6 border-none shadow-sm bg-white rounded-[2rem] overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-teal-500 to-emerald-500" />
              <div className="relative pt-8 flex flex-col items-center">
                <div className="relative">
                  <Avatar className="w-20 h-20 border-4 border-white shadow-lg" />
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                {/* <h3 className="mt-4 font-black text-xl text-slate-900">{user?.name || 'Explorer'}</h3> */}
                <p className="text-sm font-medium text-slate-500">Community Member</p>
                
                <div className="grid grid-cols-2 gap-4 w-full mt-6">
                  <div className="text-center p-3 rounded-2xl bg-teal-50">
                    <div className="text-lg font-black text-teal-700">12</div>
                    <div className="text-[10px] font-bold text-teal-600 uppercase">Reports</div>
                  </div>
                  <div className="text-center p-3 rounded-2xl bg-orange-50">
                    <div className="text-lg font-black text-orange-700">5</div>
                    <div className="text-[10px] font-bold text-orange-600 uppercase">Matches</div>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 border-none shadow-sm bg-teal-600 text-white rounded-[2rem] overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="font-black text-xl mb-2">New Here?</h3>
                <p className="text-teal-50 text-sm mb-6 opacity-90">Join SHERRA to start helping your community reunite lost items.</p>
                <Button 
                  onClick={() => openLoginModal()}
                  className="w-full py-6 bg-white text-teal-600 hover:bg-teal-50 font-black rounded-2xl shadow-xl transition-all"
                >
                  Create Account
                </Button>
              </div>
              <Logo className="absolute -right-8 -bottom-8 w-32 h-32 opacity-10" light />
            </Card>
          )}

          {/* Sidebar Navigation */}
          <nav className="space-y-2">
            <h4 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{t('common.navigation')}</h4>
            <Button variant="ghost" className="w-full justify-start py-4 rounded-2xl text-teal-600 bg-teal-50 font-bold">
              <Home className="w-5 h-5 mr-3" />
              {t('common.news_feed')}
            </Button>
            <Button onClick={() => navigate('/hub')} variant="ghost" className="w-full justify-start py-4 rounded-2xl text-slate-600 hover:bg-gray-100 hover:text-teal-600 font-bold group">
              <PlusCircle className="w-5 h-5 mr-3 text-slate-400 group-hover:text-teal-600" />
              {t('common.my_reports')}
            </Button>
            <Button variant="ghost" className="w-full justify-start py-4 rounded-2xl text-slate-600 hover:bg-gray-100 hover:text-teal-600 font-bold group">
              <Bookmark className="w-5 h-5 mr-3 text-slate-400 group-hover:text-teal-600" />
              {t('common.saved_items')}
            </Button>
            <Button variant="ghost" className="w-full justify-start py-4 rounded-2xl text-slate-600 hover:bg-gray-100 hover:text-teal-600 font-bold group">
              <ShieldAlert className="w-5 h-5 mr-3 text-slate-400 group-hover:text-teal-600" />
              {t('common.safety_center')}
            </Button>
          </nav>

          {/* Trending Categories */}
          <div className="pt-6">
            <h4 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Categories</h4>
            <div className="flex flex-wrap gap-2 px-2">
              {['Electronics', 'Pets', 'Wallets', 'Keys', 'Bags', 'Docs'].map(cat => (
                <Badge key={cat} variant="secondary" className="px-3 py-1.5 rounded-xl cursor-not-allowed hover:bg-slate-200 transition-colors">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        </aside>

        {/* --- CENTER: MAIN FEED (50%) --- */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* SEARCH BAR (TOP) */}
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-600 w-5 h-5" />
              <Input 
                placeholder={t('common.search')} 
                className="pl-12 h-14 bg-transparent border-none text-lg font-medium placeholder:text-gray-400 focus-visible:ring-0 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label={t('common.search')}
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
                      {t(`newsfeed.${type}`)}
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

        {/* --- RIGHT SIDEBAR: COMMUNITY STATS & TRENDING (30%) --- */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24 h-fit">
          
          {/* STATS CARD */}
          <Card className="p-8 border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full -mr-16 -mt-16 group-hover:bg-teal-100 transition-colors" />
            <h3 className="text-gray-900 font-black text-xl mb-6 flex items-center gap-3">
              <TrendingUp className="text-teal-600 w-6 h-6" />
              {t('newsfeed.community_impact')}
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{t('newsfeed.total_reports')}</span>
                <p className="text-3xl font-black text-slate-900">{statistics?.totalItems || 0}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{t('newsfeed.reunited')}</span>
                <p className="text-3xl font-black text-emerald-600">{statistics?.successfulMatches || 0}</p>
              </div>
            </div>
            
            <div className="mt-8 p-4 rounded-2xl bg-teal-50/50 flex items-center justify-between">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <Avatar key={i} className="w-8 h-8 border-2 border-white" />
                ))}
              </div>
              <span className="text-xs font-bold text-teal-700">+{statistics?.activeReports || 0} {t('newsfeed.active_now')}</span>
            </div>
          </Card>

          {/* ACTIVE REQUESTS / TRENDING */}
          <Card className="p-8 border-none shadow-sm bg-white rounded-[2.5rem]">
            <h3 className="text-gray-900 font-black text-xl mb-6 flex items-center gap-3">
              <Award className="text-orange-500 w-6 h-6" />
              {t('newsfeed.trending')}
            </h3>
            <div className="space-y-6">
              {trendingLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="w-14 h-14 rounded-2xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))
              ) : trendingReports.slice(0, 3).map((report: any) => (
                <div key={report.id} className="group flex items-start gap-4 cursor-pointer" onClick={() => navigate(`/item/${report.id}`)}>
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                    {report.images?.[0] ? (
                      <img src={report.images[0]} alt="" className="object-cover w-full h-full group-hover:scale-110 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Plus className="w-5 h-5" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-teal-600 transition-colors">{report.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-orange-500" />
                      <span className="truncate">{report.location}</span>
                    </div>
                  </div>
                  <div className="self-center p-2 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
            <Button 
                variant="ghost" 
                className="w-full mt-8 py-6 rounded-2xl border border-gray-100 text-teal-600 font-bold hover:bg-teal-50 transition-colors"
                onClick={() => navigate('/feed')}
            >
              Explore Global activity
            </Button>
          </Card>

          {/* SAFETY ADVISORY */}
          <div className="bg-gradient-to-br from-orange-500 to-rose-600 p-8 rounded-[2.5rem] shadow-xl shadow-orange-100 text-white relative overflow-hidden group">
            <ShieldAlert className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" />
            <h3 className="font-black text-xl mb-3 flex items-center gap-2">
              Stay Safe! 🔒
            </h3>
            <p className="text-orange-50 text-sm mb-6 leading-relaxed font-medium">
              Always meet in public places when returning items. Verify ownership before handing over valuables.
            </p>
            <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white border-white/40 backdrop-blur-sm font-black rounded-xl w-full border">
              Safety Guidelines
            </Button>
          </div>

          {/* FOOTER LINKS */}
          <div className="px-6 flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest uppercase">
            <a href="#" className="hover:text-teal-600">Privacy</a>
            <a href="#" className="hover:text-teal-600">Terms</a>
            <a href="#" className="hover:text-teal-600">Safety</a>
            <a href="#" className="hover:text-teal-600">Contact</a>
            <span>© 2026 SHERRA</span>
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
            <p className="text-gray-400 text-xs">© 2026 SHERRA. All rescues reserved.</p>
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
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  
  const getStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case 'lost': return { label: ('newsfeed.lost'), color: 'bg-orange-50 text-orange-600 border-orange-100' };
      case 'found': return { label: ('newsfeed.found'), color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
      case 'reunited': return { label: ('newsfeed.reunited'), color: 'bg-teal-50 text-teal-600 border-teal-100' };
      default: return { label: status, color: 'bg-gray-50 text-gray-600 border-gray-100' };
    }
  };

  const status = getStatusDisplay(item.status);

  const handleAction = (e: React.MouseEvent, callback: () => void) => {
    e.stopPropagation();
    callback();
  };

  return (
    <Card 
      className="group bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      <div 
        onClick={() => navigate(`/item/${item.id}`)}
        className="flex flex-col md:flex-row cursor-pointer"
      >
        {/* Image Container */}
        <div className="relative w-full md:w-80 h-64 md:h-auto overflow-hidden bg-gray-100">
          {item.images?.[0] ? (
            <img 
              loading="lazy"
              src={item.images[0]} 
              alt={item.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 p-4 text-center">
              <Plus className="w-10 h-10 mb-2 opacity-20" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-black">No Image</span>
            </div>
          )}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className={cn("border shadow-md px-4 py-1.5 font-black uppercase text-[10px] tracking-widest rounded-full", status.color)}>
                {status.label}
            </Badge>
          </div>
          {item.reward?.amount > 0 && (
            <div className="absolute top-4 right-4 bg-orange-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black shadow-lg flex items-center gap-1.5 border border-orange-500">
              <Award className="w-3.5 h-3.5" />
              ${item.reward.amount} {('common.reward')}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-8 flex flex-col">
          <div className="flex justify-between items-start gap-4 mb-3">
            <div className="flex-1">
              <h3 className="text-2xl font-black text-slate-900 leading-none group-hover:text-teal-600 transition-colors uppercase tracking-tight mb-2">
                {item.title}
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-slate-500 font-bold text-xs">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  {item.location}
                </span>
                <span className="text-slate-200">|</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-500" />
                  {item.timeAgo}
                </span>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-slate-400">
              <MoreHorizontal size={20} />
            </button>
          </div>

          <p className="text-slate-600 line-clamp-2 text-base mt-2 leading-relaxed mb-8">
            {item.description}
          </p>

          <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar 
                  src={item.user?.profilePicture} 
                  alt={item.user?.fullName}
                  className="w-10 h-10 border-2 border-white shadow-md ring-1 ring-slate-100"
                />
                {item.user?.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-teal-500 rounded-full border-2 border-white p-0.5">
                    <CheckCircle className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 leading-none">{item.user?.fullName || t('common.anonymous')}</p>
                <p className="text-[11px] font-bold text-slate-400">@{item.user?.username || 'user'}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 md:gap-2">
               <button 
                onClick={(e) => handleAction(e, () => setIsLiked(!isLiked))}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-xs transition-all",
                    isLiked ? "bg-orange-50 text-orange-600" : "text-slate-400 hover:bg-gray-50 hover:text-orange-500"
                )}
               >
                 <ThumbsUp className={cn("w-4 h-4", isLiked && "fill-current")} />
                 <span>24</span>
               </button>
               <button 
                onClick={(e) => handleAction(e, () => setIsCommentsOpen(!isCommentsOpen))}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-xs transition-all",
                    isCommentsOpen ? "bg-teal-50 text-teal-600" : "text-slate-400 hover:bg-gray-50 hover:text-teal-500"
                )}
               >
                 <MessageSquare className="w-4 h-4" />
                 <span>8</span>
               </button>
               <button 
                onClick={(e) => handleAction(e, () => {})}
                className="p-2 text-slate-400 hover:text-teal-500 transition-colors rounded-xl hover:bg-teal-50"
               >
                 <Share2 className="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Comments Section */}
      {isCommentsOpen && (
        <div className="border-t border-gray-50 bg-gray-50/30 p-8 animate-in slide-in-from-top-2 duration-300">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex gap-4">
              <Avatar className="w-10 h-10 border-2 border-white shadow-sm flex-shrink-0" />
              <div className="flex-1 relative">
                <Input 
                   placeholder="Add a helpful comment..." 
                   value={commentText}
                   onChange={(e) => setCommentText(e.target.value)}
                   className="pr-12 py-6 rounded-2xl border-gray-200 bg-white shadow-sm font-medium"
                />
                <Button 
                   size="icon" 
                   className="absolute right-2 top-1/2 -translate-y-1/2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 w-10 transition-transform active:scale-90"
                   disabled={!commentText.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Mock Threads */}
            <div className="space-y-6 pt-2">
               {[1, 2].map(i => (
                 <div key={i} className="flex gap-4 group">
                   <Avatar className="w-8 h-8 flex-shrink-0" />
                   <div className="flex-1 space-y-2">
                     <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-black text-slate-900 tracking-tight">Community Member {i}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">2h ago</span>
                       </div>
                       <p className="text-sm text-slate-600 leading-relaxed">
                         I think I saw something similar near the central park yesterday! {i === 1 ? "Hope you find it soon." : "Check the security office."}
                       </p>
                     </div>
                     <div className="flex items-center gap-4 px-2">
                       <button className="text-[10px] font-black text-slate-400 hover:text-teal-600 uppercase tracking-widest">Reply</button>
                       <button className="text-[10px] font-black text-slate-400 hover:text-orange-600 uppercase tracking-widest">Helpful (3)</button>
                     </div>
                     
                     {i === 1 && (
                       <div className="ml-8 pt-4 border-l-2 border-gray-100 pl-4 space-y-4">
                         <div className="flex gap-3">
                           <Avatar className="w-6 h-6 flex-shrink-0" />
                           <div className="flex-1">
                             <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                               <p className="text-xs text-slate-600">Thanks for the tip! I'll check there today.</p>
                             </div>
                           </div>
                         </div>
                       </div>
                     )}
                   </div>
                 </div>
               ))}
            </div>
            
            <Button variant="ghost" className="w-full py-4 text-xs font-bold text-slate-400 hover:text-teal-600 uppercase tracking-widest">
                Load more comments
            </Button>
          </div>
        </div>
      )}
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
