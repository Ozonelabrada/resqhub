import React, { useState, useEffect } from 'react';
import { Card, Button, Input, ShadcnBadge as Badge, Spinner } from '@/components/ui';
import { Search, Plus, List, Grid, MessageSquare, Heart, Edit3, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReportsService } from '@/services/reportsService';
import type { LostFoundItem } from '@/services/reportsService';
import { ReportDetailDrawer } from '@/components/features/reports/ReportDetail';
import { ImageCollageDisplay } from '@/components/features/reports/ImageCollageDisplay';

interface CommunityMyReportsProps {
  communityId: string | number;
  userId: string;
  isAdmin?: boolean;
}

export const CommunityMyReports: React.FC<CommunityMyReportsProps> = ({
  communityId,
  userId,
  isAdmin = false
}) => {
  const [reports, setReports] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'Lost' | 'Found'>('all');

  const fetchReports = async () => {
    setLoading(true);
    try {
      // API call to get user reports in this community
      // Using communityId and userId filter
      const data = await ReportsService.getReports({
        createdBy: userId,
        communityId: String(communityId)
      } as any);
      setReports(data);
    } catch (error) {
      console.error('Failed to fetch user reports in community', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [communityId, userId]);

  const filteredReports = reports.filter(r => {
    const matchesSearch = (r.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (r.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || r.reportType === filterType;
    return matchesSearch && matchesType;
  });

  const handleReportClick = (id: number) => {
    setSelectedReportId(id);
    setIsDetailDrawerOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem]">
        <Spinner size="lg" className="text-teal-600 mb-4" />
        <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Fetching your reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            My Reports
            <Badge className="bg-teal-50 text-teal-600 border-none px-3 py-1 rounded-lg font-black text-xs">
              {filteredReports.length}
            </Badge>
          </h2>
          <p className="text-slate-400 font-medium">Manage your items in this community</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white text-teal-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
            >
              <Grid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white text-teal-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
            >
              <List size={18} />
            </button>
          </div>
          <Button className="bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl px-6 h-12 shadow-lg shadow-teal-100 transition-all active:scale-95">
            <Plus className="mr-2 w-5 h-5" />
            Create Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-3 space-y-6">
          <Card className="p-6 border-none shadow-sm bg-white rounded-[2rem]">
            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Filter & Search</h3>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <Input 
                  placeholder="Search titles..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 h-12 bg-slate-50 border-none rounded-xl font-bold text-slate-700 placeholder:text-slate-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Report Type</label>
                <div className="grid grid-cols-1 gap-1">
                  {(['all', 'Lost', 'Found'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all",
                        filterType === type ? "bg-teal-50 text-teal-700" : "text-slate-500 hover:bg-slate-50"
                      )}
                    >
                      {type}
                      {filterType === type && <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-none shadow-sm bg-slate-900 text-white rounded-[2rem]">
            <h4 className="font-black text-lg mb-2">Need help?</h4>
            <p className="text-slate-400 text-xs mb-4 leading-relaxed">Boost your report to more members to find your item faster.</p>
            <Button className="w-full bg-white text-slate-900 hover:bg-teal-50 font-black rounded-xl h-11 text-xs">Boost Post</Button>
          </Card>
        </aside>

        {/* Content Area */}
        <div className="lg:col-span-9">
          {filteredReports.length > 0 ? (
            <div className={cn(
              viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-4"
            )}>
              {filteredReports.map(report => (
                <Card 
                  key={report.id} 
                  className={cn(
                    "group border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden bg-white",
                    viewMode === 'grid' ? "rounded-[2.5rem]" : "rounded-3xl flex items-center pr-6"
                  )}
                  onClick={() => handleReportClick(Number(report.id || 0))}  
                >
                  <div className={cn(
                    "relative overflow-hidden bg-slate-100",
                    viewMode === 'grid' ? "w-full aspect-[4/3]" : "w-40 aspect-square shrink-0"
                  )}>
                    <ImageCollageDisplay
                      images={report.images || []}
                      title={report.title || ''}
                      containerHeight={viewMode === 'grid' ? 'h-full' : 'h-full'}
                    />
                    {(!report.images || report.images.length === 0) && (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Heart size={40} className="opacity-20" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 z-10">
                      <Badge className={cn(
                        "px-3 py-1 rounded-lg font-black text-[10px] uppercase shadow-lg border-none",
                        report.reportType === 'Lost' ? "bg-orange-500 text-white" : "bg-emerald-500 text-white"
                      )}>
                        {report.reportType}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-6 flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(report.dateCreated || new Date().toISOString()).toLocaleDateString()}</span>
                       <div className="flex items-center gap-1.5">
                         {report.status === 1 ? (
                           <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase">Open</Badge>
                         ) : (
                          <Badge className="bg-slate-100 text-slate-400 border-none font-black text-[9px] uppercase">Resolved</Badge>
                         )}
                       </div>
                    </div>
                    <h4 className="text-xl font-black text-slate-900 mb-2 truncate group-hover:text-teal-600 transition-colors">{report.title}</h4>
                    <p className="text-slate-500 font-medium text-sm line-clamp-2 mb-6">{report.description}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-5">
                        <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-teal-500 transition-colors">
                          <MessageSquare size={14} />
                          <span className="text-xs font-bold">{report.commentsCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-emerald-500 transition-colors">
                          <Heart size={14} />
                          <span className="text-xs font-bold">{report.reactionsCount || 0}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-teal-50 hover:text-teal-600 transition-colors">
                          <Edit3 size={16} />
                        </Button>
                        {(isAdmin || report.userId === userId) && (
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors">
                             <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center p-20 bg-white rounded-[3rem] text-center">
               <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-8 animate-pulse text-teal-400">
                  <Heart size={48} />
               </div>
               <h3 className="text-2xl font-black text-slate-900 mb-2">No Reports Yet</h3>
               <p className="text-slate-500 font-medium max-w-sm mb-10 leading-relaxed">
                  You haven't posted any lost or found reports in this community. Helping others is just a click away!
               </p>
               <Button className="bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl px-12 h-14 shadow-xl shadow-teal-100 transition-all active:scale-95">
                  Report Item Now
               </Button>
            </Card>
          )}
        </div>
      </div>

      <ReportDetailDrawer 
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        reportId={selectedReportId || 0}
      />
    </div>
  );
};
