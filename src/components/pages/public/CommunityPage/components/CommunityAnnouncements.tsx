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
import { YEARLY_ROADMAP, getRoadmapDatesForMonth, getRoadmapDateRange, AnnualEvent } from '@/constants/roadmapData';

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
  roadmapMilestone?: string; // Link to roadmap milestone title
}

export const SAMPLE_ANNOUNCEMENTS: Announcement[] = [
  // January - New Year Cleanup Drive
  {
    id: '1',
    title: 'Water Service Interruption - Tomorrow',
    content: 'Please be advised that there will be a scheduled water service maintenance on Jan 8 from 8:00 AM to 5:00 PM affecting Blocks 5 to 12. Please store enough water ahead of time.',
    type: 'Alert',
    author: { name: 'Admin Team', role: 'Community Admin' },
    createdAt: '2 hours ago',
    dateKey: '2026-01-08',
    isPinned: true,
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'New Year Cleanup Drive'
  },
  {
    id: '3',
    title: 'Community Garden Harvest Festival',
    content: 'The first harvest from our community garden is ready! Join us this Saturday morning at the central park for fresh produce and neighborhood breakfast.',
    type: 'Success',
    author: { name: 'Maria Santos', role: 'Environment Lead' },
    createdAt: '3 days ago',
    dateKey: '2026-01-05',
    communityName: 'Green Valley Community',
    roadmapMilestone: 'New Year Cleanup Drive'
  },
  {
    id: '4',
    title: 'Lost Property Procedure Updated',
    content: 'We have streamlined how lost and found items are logged through the FindrHub app. Please check the Resources tab for the new step-by-step guide.',
    type: 'Info',
    author: { name: 'Elena Gilbert', role: 'Moderator' },
    createdAt: '1 week ago',
    dateKey: '2026-01-12',
    communityName: 'Riverside Homeowners'
  },

  // February - Neighborhood Watch Seminar
  {
    id: '2',
    title: 'New Security Patrol Schedule',
    content: 'We are expanding our night patrol coverage to include the West Perimeter starting this Friday. Monthly dues will remain unchanged. The enhanced patrol will run from 9:00 PM to 6:00 AM daily with 3-member teams covering all major intersections.',
    type: 'Update',
    author: { name: 'Chief Mike', role: 'Security Head' },
    createdAt: '1 day ago',
    dateKey: '2026-02-10',
    isPinned: true,
    communityName: 'Zone 4 Safety Watch',
    roadmapMilestone: 'Neighborhood Watch Seminar'
  },
  {
    id: '5',
    title: 'Safety Seminar Registration Now Open',
    content: 'Registration is now open for our comprehensive Neighborhood Safety Seminar on February 12, 2026. Topics include personal safety, home security, and emergency preparedness. Limited to 100 participants. Register at the community office or online via FindrHub.',
    type: 'Update',
    author: { name: 'Chief Mike', role: 'Security Head' },
    createdAt: '5 days ago',
    dateKey: '2026-02-10',
    communityName: 'Zone 4 Safety Watch',
    roadmapMilestone: 'Neighborhood Watch Seminar'
  },
  {
    id: '6',
    title: 'Home Security Tips and Recommendations',
    content: 'As part of our Neighborhood Watch Seminar preparation, we are sharing essential home security tips. Install outdoor lighting, use door/window locks, and consider security cameras. Our security team is available for free home safety assessments.',
    type: 'Info',
    author: { name: 'Officer Juan Torres', role: 'Safety Officer' },
    createdAt: '1 week ago',
    dateKey: '2026-02-12',
    communityName: 'Zone 4 Safety Watch',
    roadmapMilestone: 'Neighborhood Watch Seminar'
  },

  // April - Summer Youth Sports League
  {
    id: '7',
    title: 'Summer Youth Sports League - Registration Open',
    content: 'Exciting news! Registration for the 2026 Summer Youth Sports League is now open for children ages 5-18. Programs include basketball, volleyball, soccer, and track & field. Early bird discount available until April 10. Register at https://community.resqhub.com/sports.',
    type: 'Success',
    author: { name: 'Coach Danny', role: 'Sports Coordinator' },
    createdAt: '2 days ago',
    dateKey: '2026-04-15',
    isPinned: true,
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'Summer Youth Sports League'
  },
  {
    id: '8',
    title: 'Volunteer Coaches Needed for Summer League',
    content: 'We are looking for passionate volunteer coaches to support our Summer Youth Sports League. No prior coaching experience required, just enthusiasm and dedication. Training provided. Interested? Email sports@community.resqhub.com.',
    type: 'Update',
    author: { name: 'Coach Danny', role: 'Sports Coordinator' },
    createdAt: '4 days ago',
    dateKey: '2026-04-16',
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'Summer Youth Sports League'
  },
  {
    id: '9',
    title: 'Sports Venue Improvements Completed',
    content: 'Great news! The renovation of our community sports complex is complete. New basketball courts, volleyball nets, and soccer field with improved lighting are now ready for the Summer Youth Sports League. Grand opening event on April 18.',
    type: 'Success',
    author: { name: 'Admin Team', role: 'Community Admin' },
    createdAt: '6 days ago',
    dateKey: '2026-04-17',
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'Summer Youth Sports League'
  },
  {
    id: '10',
    title: 'Spring Break Sports Clinic Scheduled',
    content: 'Special spring break sports clinic featuring local athletes! April 19-23, featuring daily clinics in basketball, soccer, and volleyball. Perfect for kids looking to improve their skills before the league starts. Limited spots available!',
    type: 'Info',
    author: { name: 'Coach Danny', role: 'Sports Coordinator' },
    createdAt: '1 week ago',
    dateKey: '2026-04-19',
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'Summer Youth Sports League'
  },

  // June - Drainage Systems Audit
  {
    id: '11',
    title: 'Drainage Systems Audit - Community Notice',
    content: 'The annual Drainage Systems Audit will commence on June 5, 2026. Our engineering team will inspect all main drainage lines, culverts, and flood control systems. Some areas may have temporary water service interruptions. We appreciate your patience and cooperation.',
    type: 'Alert',
    author: { name: 'Public Works Manager', role: 'Infrastructure Head' },
    createdAt: '3 days ago',
    dateKey: '2026-06-05',
    isPinned: true,
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'Drainage Systems Audit'
  },
  {
    id: '12',
    title: 'Drainage Improvement Project Results',
    content: 'The Phase 1 drainage audit revealed several areas needing attention. We have prioritized repairs to prevent flooding during the monsoon season. Expected completion by end of June. Updates will be posted weekly on the community board.',
    type: 'Update',
    author: { name: 'Public Works Manager', role: 'Infrastructure Head' },
    createdAt: '4 days ago',
    dateKey: '2026-06-06',
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'Drainage Systems Audit'
  },
  {
    id: '13',
    title: 'How to Report Drainage Issues',
    content: 'Found a drainage problem in your area? Report it immediately! Use the FindrHub app to submit photos and location details, or call our hotline at 555-DRAIN (555-37246). All reports are tracked and prioritized based on urgency.',
    type: 'Info',
    author: { name: 'Environmental Officer', role: 'Community Services' },
    createdAt: '1 week ago',
    dateKey: '2026-06-07',
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'Drainage Systems Audit'
  },
  {
    id: '14',
    title: 'Monsoon Season Preparation Tips',
    content: 'As the drainage audit concludes, prepare for the upcoming monsoon season. Clean gutters, trim overhanging branches, and ensure proper yard grading. Community-wide cleanup will be held June 20-22. Volunteers welcome!',
    type: 'Info',
    author: { name: 'Maria Santos', role: 'Environment Lead' },
    createdAt: '2 weeks ago',
    dateKey: '2026-06-08',
    communityName: 'Green Valley Community',
    roadmapMilestone: 'Drainage Systems Audit'
  },

  // October - Community Fiesta 2026
  {
    id: '15',
    title: 'Community Fiesta 2026 - Save the Date!',
    content: 'Mark your calendars! The highly anticipated Community Fiesta 2026 is coming October 20-25! Featuring live music, cultural performances, food stalls, games, and more. This year\'s theme celebrates our community\'s diversity and unity.',
    type: 'Success',
    author: { name: 'Fiesta Committee', role: 'Community Events' },
    createdAt: '2 weeks ago',
    dateKey: '2026-10-20',
    isPinned: true,
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'Community Fiesta 2026'
  },
  {
    id: '16',
    title: 'Vendor and Performer Applications Open',
    content: 'Are you a local artist, musician, food vendor, or business owner? Apply now to be part of Community Fiesta 2026! We\'re looking for diverse performers, food vendors, craft stalls, and activity booths. Application deadline: September 15. Learn more at fiesta@community.resqhub.com.',
    type: 'Update',
    author: { name: 'Fiesta Committee', role: 'Community Events' },
    createdAt: '3 weeks ago',
    dateKey: '2026-10-21',
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'Community Fiesta 2026'
  },
  {
    id: '17',
    title: 'Volunteer Opportunities for Fiesta',
    content: 'Volunteers needed for setup, coordination, food service, and more! Sign up today to make Community Fiesta 2026 a success. Volunteering during the event earns community service hours and special recognition. Register at the community center or online.',
    type: 'Update',
    author: { name: 'Fiesta Committee', role: 'Community Events' },
    createdAt: '1 month ago',
    dateKey: '2026-10-22',
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'Community Fiesta 2026'
  },
  {
    id: '18',
    title: 'Early Bird Fiesta Family Packages Available',
    content: 'Limited time offer! Purchase family packages at 30% discount to enjoy exclusive perks including reserved seating for shows, special dining vouchers, and priority access to activities. Offer ends October 15. Buy now at ticketing.resqhub.com.',
    type: 'Success',
    author: { name: 'Fiesta Committee', role: 'Community Events' },
    createdAt: '1 week ago',
    dateKey: '2026-10-23',
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'Community Fiesta 2026'
  },
  {
    id: '19',
    title: 'Traffic and Parking Arrangements for Fiesta',
    content: 'To ensure smooth flow during Community Fiesta, special parking arrangements will be in place. Designated parking areas and shuttle services available. Avoid the main access roads from 4:00 PM. Full details at fiesta2026.community.resqhub.com.',
    type: 'Info',
    author: { name: 'Traffic Management', role: 'Community Admin' },
    createdAt: '10 days ago',
    dateKey: '2026-10-24',
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'Community Fiesta 2026'
  },

  // December - Annual General Assembly
  {
    id: '20',
    title: 'Annual General Assembly 2026 - Attendance Required',
    content: 'All community members are invited to the Annual General Assembly on December 15, 2026 at 6:00 PM in the Grand Hall. This is where we review the year\'s achievements, discuss budget allocation, and vote on important community matters. Your voice matters!',
    type: 'Alert',
    author: { name: 'Board of Directors', role: 'Community Leadership' },
    createdAt: '4 days ago',
    dateKey: '2026-12-15',
    isPinned: true,
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'Annual General Assembly'
  },
  {
    id: '21',
    title: 'AGA 2026 - Agenda and Reports Available',
    content: 'The detailed agenda and annual reports for the Annual General Assembly are now available. Review the financial statements, operational reports, and upcoming initiatives. Documents can be accessed through the community portal or physical copies at the office.',
    type: 'Update',
    author: { name: 'Board Secretary', role: 'Board of Directors' },
    createdAt: '1 week ago',
    dateKey: '2026-12-15',
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'Annual General Assembly'
  },
  {
    id: '22',
    title: 'Board of Directors Elections - Nominations Open',
    content: 'Nominations for Board positions are open! Positions available: President, Vice President, Treasurer, and 4 Directors. If you\'re interested in leading our community, submit your nomination by December 8. Elections will be held during the AGA.',
    type: 'Update',
    author: { name: 'Election Committee', role: 'Board of Directors' },
    createdAt: '2 weeks ago',
    dateKey: '2026-12-15',
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'Annual General Assembly'
  },
  {
    id: '23',
    title: '2027 Community Budget Proposal Review',
    content: 'The proposed 2027 community budget has been released. Allocations include infrastructure improvements, social programs, and security enhancements. Public comments welcome until December 10. Detailed breakdown available at budget2027.community.resqhub.com.',
    type: 'Info',
    author: { name: 'Finance Committee', role: 'Board of Directors' },
    createdAt: '3 weeks ago',
    dateKey: '2026-12-16',
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'Annual General Assembly'
  },
  {
    id: '24',
    title: 'Community Achievements and Milestones 2026',
    content: 'Celebrating 2026! We successfully completed the youth sports complex, expanded security patrols, improved drainage systems, and organized two successful community events. Special thanks to all volunteers and participants. Let\'s make 2027 even better!',
    type: 'Success',
    author: { name: 'Board of Directors', role: 'Community Leadership' },
    createdAt: '1 month ago',
    dateKey: '2026-12-17',
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'Annual General Assembly'
  }
];

