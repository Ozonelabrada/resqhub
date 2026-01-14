import React, { useState } from 'react';
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
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'Alert' | 'Update' | 'Info' | 'Success';
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  createdAt: string; // ISO date string preferred for real app
  dateKey: string; // YYYY-MM-DD for calendar mapping
  isPinned?: boolean;
  communityName?: string;
}

export interface AnnualEvent {
  month: string;
  title: string;
  type: 'Celebration' | 'Mission' | 'Maintenance' | 'Security';
  dateRange: string;
}

export const YEARLY_ROADMAP: AnnualEvent[] = [
  { month: 'January', title: 'New Year Cleanup Drive', type: 'Mission', dateRange: 'Jan 15-20' },
  { month: 'February', title: 'Neighborhood Watch Seminar', type: 'Security', dateRange: 'Feb 10' },
  { month: 'April', title: 'Summer Youth Sports League', type: 'Celebration', dateRange: 'Apr - May' },
  { month: 'June', title: 'Drainage Systems Audit', type: 'Maintenance', dateRange: 'Jun 05' },
  { month: 'October', title: 'Community Fiesta 2026', type: 'Celebration', dateRange: 'Oct 20-25' },
  { month: 'December', title: 'Annual General Assembly', type: 'Mission', dateRange: 'Dec 15' },
];

export const SAMPLE_ANNOUNCEMENTS: Announcement[] = [
  {
    id: '1',
    title: 'Water Service Interruption - Tomorrow',
    content: 'Please be advised that there will be a scheduled water service maintenance on Jan 14 from 8:00 AM to 5:00 PM affecting Blocks 5 to 12. Please store enough water ahead of time.',
    type: 'Alert',
    author: { name: 'Admin Team', role: 'Community Admin' },
    createdAt: '2 hours ago',
    dateKey: '2026-01-14',
    isPinned: true,
    communityName: 'Riverside Homeowners'
  },
  {
    id: '2',
    title: 'New Security Patrol Schedule',
    content: 'We are expanding our night patrol coverage to include the West Perimeter starting this Friday. Monthly dues will remain unchanged.',
    type: 'Update',
    author: { name: 'Chief Mike', role: 'Security Head' },
    createdAt: '1 day ago',
    dateKey: '2026-01-16',
    isPinned: true,
    communityName: 'Zone 4 Safety Watch'
  },
  {
    id: '3',
    title: 'Community Garden Harvest Festival',
    content: 'The first harvest from our community garden is ready! Join us this Saturday morning at the central park for fresh produce and neighborhood breakfast.',
    type: 'Success',
    author: { name: 'Maria Santos', role: 'Environment Lead' },
    createdAt: '3 days ago',
    dateKey: '2026-01-12',
    communityName: 'Green Valley Community'
  },
  {
    id: '4',
    title: 'Lost Property Procedure Updated',
    content: 'We have streamlined how lost and found items are logged through the ResQHub app. Please check the Resources tab for the new step-by-step guide.',
    type: 'Info',
    author: { name: 'Elena Gilbert', role: 'Moderator' },
    createdAt: '1 week ago',
    dateKey: '2026-01-12',
    communityName: 'Riverside Homeowners'
  }
];

