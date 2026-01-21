import React from 'react';
import { 
  TrendingUp, 
  Award, 
  MapPin, 
  ChevronRight, 
  Plus, 
  ShieldAlert, 
  ChevronDown,
  Megaphone,
  Calendar
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Avatar,
  Skeleton,
  Button,
  Badge,
  Spinner
} from '../../../../ui';
import { cn } from "@/lib/utils";
// Note: Sample data has been moved to backend. Components now fetch announcements and events dynamically.

// Static Data for Contributors
const TOP_CONTRIBUTORS = [
  { id: 1, name: 'Alex Rivera', avatar: 'AR', color: 'bg-teal-500' },
  { id: 2, name: 'Sarah Chen', avatar: 'SC', color: 'bg-blue-500' },
  { id: 3, name: 'Mike Johnson', avatar: 'MJ', color: 'bg-emerald-500' },
  { id: 4, name: 'Elena Cruz', avatar: 'EC', color: 'bg-orange-500' },
];

const STATIC_TRENDING = [
  {
    id: 't1',
    title: 'Missing Golden Retriever',
    location: 'Manolo Fortich',
    images: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&auto=format&fit=crop&q=60'],
  },
  {
    id: 't2',
    title: 'Volunteer Search Party',
    location: 'Poblacion Area',
    images: ['https://images.unsplash.com/photo-1559027615-cd44512e9123?w=400&auto=format&fit=crop&q=60'],
  },
  {
    id: 't3',
    title: 'Community Watch Alert',
    location: 'Zone 4 Highway',
    images: ['https://images.unsplash.com/photo-1541888946425-d81bb19480c5?w=400&auto=format&fit=crop&q=60'],
  }
];

interface CommunitySidebarProps {
  statistics?: any;
  trendingReports: any[];
  trendingLoading: boolean;
  navigate: (path: string) => void;
  joinedCommunities: any[];
  isSafetyExpanded: boolean;
  setIsSafetyExpanded: (expanded: boolean) => void;
  onOpenInviteModal: (communityName: string) => void;
  onOpenCreateCommunity: () => void;
  onJoinCommunity?: (id: string | number) => Promise<void>;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  className?: string;
  upcomingNews?: { today: any[]; tomorrow: any[] };
  upcomingAnnouncements?: { today: any[]; tomorrow: any[] };
  upcomingEvents?: { today: any[]; tomorrow: any[] };
  newsLoading?: boolean;
  announcementsLoading?: boolean;
  eventsLoading?: boolean;
}