export const CommunityAnnouncements: React.FC<{ 
  isAdmin?: boolean;
  isAnnouncementModalOpen?: boolean;
  onOpenAnnouncementModal?: () => void;
  onOpenCalendarModal?: () => void;
}> = ({ 
  isAdmin, 
  isAnnouncementModalOpen,
  onOpenAnnouncementModal,
  onOpenCalendarModal
}) => {
  const [selectedDate, setSelectedDate] = useState('2026-01-12');
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1)); // January 2026
  const [showRoadmapDetails, setShowRoadmapDetails] = useState(false);
  const [selectedRoadmapMilestone, setSelectedRoadmapMilestone] = useState<AnnualEvent | null>(null);

  const { dates: roadmapDates, events: monthRoadmapEvents } = getRoadmapDatesForMonth(currentMonth.getMonth(), currentMonth.getFullYear());

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

  const filteredAnnouncements = selectedRoadmapMilestone 
    ? SAMPLE_ANNOUNCEMENTS.filter(a => a.roadmapMilestone === selectedRoadmapMilestone.title)
    : SAMPLE_ANNOUNCEMENTS.filter(a => a.dateKey === selectedDate);

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
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">
            2026 Community <span className="text-teal-600">Roadmap</span>
          </h3>
          <Badge className="bg-teal-50 text-teal-600 border-none font-bold text-[10px] px-3">ANNUAL OUTLOOK</Badge>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide">
          {YEARLY_ROADMAP.map((item, idx) => (
            <Card 
              key={idx} 
              onClick={() => {
                if (selectedRoadmapMilestone?.title === item.title) {
                  // Deselect: clear milestone and reset calendar
                  setSelectedRoadmapMilestone(null);
                  setSelectedDate('2026-01-12');
                  setCurrentMonth(new Date(2026, 0, 1));
                } else {
                  // Select: set milestone and navigate calendar to that month
                  setSelectedRoadmapMilestone(item);
                  const monthIndex = new Date(`${item.month} 1, 2026`).getMonth();
                  setCurrentMonth(new Date(2026, monthIndex, 1));
                  // Set to first date in the milestone range
                  const { dates: milestoneDates } = getRoadmapDateRange(item, 2026);
                  setSelectedDate(milestoneDates.length > 0 ? milestoneDates[0] : `2026-${String(monthIndex + 1).padStart(2, '0')}-01`);
                }
              }}
              className={cn(
                "min-w-[240px] p-6 border-none rounded-3xl transition-all duration-500 group cursor-pointer",
                selectedRoadmapMilestone?.title === item.title
                  ? "shadow-xl bg-gradient-to-br from-teal-50 to-blue-50 border-2 border-teal-500"
                  : "shadow-sm bg-white hover:shadow-xl border-2 border-transparent"
              )}
            >
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
                  <h4 className={cn(
                    "font-black leading-tight transition-colors",
                    selectedRoadmapMilestone?.title === item.title ? "text-teal-700" : "text-slate-800 group-hover:text-teal-600"
                  )}>
                    {item.title}
                  </h4>
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
                const { dates: milestoneDates } = getRoadmapDateRange(selectedRoadmapMilestone, 2026);
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
                  <h4 className="text-lg font-black text-teal-800">2026 Roadmap Milestone</h4>
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
              <h3 className="text-xl font-black text-slate-300 uppercase tracking-tight">
                {selectedRoadmapMilestone ? `No announcements for "${selectedRoadmapMilestone.title}"` : 'No news for this day'}
              </h3>
              <p className="text-slate-400 font-medium mt-2">
                {selectedRoadmapMilestone 
                  ? 'Select a different roadmap milestone or clear the selection.' 
                  : 'Select another date on the calendar to see historical updates.'}
              </p>
              {selectedRoadmapMilestone && (
                <Button 
                  onClick={() => setSelectedRoadmapMilestone(null)}
                  className="mt-6 px-6 h-10 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-sm"
                >
                  Clear Milestone Filter
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};