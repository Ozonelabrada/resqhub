import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Avatar, ShadcnBadge as Badge } from '@/components/ui';
import { 
  Megaphone, 
  Clock, 
  AlertTriangle, 
  Info, 
  CheckCircle2,
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Loader,
  ArrowUpRight,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { YEARLY_ROADMAP, getRoadmapDatesForMonth, getRoadmapDateRange, AnnualEvent } from '@/constants/roadmapData';
import { CommunityService } from '@/services/communityService';
import type { CommunityPost } from '@/types/community';
import { ReportDetailModal } from '@/components/modals';

// Announcements from API have these fields
// (extends beyond CommunityPost type definition)

// Deprecated: Use backend data instead of sample announcements
// export interface Announcement { ... }

export const CommunityAnnouncements: React.FC<{ 
  isAdmin?: boolean;
  isAnnouncementModalOpen?: boolean;
  onOpenAnnouncementModal?: () => void;
  onOpenCalendarModal?: () => void;
  communityId?: string | number;
}> = ({ 
  isAdmin, 
  isAnnouncementModalOpen,
  onOpenAnnouncementModal,
  onOpenCalendarModal,
  communityId
}) => {
  // Get current date in YYYY-MM-DD format
  const today = new Date();
  const currentDateString = today.toISOString().split('T')[0];
  
  const [selectedDate, setSelectedDate] = useState(currentDateString);
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [showRoadmapDetails, setShowRoadmapDetails] = useState(false);
  const [selectedRoadmapMilestone, setSelectedRoadmapMilestone] = useState<AnnualEvent | null>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [calendarData, setCalendarData] = useState<AnnualEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CommunityPost | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleViewDetails = (report: any) => {
    setSelectedReport(report as CommunityPost);
    setIsDetailModalOpen(true);
  };

  const { dates: roadmapDates, events: monthRoadmapEvents } = useMemo(
    () => getRoadmapDatesForMonth(currentMonth.getMonth(), currentMonth.getFullYear(), calendarData),
    [currentMonth, calendarData]
  );

  // Fetch calendar data from backend
  useEffect(() => {
    const fetchCalendarData = async () => {
      if (!communityId) {
        setCalendarData([]);
        return;
      }
      
      setCalendarLoading(true);
      try {
        const data = await CommunityService.getCalendarEvents({
          communityId,
          page: 1,
          pageSize: 100,
        });
        setCalendarData(data);
      } catch (err) {
        console.error('Failed to fetch calendar data:', err);
        setCalendarData([]);
      } finally {
        setCalendarLoading(false);
      }
    };

    fetchCalendarData();
  }, [communityId]);

  // Fetch announcements from backend
  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (!communityId) {
        setAnnouncements([]);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        const data = await CommunityService.getCommunityReports({
          communityId,
          type: 'announcement',
          page: 1,
          pageSize: 100,
        });
        
        // Filter announcements based on privacy settings
        const filteredData = (data as any[]).filter(item => {
          if (item.privacy === 'internal') {
            return isAdmin;
          }
          return true;
        });

        setAnnouncements(filteredData);
      } catch (err) {
        console.error('Failed to fetch announcements:', err);
        setError('Failed to load announcements');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [communityId]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const getDayData = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = (currentMonth.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;
    
    // Count announcements that are active on this date (fall within startDate and endDate)
    const count = announcements.filter(a => {
      const startDate = new Date(a.startDate).toISOString().split('T')[0];
      const endDate = new Date(a.endDate).toISOString().split('T')[0];
      return dateStr >= startDate && dateStr <= endDate;
    }).length;
    
    return { dateStr, count };
  };

  const filteredAnnouncements = announcements.filter(a => {
    // Check if selectedDate falls within the announcement's date range
    const startDate = new Date(a.startDate).toISOString().split('T')[0];
    const endDate = new Date(a.endDate).toISOString().split('T')[0];
    return selectedDate >= startDate && selectedDate <= endDate;
  });

  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();
  const days = getDaysInMonth(currentMonth);
  const skip = getFirstDayOfMonth(currentMonth);

  const getTypeStyles = (type: string) => {
    const lowerType = type?.toLowerCase() || '';
    if (lowerType.includes('announcement')) return 'bg-slate-50 text-slate-600 border-slate-100';
    if (lowerType.includes('urgent') || lowerType.includes('alert')) return 'bg-orange-50 text-orange-600 border-orange-100';
    if (lowerType.includes('update')) return 'bg-blue-50 text-blue-600 border-blue-100';
    if (lowerType.includes('success') || lowerType.includes('news')) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (lowerType.includes('info')) return 'bg-slate-50 text-slate-600 border-slate-100';
    return 'bg-slate-50 text-slate-600 border-slate-100';
  };

  const getTypeIcon = (type: string) => {
    const lowerType = type?.toLowerCase() || '';
    if (lowerType.includes('alert') || lowerType.includes('urgent')) return <AlertTriangle size={16} />;
    if (lowerType.includes('update')) return <Clock size={16} />;
    if (lowerType.includes('success') || lowerType.includes('news')) return <CheckCircle2 size={16} />;
    if (lowerType.includes('info')) return <Info size={16} />;
    return <Info size={16} />;
  };

  // Debug output
  console.log('===== CommunityAnnouncements Debug =====');
  console.log('Community ID:', communityId);
  console.log('Loading:', loading);
  console.log('Error:', error);
  console.log('Announcements:', announcements);
  console.log('Announcements length:', announcements?.length);
  console.log('Selected Date:', selectedDate);
  console.log('Filtered Announcements:', filteredAnnouncements);
  console.log('=========================================');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-teal-200">
                <Megaphone size={24} />
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic">
                Community <span className="text-teal-600">Calendar</span>
              </h2>
            </div>
            <p className="text-slate-500 font-medium max-w-lg">
              Official announcements and updates organized by date. Select a day to view its specific news.
            </p>
          </div>

          {isAdmin && (
            <div className="flex gap-3">
              <Button 
                onClick={onOpenCalendarModal}
                className="h-14 px-8 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl shadow-xl shadow-teal-100 flex items-center gap-2"
              >
                <Plus size={20} className="stroke-[3px]" />
                CALENDAR
              </Button>
              <Button 
                onClick={onOpenAnnouncementModal}
                className="h-14 px-8 bg-slate-600 hover:bg-slate-700 text-white font-black rounded-2xl shadow-xl shadow-slate-100 flex items-center gap-2"
              >
                <Plus size={20} className="stroke-[3px]" />
                NEW ANNOUNCEMENT
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Community Calendar Year (Annual Roadmap) */}
      {calendarLoading ? (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 flex items-center justify-center gap-3">
          <Loader className="w-6 h-6 text-teal-600 animate-spin" />
          <p className="text-slate-600 font-semibold">Loading roadmap...</p>
        </div>
      ) : calendarData.length > 0 ? (
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">
            {year} Community <span className="text-teal-600">Roadmap</span>
          </h3>
          <Badge className="bg-teal-50 text-teal-600 border-none font-bold text-[10px] px-3">{calendarData.length} EVENTS</Badge>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide">
          {calendarData.map((item, idx) => {
            const itemDate = new Date(item.fromDate || item.dateRange || '');
            const itemMonth = itemDate.toLocaleString('default', { month: 'long' });
            const itemTitle = item.title || 'Untitled Event';
            const itemCategory = item.category || item.type || 'Event';
            const dateRange = item.dateRange || (item.fromDate && item.toDate 
              ? `${new Date(item.fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(item.toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              : 'TBD');
            
            return (
            <Card 
              key={idx} 
              onClick={() => {
                if (selectedRoadmapMilestone?.title === itemTitle) {
                  // Deselect: clear milestone and reset calendar
                  setSelectedRoadmapMilestone(null);
                  setSelectedDate(currentDateString);
                  setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                } else {
                  // Select: set milestone and navigate calendar to that month
                  setSelectedRoadmapMilestone(item as AnnualEvent);
                  const milestoneDate = new Date(item.fromDate || item.dateRange || new Date());
                  setCurrentMonth(new Date(milestoneDate.getFullYear(), milestoneDate.getMonth(), 1));
                  // Set to first date in the milestone range
                  const { dates: milestoneDates } = getRoadmapDateRange(item as AnnualEvent, milestoneDate.getFullYear());
                  setSelectedDate(milestoneDates.length > 0 ? milestoneDates[0] : milestoneDate.toISOString().split('T')[0]);
                }
              }}
              className={cn(
                "min-w-[240px] p-6 border-none rounded-3xl transition-all duration-500 group cursor-pointer",
                selectedRoadmapMilestone?.title === itemTitle
                  ? "shadow-xl bg-gradient-to-br from-teal-50 to-blue-50 border-2 border-teal-500"
                  : "shadow-sm bg-white hover:shadow-xl border-2 border-transparent"
              )}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em]">{itemMonth}</span>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    itemCategory === 'security' || itemCategory === 'Security' ? "bg-red-400" : 
                    itemCategory === 'celebration' || itemCategory === 'Celebration' ? "bg-orange-400" : 
                    itemCategory === 'mission' || itemCategory === 'Mission' ? "bg-teal-500" : "bg-slate-300"
                  )} />
                </div>
                <div>
                  <h4 className={cn(
                    "font-black leading-tight transition-colors",
                    selectedRoadmapMilestone?.title === itemTitle ? "text-teal-700" : "text-slate-800 group-hover:text-teal-600"
                  )}>
                    {itemTitle}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{dateRange}</p>
                </div>
                <div className="pt-2">
                  <Badge variant="outline" className={cn(
                    "text-[8px] uppercase font-black tracking-wider border-none",
                    itemCategory === 'security' || itemCategory === 'Security' ? "bg-red-50 text-red-600" :
                    itemCategory === 'celebration' || itemCategory === 'Celebration' ? "bg-orange-50 text-orange-600" :
                    itemCategory === 'mission' || itemCategory === 'Mission' ? "bg-teal-50 text-teal-600" : "bg-slate-50 text-slate-600"
                  )}>{itemCategory}</Badge>
                </div>
              </div>
            </Card>
            );
          })}
        </div>
      </div>
      ) : null}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Calendar Sidebar */}
        <Card className="xl:col-span-4 p-6 border-none shadow-sm rounded-[2.5rem] bg-white h-fit sticky top-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-slate-900 uppercase tracking-tight">{monthName} {year}</h3>
            <div className="flex gap-2">
              <Button onClick={prevMonth} variant="ghost" size="icon" className="w-8 h-8 rounded-lg"><ChevronLeft size={16} /></Button>
              <Button onClick={nextMonth} variant="ghost" size="icon" className="w-8 h-8 rounded-lg"><ChevronRightIcon size={16} /></Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-y-4 text-center">
            {['S','M','T','W','T','F','S'].map((d, idx) => (
              <span key={`day-${idx}`} className="text-[10px] font-black text-slate-300">{d}</span>
            ))}
            
            {/* Empty spaces for days before the 1st of the month */}
            {Array.from({ length: skip }).map((_, i) => (
              <div key={`skip-${i}`} className="aspect-square" />
            ))}

            {Array.from({ length: days }, (_, i) => i + 1).map(day => {
              const { dateStr, count } = getDayData(day);
              const isSelected = selectedDate === dateStr;
              const isRoadmapDate = roadmapDates.includes(dateStr);
              
              // Check if this date is in the selected roadmap milestone range
              let isInMilestoneRange = false;
              if (selectedRoadmapMilestone) {
                const milestoneYear = new Date(selectedRoadmapMilestone.fromDate || selectedRoadmapMilestone.dateRange || new Date()).getFullYear();
                const { dates: milestoneDates } = getRoadmapDateRange(selectedRoadmapMilestone, milestoneYear);
                isInMilestoneRange = milestoneDates.includes(dateStr);
              }
              
              return (
                <button
                  key={day}
                  onClick={() => {
                    setSelectedDate(dateStr);
                    // Clicking a date clears the milestone filter to show date-specific announcements
                    setSelectedRoadmapMilestone(null);
                    if (isRoadmapDate) {
                      setShowRoadmapDetails(true);
                    } else {
                      setShowRoadmapDetails(false);
                    }
                  }}
                  className={cn(
                    "relative aspect-square flex flex-col items-center justify-center rounded-2xl transition-all group font-bold",
                    isSelected 
                      ? "bg-teal-600 text-white shadow-lg shadow-teal-100"
                      : isInMilestoneRange
                      ? "bg-gradient-to-br from-teal-400 to-teal-500 text-white border-2 border-teal-500"
                      : isRoadmapDate
                      ? "bg-gradient-to-br from-teal-50 to-blue-50 text-teal-600 border-2 border-teal-200"
                      : "hover:bg-slate-50 text-slate-600"
                  )}
                >
                  <span className="text-sm font-black">{day}</span>
                  {count > 0 && (
                    <span className={cn(
                      "absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black",
                      isSelected ? "bg-white text-teal-600" : "bg-teal-100 text-teal-600"
                    )}>
                      {count}
                    </span>
                  )}
                  {(isRoadmapDate || isInMilestoneRange) && (
                    <div className={cn(
                      "absolute bottom-1 w-1.5 h-1.5 rounded-full",
                      isSelected ? "bg-white" : isInMilestoneRange ? "bg-white" : "bg-teal-500"
                    )} />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-50 space-y-4">
            <div className="flex items-center gap-3 text-slate-400 font-bold text-xs px-2">
              <CalendarIcon size={14} className="text-teal-500" />
              Viewing: <span className="text-slate-900 ml-auto">{new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            {roadmapDates.includes(selectedDate) && (
              <div className="mt-4 pt-4 border-t border-teal-100 space-y-2">
                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Roadmap Milestone</p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {monthRoadmapEvents.map((event, idx) => (
                    <div key={idx} className="p-3 bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl border border-teal-200 cursor-pointer hover:shadow-md transition-all">
                      <p className="text-xs font-black text-teal-700">{event.title}</p>
                      <p className="text-[10px] text-teal-600 font-bold mt-1">{event.type}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Announcements List for Selected Day */}
        <div className="xl:col-span-8 space-y-4">
          {/* Filter Status Header */}
          {selectedRoadmapMilestone && (
            <div className="flex items-center justify-between bg-gradient-to-r from-teal-50 to-blue-50 p-4 rounded-2xl border border-teal-200">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  selectedRoadmapMilestone.type === 'Celebration' ? "bg-orange-400" : 
                  selectedRoadmapMilestone.type === 'Mission' ? "bg-teal-500" : 
                  selectedRoadmapMilestone.type === 'Security' ? "bg-red-400" : "bg-slate-300"
                )} />
                <div>
                  <p className="text-xs font-black text-teal-600 uppercase tracking-tight">Filtering by Roadmap Milestone</p>
                  <p className="text-sm font-black text-teal-800">{selectedRoadmapMilestone.title}</p>
                </div>
              </div>
              <Button 
                onClick={() => setSelectedRoadmapMilestone(null)}
                variant="ghost"
                className="text-teal-600 hover:text-teal-700 hover:bg-white text-xs font-bold uppercase"
              >
                Clear Filter
              </Button>
            </div>
          )}

          {/* Roadmap Milestone Alert if applicable */}
          {!selectedRoadmapMilestone && roadmapDates.includes(selectedDate) && monthRoadmapEvents.length > 0 && (
            <Card className="p-6 md:p-8 border-none shadow-sm rounded-[2.5rem] bg-gradient-to-r from-teal-50 to-blue-50 border-l-4 border-l-teal-600 relative overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
                  <CalendarIcon size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-black text-teal-800">{year} Roadmap Milestone</h4>
                  <p className="text-slate-600 font-medium mt-1">This date marks an important community event from the annual roadmap:</p>
                  <div className="mt-4 space-y-2">
                    {monthRoadmapEvents.map((event, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          event.type === 'Celebration' ? "bg-orange-400" : 
                          event.type === 'Mission' ? "bg-teal-500" : 
                          event.type === 'Security' ? "bg-red-400" : "bg-slate-300"
                        )} />
                        <span className="text-sm font-black text-teal-700">{event.title}</span>
                        <Badge variant="outline" className="text-[8px] border-teal-200 text-teal-600 uppercase font-black">{event.type}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
              <Loader className="w-10 h-10 animate-spin text-teal-600 mb-4" />
              <p className="text-slate-500 font-bold">Loading announcements...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="py-12 text-center bg-orange-50 rounded-[3rem] border-2 border-orange-200 flex flex-col items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-orange-600 mb-4" />
              <p className="text-orange-700 font-bold">{error}</p>
            </div>
          )}

          {/* Announcements */}
          {!loading && filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map((announcement) => (
              <Card 
                key={announcement.id} 
                onClick={() => handleViewDetails(announcement)}
                className={cn(
                  "p-6 md:p-8 border-none shadow-sm hover:shadow-md transition-all rounded-[2.5rem] bg-white relative overflow-hidden group cursor-pointer"
                )}
              >
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge className={cn(
                      "px-3 py-1 rounded-lg uppercase text-[10px] font-black tracking-tight flex items-center gap-1.5 border-2",
                      getTypeStyles(announcement.reportType)
                    )}>
                      {getTypeIcon(announcement.reportType)}
                      {announcement.reportType}
                    </Badge>
                    {announcement.privacy === 'internal' && (
                      <Badge className="bg-rose-500/10 text-rose-500 border-none px-2 py-0.5 rounded-lg flex items-center gap-1 font-black text-[9px] uppercase tracking-wider">
                        <Eye size={10} strokeWidth={3} />
                        Internal
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-teal-600 transition-colors">
                        {announcement.title}
                      </h3>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-xl hover:bg-teal-50 hover:text-teal-600 shrink-0"
                        onClick={() => handleViewDetails(announcement)}
                      >
                        <ArrowUpRight size={20} />
                      </Button>
                    </div>
                    <p className="text-slate-500 font-medium leading-relaxed line-clamp-2">
                      {announcement.description}
                    </p>
                  </div>

                  {/* Location and Contact Info */}
                  {(announcement.location || announcement.contactInfo) && (
                    <div className="space-y-2 pt-4 border-t border-slate-50">
                      {announcement.location && (
                        <p className="text-sm text-slate-600 font-medium">
                          <span className="font-black text-slate-700">Location:</span> {announcement.location}
                        </p>
                      )}
                      {announcement.contactInfo && (
                        <p className="text-sm text-slate-600 font-medium">
                          <span className="font-black text-slate-700">Contact:</span> {announcement.contactInfo}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border-2 border-slate-50 text-xs font-black bg-teal-50 text-teal-600">
                        {announcement.user?.username?.charAt(0).toUpperCase() || 'U'}
                      </Avatar>
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-black text-slate-800">{announcement.user?.fullName || announcement.user?.username}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Community Member</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                      <Clock size={14} />
                      {announcement.dateCreated ? new Date(announcement.dateCreated).toLocaleDateString() : 'Date unknown'}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : !loading ? (
            <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-200">
                <CalendarIcon size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-300 uppercase tracking-tight">
                No announcements for this date
              </h3>
              <p className="text-slate-400 font-medium mt-2">
                Select another date on the calendar to see available updates.
              </p>
            </div>
          ) : null}
        </div>
      </div>
      
      <ReportDetailModal 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)} 
        report={selectedReport} 
      />
    </div>
  );
};