const CommunitySidebar: React.FC<CommunitySidebarProps> = ({
  statistics,
  trendingReports,
  trendingLoading,
  navigate,
  joinedCommunities,
  isSafetyExpanded,
  setIsSafetyExpanded,
  className,
  upcomingNews = { today: [], tomorrow: [] },
  upcomingAnnouncements = { today: [], tomorrow: [] },
  upcomingEvents = { today: [], tomorrow: [] },
  newsLoading = false,
  announcementsLoading = false,
  eventsLoading = false
}) => {
  const { t } = useTranslation();

  // Set the "today" reference to match SAMPLE_DATA
  const today = '2026-01-12';
  const tomorrow = '2026-01-13';
  const todayDisplay = 'Jan 12, 2026';

  const joinedCommunityNames = joinedCommunities.map(c => c.name);

  // Backend data is now fetched directly by individual components
  // These sidebars will be updated with proper data flow in future iterations
  const allAnnouncements: any[] = [];
  
  let filteredAnnouncements = allAnnouncements.filter(ann => 
    ann.dateKey === today && 
    (!ann.communityName || joinedCommunityNames.includes(ann.communityName))
  );

  const isTodayNews = filteredAnnouncements.length > 0;

  if (!isTodayNews) {
    filteredAnnouncements = allAnnouncements
      .filter(ann => 
        ann.dateKey > today && 
        (!ann.communityName || joinedCommunityNames.includes(ann.communityName))
      )
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
      .slice(0, 3);
  }
    
  // Filter events for today and tomorrow belonging to user's communities
  const relevantEvents: any[] = [];

  // Grouping functions
  const groupedAnnouncements = filteredAnnouncements.reduce((acc, ann) => {
    const key = ann.communityName || 'General';
    if (!acc[key]) acc[key] = [];
    acc[key].push(ann);
    return acc;
  }, {} as Record<string, typeof filteredAnnouncements>);

  const groupedEvents = relevantEvents.reduce((acc, event) => {
    const key = event.communityName || 'General';
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {} as Record<string, typeof relevantEvents>);

  return (
    <aside className={cn("flex flex-col space-y-4 pt-6in group h-fit", className)}>
      {/* JOIN THE ACTION SECTION */}
      <div className="space-y-3">
        <div className="bg-white rounded-[2rem] py-5 px-8 shadow-sm border border-gray-50 flex items-center justify-between group/pill cursor-pointer hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center group-hover/pill:scale-110 transition-transform">
              <Calendar className="text-emerald-500 w-5 h-5" />
            </div>
            <h3 className="text-slate-900 font-black text-lg tracking-tight">{t('common.join_the_action')}</h3>
          </div>
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
            {(upcomingEvents?.today?.length || 0) + (upcomingEvents?.tomorrow?.length || 0)}
          </span>
        </div>

        {((upcomingEvents?.today?.length || 0) + (upcomingEvents?.tomorrow?.length || 0)) > 0 ? (
          <div className="px-4 space-y-4">
            {/* Today's Events */}
            {upcomingEvents?.today && upcomingEvents.today.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Today</h4>
                {Object.entries(
                  upcomingEvents.today.reduce((acc: Record<string, any[]>, event: any) => {
                    const community = event.communityName || 'General';
                    if (!acc[community]) acc[community] = [];
                    acc[community].push(event);
                    return acc;
                  }, {} as Record<string, any[]>)
                ).map(([community, communityEvents]: [string, any[]]) => (
                  <div key={community} className="space-y-2">
                    <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] px-2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {community}
                    </h5>
                    <div className="space-y-2">
                      {communityEvents.slice(0, 2).map(event => (
                        <div key={event.id} className="bg-white/50 hover:bg-white p-3 rounded-xl border border-transparent hover:border-emerald-100 transition-all cursor-pointer group/ev ml-2">
                          <Badge className="text-[8px] font-black uppercase tracking-tighter shadow-sm bg-emerald-500 text-white mb-2">
                            {t('common.today')}
                          </Badge>
                          <p className="text-xs font-bold text-slate-700 leading-tight group-hover/ev:text-emerald-600 transition-colors truncate">{event.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tomorrow's Events */}
            {upcomingEvents?.tomorrow && upcomingEvents.tomorrow.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Tomorrow</h4>
                {Object.entries(
                  upcomingEvents.tomorrow.reduce((acc: Record<string, any[]>, event: any) => {
                    const community = event.communityName || 'General';
                    if (!acc[community]) acc[community] = [];
                    acc[community].push(event);
                    return acc;
                  }, {} as Record<string, any[]>)
                ).map(([community, communityEvents]: [string, any[]]) => (
                  <div key={community} className="space-y-2">
                    <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] px-2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {community}
                    </h5>
                    <div className="space-y-2">
                      {communityEvents.slice(0, 2).map(event => (
                        <div key={event.id} className="bg-white/50 hover:bg-white p-3 rounded-xl border border-transparent hover:border-emerald-100 transition-all cursor-pointer group/ev ml-2">
                          <Badge className="text-[8px] font-black uppercase tracking-tighter shadow-sm bg-blue-500 text-white mb-2">
                            {t('common.tomorrow')}
                          </Badge>
                          <p className="text-xs font-bold text-slate-700 leading-tight group-hover/ev:text-emerald-600 transition-colors truncate">{event.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : eventsLoading ? (
          <div className="flex flex-col items-center justify-center py-6 px-6 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
              <Spinner size="sm" className="text-emerald-500" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('common.loading')}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 px-6 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
              <Calendar className="w-5 h-5 text-slate-300" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('common.no_events')}</p>
          </div>
        )}
      </div>

      {/* Latest News Section */}
      <div className="space-y-3">
        <div className="bg-white rounded-[2rem] py-5 px-8 shadow-sm border border-gray-50 flex items-center justify-between group/pill cursor-pointer hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center group-hover/pill:scale-110 transition-transform">
              <TrendingUp className="text-purple-500 w-5 h-5" />
            </div>
            <h3 className="text-slate-900 font-black text-lg tracking-tight">{t('common.latest_news') || 'Latest News'}</h3>
          </div>
          <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
            {(upcomingNews?.today?.length || 0) + (upcomingNews?.tomorrow?.length || 0)}
          </span>
        </div>

        {((upcomingNews?.today?.length || 0) + (upcomingNews?.tomorrow?.length || 0)) > 0 ? (
          <div className="px-4 space-y-4">
            {/* Today's News */}
            {upcomingNews?.today && upcomingNews.today.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Today</h4>
                {Object.entries(
                  upcomingNews.today.reduce((acc: Record<string, any[]>, news: any) => {
                    const community = news.communityName || 'General';
                    if (!acc[community]) acc[community] = [];
                    acc[community].push(news);
                    return acc;
                  }, {} as Record<string, any[]>)
                ).map(([community, communityNews]: [string, any[]]) => (
                  <div key={community} className="space-y-2">
                    <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] px-2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      {community}
                    </h5>
                    <div className="space-y-2">
                      {communityNews.slice(0, 2).map(news => (
                        <div key={news.id} className="bg-white/50 hover:bg-white p-3 rounded-xl border border-transparent hover:border-purple-100 transition-all cursor-pointer group/news ml-2" onClick={() => navigate(`/reports/${news.id}`)}>
                          <p className="text-xs font-bold text-slate-700 leading-tight group-hover/news:text-purple-600 transition-colors truncate">{news.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tomorrow's News */}
            {upcomingNews?.tomorrow && upcomingNews.tomorrow.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Tomorrow</h4>
                {Object.entries(
                  upcomingNews.tomorrow.reduce((acc: Record<string, any[]>, news: any) => {
                    const community = news.communityName || 'General';
                    if (!acc[community]) acc[community] = [];
                    acc[community].push(news);
                    return acc;
                  }, {} as Record<string, any[]>)
                ).map(([community, communityNews]: [string, any[]]) => (
                  <div key={community} className="space-y-2">
                    <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] px-2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      {community}
                    </h5>
                    <div className="space-y-2">
                      {communityNews.slice(0, 2).map(news => (
                        <div key={news.id} className="bg-white/50 hover:bg-white p-3 rounded-xl border border-transparent hover:border-purple-100 transition-all cursor-pointer group/news ml-2" onClick={() => navigate(`/reports/${news.id}`)}>
                          <p className="text-xs font-bold text-slate-700 leading-tight group-hover/news:text-purple-600 transition-colors truncate">{news.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : newsLoading ? (
          <div className="flex flex-col items-center justify-center py-6 px-6 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
              <Spinner size="sm" className="text-purple-500" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('common.loading')}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 px-6 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-slate-300" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('common.no_news') || 'No news'}</p>
          </div>
        )}
      </div>

      {/* Latest Announcements Section */}
      <div className="space-y-3">
        <div className="bg-white rounded-[2rem] py-5 px-8 shadow-sm border border-gray-50 flex items-center justify-between group/pill cursor-pointer hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center group-hover/pill:scale-110 transition-transform">
              <Megaphone className="text-yellow-500 w-5 h-5" />
            </div>
            <h3 className="text-slate-900 font-black text-lg tracking-tight">{t('common.latest_announcements') || 'Latest Announcements'}</h3>
          </div>
          <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">
            {(upcomingAnnouncements?.today?.length || 0) + (upcomingAnnouncements?.tomorrow?.length || 0)}
          </span>
        </div>

        {((upcomingAnnouncements?.today?.length || 0) + (upcomingAnnouncements?.tomorrow?.length || 0)) > 0 ? (
          <div className="px-4 space-y-4">
            {/* Today's Announcements */}
            {upcomingAnnouncements?.today && upcomingAnnouncements.today.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Today</h4>
                {Object.entries(
                  upcomingAnnouncements.today.reduce((acc: Record<string, any[]>, announcement: any) => {
                    const community = announcement.communityName || 'General';
                    if (!acc[community]) acc[community] = [];
                    acc[community].push(announcement);
                    return acc;
                  }, {} as Record<string, any[]>)
                ).map(([community, communityAnnouncements]: [string, any[]]) => (
                  <div key={community} className="space-y-2">
                    <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] px-2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                      {community}
                    </h5>
                    <div className="space-y-2">
                      {communityAnnouncements.slice(0, 2).map(announcement => (
                        <div key={announcement.id} className="bg-white/50 hover:bg-white p-3 rounded-xl border border-transparent hover:border-yellow-100 transition-all cursor-pointer group/ann ml-2">
                          <p className="text-xs font-bold text-slate-700 leading-tight group-hover/ann:text-yellow-600 transition-colors truncate">{announcement.title}</p>
                          <p className="text-[9px] text-slate-400 font-medium mt-0.5 uppercase tracking-tighter">{announcement.category}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tomorrow's Announcements */}
            {upcomingAnnouncements?.tomorrow && upcomingAnnouncements.tomorrow.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Tomorrow</h4>
                {Object.entries(
                  upcomingAnnouncements.tomorrow.reduce((acc: Record<string, any[]>, announcement: any) => {
                    const community = announcement.communityName || 'General';
                    if (!acc[community]) acc[community] = [];
                    acc[community].push(announcement);
                    return acc;
                  }, {} as Record<string, any[]>)
                ).map(([community, communityAnnouncements]: [string, any[]]) => (
                  <div key={community} className="space-y-2">
                    <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] px-2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                      {community}
                    </h5>
                    <div className="space-y-2">
                      {communityAnnouncements.slice(0, 2).map(announcement => (
                        <div key={announcement.id} className="bg-white/50 hover:bg-white p-3 rounded-xl border border-transparent hover:border-yellow-100 transition-all cursor-pointer group/ann ml-2">
                          <p className="text-xs font-bold text-slate-700 leading-tight group-hover/ann:text-yellow-600 transition-colors truncate">{announcement.title}</p>
                          <p className="text-[9px] text-slate-400 font-medium mt-0.5 uppercase tracking-tighter">{announcement.category}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : announcementsLoading ? (
          <div className="flex flex-col items-center justify-center py-6 px-6 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
              <Spinner size="sm" className="text-yellow-500" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('common.loading')}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 px-6 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
              <Megaphone className="w-5 h-5 text-slate-300" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('common.no_announcements') || 'No announcements'}</p>
          </div>
        )}
      </div>

      {/* LOCAL STATISTICS CARD */}
      <Card className="p-10 border-none shadow-sm bg-white rounded-[3rem] overflow-hidden relative">
        <div className="space-y-8">
          <div>
            <h3 className="text-slate-400 font-extrabold text-[11px] uppercase tracking-[0.2em] mb-8">
              {t('common.local_statistics')}
            </h3>
            
            <div className="space-y-6">
              {/* Location */}
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0">
                  <MapPin className="text-teal-600 w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">{t('common.location')}</p>
                  <p className="text-base font-black text-slate-900">Manolo Fortich Bukidnon</p>
                </div>
              </div>

              {/* Active Since */}
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Calendar className="text-blue-500 w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">{t('common.active_since')}</p>
                  <p className="text-base font-black text-slate-900">2024</p>
                </div>
              </div>

              {/* Resolved Cases */}
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <TrendingUp className="text-emerald-500 w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">{t('common.resolved_cases')}</p>
                  <p className="text-base font-black text-slate-900">
                    {t('common.items_count', { count: statistics?.successfulMatches || 188 })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-50">
            <h3 className="text-slate-400 font-extrabold text-[11px] uppercase tracking-[0.2em] mb-6">
              {t('common.top_contributors')}
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex -space-x-3">
                {TOP_CONTRIBUTORS.map((contributor) => (
                  <Avatar 
                    key={contributor.id} 
                    className={cn("w-10 h-10 border-4 border-white shadow-sm ring-1 ring-slate-100 font-black text-[10px] text-white", contributor.color)}
                  >
                    {contributor.avatar}
                  </Avatar>
                ))}
                <div className="w-10 h-10 rounded-full bg-slate-50 border-4 border-white flex items-center justify-center text-[10px] font-black text-slate-400 ring-1 ring-slate-100">
                  +12
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-teal-600 font-black text-[10px] uppercase tracking-widest hover:bg-teal-50">
                {t('common.view_all')}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* TRENDING SECTION - REDUCED FOOTPRINT */}
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
          ) : (trendingReports.length > 0 ? trendingReports : STATIC_TRENDING).slice(0, 3).map((report: any, idx: number) => (
            <div key={report.id || report._id || idx} className="group flex items-start gap-4 cursor-pointer" onClick={() => navigate(`/item/${report.id || report._id}`)}>
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
            onClick={() => navigate('/hub')}
        >
          {t('common.explore_global')}
        </Button>
      </Card>

      {/* SAFETY ADVISORY */}
      <div className={cn(
        "p-8 rounded-[2.5rem] shadow-xl transition-all duration-500 relative overflow-hidden group",
        isSafetyExpanded 
          ? "bg-white border-2 border-orange-200" 
          : "bg-gradient-to-br from-orange-500 to-rose-600 text-white shadow-orange-100"
      )}>
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsSafetyExpanded(!isSafetyExpanded)}>
          <h3 className={cn(
            "font-black text-xl flex items-center gap-2",
            isSafetyExpanded ? "text-orange-600" : "text-white"
          )}>
            <ShieldAlert className={cn("w-6 h-6", !isSafetyExpanded && "text-white")} />
            {t('safety.title') || "Stay Safe!"}
          </h3>
          <ChevronDown className={cn(
            "w-6 h-6 transition-transform",
            !isSafetyExpanded && "text-white/70",
            isSafetyExpanded ? "rotate-180 text-orange-500" : ""
          )} />
        </div>

        {!isSafetyExpanded ? (
           <p className="text-orange-50 text-sm mt-4 leading-relaxed font-medium opacity-90">
             {t('safety.subtitle')}
           </p>
        ) : (
          <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            {[
              { title: t('safety.tip1_title'), desc: t('safety.tip1_desc') },
              { title: t('safety.tip2_title'), desc: t('safety.tip2_desc') },
              { title: t('safety.tip3_title'), desc: t('safety.tip3_desc') },
              { title: t('safety.tip4_title'), desc: t('safety.tip4_desc') }
            ].map((tip, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-orange-50 border border-orange-100 group/tip">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-black shrink-0">
                  {i + 1}
                </div>
                <div>
                  <h5 className="font-black text-orange-700 text-xs uppercase tracking-widest mb-1">{tip.title}</h5>
                  <p className="text-sm text-orange-600/80 font-medium leading-tight">{tip.desc}</p>
                </div>
              </div>
            ))}
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl h-12 mt-2">
              {t('safety.full_guide') || "Read Full Safety Guide"}
            </Button>
          </div>
        )}
        {!isSafetyExpanded && <ShieldAlert className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" />}
      </div>

    </aside>
  );
};

export default CommunitySidebar;
