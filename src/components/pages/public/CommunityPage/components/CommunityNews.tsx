import React, { useState, useEffect } from 'react';
import { Card, Button, Avatar, ShadcnBadge as Badge } from '@/components/ui';
import { 
  Newspaper, 
  Clock, 
  User,
  MapPin,
  Plus,
  Share2,
  Heart,
  MessageCircle,
  Loader,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { CommunityService } from '@/services/communityService';
import { getCategoryStyles, formatDateRange } from '@/utils/formatter';
import { ReportDetailModal } from '@/components/modals';
import type { CommunityPost } from '@/types/community';

interface CommunityNewsProps {
  isAdmin?: boolean;
  onOpenNewsModal?: () => void;
  communityId?: string | number;
}

export const CommunityNews: React.FC<CommunityNewsProps> = ({ 
  isAdmin, 
  onOpenNewsModal,
  communityId
}) => {
  const { t } = useTranslation();
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<CommunityPost | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleViewDetails = (report: any) => {
    setSelectedReport(report as CommunityPost);
    setIsDetailModalOpen(true);
  };

  useEffect(() => {
    const fetchNews = async () => {
      if (!communityId) {
        setNews([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await CommunityService.getCommunityReports({
          communityId,
          type: 'news',
          page: 1,
          pageSize: 100,
        });
        
        // Filter news items based on privacy settings
        const filteredNews = (data as any[]).filter(item => {
          if (item.privacy === 'internal') {
            return isAdmin;
          }
          return true;
        });

        setNews(filteredNews);
      } catch (err) {
        setError('Failed to load news');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [communityId]);

  const featuredNews = news.slice(0, 2); // Use first 2 items as featured
  const otherNews = news.slice(2);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="bg-white p-4 md:p-6 lg:p-8 rounded-[3rem] shadow-sm border border-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 lg:gap-8">
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 md:w-12 h-10 md:h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-teal-200">
                <Newspaper size={20} className="md:w-6 md:h-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase italic">
                Community <span className="text-teal-600">News</span>
              </h2>
            </div>
            <p className="text-xs md:text-sm text-slate-500 font-medium max-w-lg">
              Stay informed with the latest news, updates, and stories from your community.
            </p>
          </div>

          {isAdmin && (
            <Button 
              onClick={onOpenNewsModal}
              className="h-14 px-8 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl shadow-xl shadow-teal-100 flex items-center gap-2"
            >
              <Plus size={20} className="stroke-[3px]" />
              NEW ARTICLE
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-slate-50">
          <Loader className="w-12 h-12 text-teal-600 mb-4" />
          <p className="text-slate-600 font-semibold">Loading news...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-slate-50">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-slate-600 font-semibold">{error}</p>
        </div>
      ) : news.length === 0 ? (
        <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-50 flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-200">
            <Newspaper size={40} />
          </div>
          <h3 className="text-xl font-black text-slate-300 uppercase tracking-tight">
            No news available
          </h3>
          <p className="text-slate-400 font-medium mt-2">
            Check back soon for community news updates.
          </p>
        </div>
      ) : (
        <>
          {/* Featured News Section */}
          {featuredNews.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-4">
                <div className="w-1 h-6 bg-teal-600 rounded-full" />
                <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">
                  Featured <span className="text-teal-600">Stories</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {featuredNews.map((newsItem) => {
                  const categoryStyle = getCategoryStyles(newsItem.category || 'News');
                  const dateRange = formatDateRange(newsItem.startDate, newsItem.endDate);
                  return (
                    <Card 
                      key={newsItem.id} 
                      onClick={() => handleViewDetails(newsItem)}
                      className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl cursor-pointer"
                    >
                      {/* Content Section */}
                      <div className="p-6 space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className={cn(categoryStyle.bg, categoryStyle.text, 'border', categoryStyle.border, 'font-bold text-[10px] uppercase')}>
                              {newsItem.category || 'News'}
                            </Badge>
                            {newsItem.privacy === 'internal' && (
                              <Badge className="bg-rose-500/10 text-rose-500 border-none px-2 py-0.5 rounded-lg flex items-center gap-1 font-black text-[9px] uppercase tracking-wider">
                                <Eye size={10} strokeWidth={3} />
                                Internal
                              </Badge>
                            )}
                            {dateRange.isActive && (
                              <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold text-[10px] uppercase animate-pulse">
                                Active Now
                              </Badge>
                            )}
                            {dateRange.isUpcoming && (
                              <Badge className="bg-blue-50 text-blue-600 border border-blue-100 font-bold text-[10px] uppercase">
                                Coming Soon
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-xl font-black text-slate-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
                            {newsItem.title}
                          </h3>
                          <p className="text-slate-600 text-sm font-medium line-clamp-3">
                            {newsItem.description}
                          </p>
                        </div>

                        {/* Date Range */}
                        <div className="flex items-center gap-2 text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                          <Clock size={14} className="text-teal-600" />
                          <span className="text-xs font-semibold">{dateRange.display}</span>
                        </div>

                        {/* Author & Meta */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="w-8 h-8 shrink-0 rounded-lg bg-teal-50 text-teal-600 text-[10px] font-black">
                              {newsItem.createdBy?.charAt(0) || 'S'}
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-700 truncate">{newsItem.createdBy || 'System'}</p>
                              <p className="text-[10px] text-slate-500">
                                {newsItem.dateCreated ? new Date(newsItem.dateCreated).toLocaleDateString() : 'Date unknown'}
                              </p>
                            </div>
                          </div>
                          {newsItem.location && (
                            <div className="flex items-center gap-1 text-slate-400">
                              <MapPin size={12} />
                              <span className="text-[10px] font-bold">{newsItem.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Other News Section */}
          {otherNews.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-4">
                <div className="w-1 h-6 bg-teal-600 rounded-full" />
                <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">
                  Latest <span className="text-teal-600">Updates</span>
                </h3>
              </div>

              <div className="space-y-4">
                {otherNews.map((newsItem) => {
                  const categoryStyle = getCategoryStyles(newsItem.category || 'News');
                  const dateRange = formatDateRange(newsItem.startDate, newsItem.endDate);
                  return (
                    <Card 
                      key={newsItem.id} 
                      onClick={() => handleViewDetails(newsItem)}
                      className="p-6 group border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl cursor-pointer"
                    >
                      <div className="flex gap-4 flex-col sm:flex-row">
                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-3">
                          <div>
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge className={cn(categoryStyle.bg, categoryStyle.text, 'border', categoryStyle.border, 'font-bold text-[10px] uppercase')}>
                                {newsItem.category || 'News'}
                              </Badge>
                              {newsItem.privacy === 'internal' && (
                                <Badge className="bg-rose-500/10 text-rose-500 border-none px-2 py-0.5 rounded-lg flex items-center gap-1 font-black text-[9px] uppercase tracking-wider">
                                  <Eye size={10} strokeWidth={3} />
                                  Internal
                                </Badge>
                              )}
                              {dateRange.isActive && (
                                <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold text-[10px] uppercase animate-pulse">
                                  Active
                                </Badge>
                              )}
                              {dateRange.isUpcoming && (
                                <Badge className="bg-blue-50 text-blue-600 border border-blue-100 font-bold text-[10px] uppercase">
                                  Upcoming
                                </Badge>
                              )}
                            </div>
                            <h4 className="text-base font-black text-slate-900 line-clamp-2 group-hover:text-teal-600 transition-colors">
                              {newsItem.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-4 text-slate-500 flex-wrap">
                            <div className="flex items-center gap-1">
                              <Clock size={12} className="text-teal-600" />
                              <span className="text-xs font-bold">{dateRange.display}</span>
                            </div>
                            {newsItem.location && (
                              <div className="flex items-center gap-1">
                                <MapPin size={12} className="text-slate-400" />
                                <span className="text-xs font-bold">{newsItem.location}</span>
                              </div>
                            )}
                          </div>

                          {newsItem.description && (
                            <p className="text-sm text-slate-600 font-medium line-clamp-2">
                              {newsItem.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      <ReportDetailModal 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)} 
        report={selectedReport} 
      />
    </div>
  );
};