export const CommunityAnnouncements: React.FC<{ isAdmin?: boolean }> = ({ isAdmin }) => {
  const [selectedDate, setSelectedDate] = useState('2026-01-12');
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1)); // January 2026

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
    const count = SAMPLE_ANNOUNCEMENTS.filter(a => a.dateKey === dateStr).length;
    return { dateStr, count };
  };

  const filteredAnnouncements = SAMPLE_ANNOUNCEMENTS.filter(a => a.dateKey === selectedDate);

  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();
  const days = getDaysInMonth(currentMonth);
  const skip = getFirstDayOfMonth(currentMonth);

  const getTypeStyles = (type: Announcement['type']) => {
    switch (type) {
      case 'Alert': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Update': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Success': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Info': return 'bg-slate-50 text-slate-600 border-slate-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getTypeIcon = (type: Announcement['type']) => {
    switch (type) {
      case 'Alert': return <AlertTriangle size={16} />;
      case 'Update': return <Clock size={16} />;
      case 'Success': return <CheckCircle2 size={16} />;
      case 'Info': return <Info size={16} />;
    }
  };

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
            <Button className="h-14 px-8 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl shadow-xl shadow-teal-100 flex items-center gap-2">
              <Plus size={20} className="stroke-[3px]" />
              NEW ANNOUNCEMENT
            </Button>
          )}
        </div>
      </div>
      {/* Community Calendar Year (Annual Roadmap) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">
            2026 Community <span className="text-teal-600">Roadmap</span>
          </h3>
          <Badge className="bg-teal-50 text-teal-600 border-none font-bold text-[10px] px-3">ANNUAL OUTLOOK</Badge>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide">
          {YEARLY_ROADMAP.map((item, idx) => (
            <Card key={idx} className="min-w-[240px] p-6 border-none shadow-sm bg-white rounded-3xl hover:shadow-xl transition-all duration-500 group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em]">{item.month}</span>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    item.type === 'Celebration' ? "bg-orange-400" : 
                    item.type === 'Mission' ? "bg-teal-500" : 
                    item.type === 'Security' ? "bg-red-400" : "bg-slate-300"
                  )} />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 leading-tight group-hover:text-teal-600 transition-colors">{item.title}</h4>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{item.dateRange}</p>
                </div>
                <div className="pt-2">
                  <Badge variant="outline" className="text-[8px] border-slate-100 text-slate-400 uppercase font-black">{item.type}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
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
            {['S','M','T','W','T','F','S'].map(d => (
              <span key={d} className="text-[10px] font-black text-slate-300">{d}</span>
            ))}
            
            {/* Empty spaces for days before the 1st of the month */}
            {Array.from({ length: skip }).map((_, i) => (
              <div key={`skip-${i}`} className="aspect-square" />
            ))}

            {Array.from({ length: days }, (_, i) => i + 1).map(day => {
              const { dateStr, count } = getDayData(day);
              const isSelected = selectedDate === dateStr;
              
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={cn(
                    "relative aspect-square flex flex-col items-center justify-center rounded-2xl transition-all group",
                    isSelected 
                      ? "bg-teal-600 text-white shadow-lg shadow-teal-100" 
                      : "hover:bg-slate-50 text-slate-600 font-bold"
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
                </button>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-50 space-y-4">
            <div className="flex items-center gap-3 text-slate-400 font-bold text-xs px-2">
              <CalendarIcon size={14} className="text-teal-500" />
              Viewing: <span className="text-slate-900 ml-auto">{new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </Card>

        {/* Announcements List for Selected Day */}
        <div className="xl:col-span-8 space-y-4">
          {filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map((announcement) => (
              <Card 
                key={announcement.id} 
                className={cn(
                  "p-6 md:p-8 border-none shadow-sm hover:shadow-md transition-all rounded-[2.5rem] bg-white relative overflow-hidden group",
                  announcement.isPinned && "border-l-4 border-l-teal-500"
                )}
              >
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge className={cn(
                      "px-3 py-1 rounded-lg uppercase text-[10px] font-black tracking-tight flex items-center gap-1.5 border-2",
                      getTypeStyles(announcement.type)
                    )}>
                      {getTypeIcon(announcement.type)}
                      {announcement.type}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-teal-600 transition-colors">
                      {announcement.title}
                    </h3>
                    <p className="text-slate-500 font-medium leading-relaxed">
                      {announcement.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border-2 border-slate-50 text-xs font-black bg-teal-50 text-teal-600">
                        {announcement.author.name.charAt(0)}
                      </Avatar>
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-black text-slate-800">{announcement.author.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{announcement.author.role}</span>
                      </div>
                    </div>
                    <Button variant="ghost" className="text-teal-600 font-black text-xs uppercase tracking-widest px-0">
                      View Details
                      <ChevronRightIcon size={16} className="ml-1" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-200">
                <CalendarIcon size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-300 uppercase tracking-tight">No news for this day</h3>
              <p className="text-slate-400 font-medium mt-2">Select another date on the calendar to see historical updates.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};