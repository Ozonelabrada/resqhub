import React, { useState } from 'react';
import { Card, Button, Avatar, ShadcnBadge as Badge } from '@/components/ui';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Users, 
  Clock, 
  Plus,
  ArrowRight,
  Search,
  ChevronLeft,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { YEARLY_ROADMAP, getRoadmapDatesForMonth, getRoadmapDateRange, AnnualEvent } from '@/constants/roadmapData';

export interface CommunityEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: 'Workshop' | 'Meetup' | 'Volunteer' | 'Emergency Drill';
  attendees: number;
  organizer: {
    name: string;
    role: string;
    avatar?: string;
  };
  description: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  dateKey: string; // YYYY-MM-DD
  communityName?: string;
  roadmapMilestone?: string; // Link to roadmap milestone title
}

export const SAMPLE_EVENTS: CommunityEvent[] = [
  // January - New Year Cleanup Drive
  {
    id: '1',
    title: 'Neighborhood First Aid Workshop',
    date: 'Jan 7, 2026',
    time: '10:00 AM - 12:00 PM',
    location: 'Community Center Main Hall',
    category: 'Workshop',
    attendees: 24,
    organizer: { name: 'Dr. Sarah Lee', role: 'Health Coordinator' },
    description: 'Learn essential life-saving skills including CPR and basic wound care. Open to all residents. Certification provided upon completion.',
    status: 'Upcoming',
    dateKey: '2026-01-07',
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'New Year Cleanup Drive'
  },
  {
    id: '3',
    title: 'Local Goods Swap Meet',
    date: 'Jan 5, 2026',
    time: '09:00 AM - 04:00 PM',
    location: 'Sitio Maligaya Park',
    category: 'Meetup',
    attendees: 45,
    organizer: { name: 'Maria Santos', role: 'Community Lead' },
    description: 'Bring items you no longer need and swap them with your neighbors. Promoting zero waste and community bonding. Free event!',
    status: 'Ongoing',
    dateKey: '2026-01-05',
    communityName: 'Green Valley Community',
    roadmapMilestone: 'New Year Cleanup Drive'
  },
  {
    id: '4',
    title: 'Drainage Cleanup Drive',
    date: 'Jan 9, 2026',
    time: '06:00 AM - 09:00 AM',
    location: 'Riverside Block 2',
    category: 'Volunteer',
    attendees: 30,
    organizer: { name: 'Community Watch', role: 'Environment' },
    description: 'Help prevent flooding by clearing local drainage systems. Gloves and bags will be provided. Light refreshments after the cleanup.',
    status: 'Upcoming',
    dateKey: '2026-01-09',
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'New Year Cleanup Drive'
  },

  // February - Neighborhood Watch Seminar
  {
    id: '2',
    title: 'Emergency Response Drill 2026',
    date: 'Feb 11, 2026',
    time: '09:00 AM - 11:00 AM',
    location: 'Zone 4 Fire Station',
    category: 'Emergency Drill',
    attendees: 45,
    organizer: { name: 'Fire Chief Mike', role: 'Security Head' },
    description: 'Annual fire and earthquake response drill. Please register your household for participation credits. Testing new emergency alert systems.',
    status: 'Upcoming',
    dateKey: '2026-02-11',
    communityName: 'Zone 4 Safety Watch',
    roadmapMilestone: 'Neighborhood Watch Seminar'
  },
  {
    id: '25',
    title: 'Neighborhood Safety Seminar',
    date: 'Feb 12, 2026',
    time: '06:00 PM - 08:30 PM',
    location: 'Community Hall - Conference Room A',
    category: 'Workshop',
    attendees: 87,
    organizer: { name: 'Chief Mike', role: 'Security Head' },
    description: 'Comprehensive seminar on home security, personal safety, and emergency preparedness. Expert speakers and interactive Q&A session. Free registration.',
    status: 'Upcoming',
    dateKey: '2026-02-12',
    communityName: 'Zone 4 Safety Watch',
    roadmapMilestone: 'Neighborhood Watch Seminar'
  },
  {
    id: '26',
    title: 'Neighborhood Watch Patrol Training',
    date: 'Feb 10, 2026',
    time: '07:00 PM - 09:00 PM',
    location: 'Zone 4 Community Office',
    category: 'Workshop',
    attendees: 28,
    organizer: { name: 'Officer Juan Torres', role: 'Safety Officer' },
    description: 'Training session for neighborhood watch volunteers on patrol procedures, safety protocols, and community engagement. New volunteers welcome!',
    status: 'Upcoming',
    dateKey: '2026-02-10',
    communityName: 'Zone 4 Safety Watch',
    roadmapMilestone: 'Neighborhood Watch Seminar'
  },

  // April - Summer Youth Sports League
  {
    id: '27',
    title: 'Summer Sports League Registration Drive',
    date: 'Apr 15, 2026',
    time: '09:00 AM - 05:00 PM',
    location: 'Sports Complex Administration Office',
    category: 'Meetup',
    attendees: 120,
    organizer: { name: 'Coach Danny', role: 'Sports Coordinator' },
    description: 'On-site registration for Summer Youth Sports League. Early bird discounts available. Ages 5-18. Register for basketball, volleyball, soccer, or track & field.',
    status: 'Upcoming',
    dateKey: '2026-04-15',
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'Summer Youth Sports League'
  },
  {
    id: '28',
    title: 'Spring Break Sports Clinic - Basketball',
    date: 'Apr 19, 2026',
    time: '10:00 AM - 12:00 PM',
    location: 'Community Sports Complex - Court A',
    category: 'Workshop',
    attendees: 35,
    organizer: { name: 'Coach Danny', role: 'Sports Coordinator' },
    description: 'Intensive basketball clinic led by local athletes. Learn dribbling, shooting, and game strategy. Perfect for beginners and intermediate players.',
    status: 'Upcoming',
    dateKey: '2026-04-19',
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'Summer Youth Sports League'
  },
  {
    id: '29',
    title: 'Spring Break Sports Clinic - Soccer',
    date: 'Apr 20, 2026',
    time: '02:00 PM - 04:00 PM',
    location: 'Community Sports Complex - Field B',
    category: 'Workshop',
    attendees: 28,
    organizer: { name: 'Coach Danny', role: 'Sports Coordinator' },
    description: 'Soccer skills clinic covering ball control, passing, shooting, and tactical positioning. All skill levels welcome. Bring your own cleats.',
    status: 'Upcoming',
    dateKey: '2026-04-20',
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'Summer Youth Sports League'
  },
  {
    id: '30',
    title: 'Sports Complex Grand Opening',
    date: 'Apr 18, 2026',
    time: '04:00 PM - 08:00 PM',
    location: 'Community Sports Complex',
    category: 'Meetup',
    attendees: 250,
    organizer: { name: 'Admin Team', role: 'Community Admin' },
    description: 'Celebrate the grand opening of our renovated sports complex! Live performances, food vendors, facility tours, and free trial sports activities for all ages.',
    status: 'Upcoming',
    dateKey: '2026-04-18',
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'Summer Youth Sports League'
  },

  // June - Drainage Systems Audit
  {
    id: '31',
    title: 'Drainage Systems Audit - Public Information Session',
    date: 'Jun 5, 2026',
    time: '02:00 PM - 04:00 PM',
    location: 'Community Center - Main Hall',
    category: 'Workshop',
    attendees: 65,
    organizer: { name: 'Public Works Manager', role: 'Infrastructure Head' },
    description: 'Information session about the annual drainage audit. Learn about inspection procedures, timeline, and what to expect. Q&A with engineering team.',
    status: 'Upcoming',
    dateKey: '2026-06-05',
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'Drainage Systems Audit'
  },
  {
    id: '32',
    title: 'Community Drainage Cleanup Volunteer Day',
    date: 'Jun 6, 2026',
    time: '07:00 AM - 12:00 PM',
    location: 'Multiple Locations Around Community',
    category: 'Volunteer',
    attendees: 89,
    organizer: { name: 'Maria Santos', role: 'Environment Lead' },
    description: 'Support the drainage audit by volunteering to help clean storm drains and clear debris. Tools provided. Meet at community center for briefing.',
    status: 'Upcoming',
    dateKey: '2026-06-06',
    communityName: 'Green Valley Community',
    roadmapMilestone: 'Drainage Systems Audit'
  },
  {
    id: '33',
    title: 'Monsoon Preparedness Workshop',
    date: 'Jun 20, 2026',
    time: '03:00 PM - 05:00 PM',
    location: 'Community Center - Room 201',
    category: 'Workshop',
    attendees: 42,
    organizer: { name: 'Environmental Officer', role: 'Community Services' },
    description: 'Learn how to prepare your home and property for the monsoon season. Expert tips on gutters, grading, and emergency preparedness.',
    status: 'Upcoming',
    dateKey: '2026-06-20',
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'Drainage Systems Audit'
  },

  // October - Community Fiesta 2026
  {
    id: '34',
    title: 'Community Fiesta 2026 - Grand Opening',
    date: 'Oct 20, 2026',
    time: '05:00 PM - 10:00 PM',
    location: 'Central Community Park',
    category: 'Meetup',
    attendees: 500,
    organizer: { name: 'Fiesta Committee', role: 'Community Events' },
    description: 'Opening night of Community Fiesta 2026! Live music, cultural performances, and food vendors. Fireworks at 8:30 PM. Family-friendly activities all night.',
    status: 'Upcoming',
    dateKey: '2026-10-20',
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'Community Fiesta 2026'
  },
  {
    id: '35',
    title: 'Cultural Performance - Traditional Dance',
    date: 'Oct 21, 2026',
    time: '06:00 PM - 07:30 PM',
    location: 'Fiesta Main Stage',
    category: 'Meetup',
    attendees: 300,
    organizer: { name: 'Fiesta Committee', role: 'Community Events' },
    description: 'Spectacular performance of traditional Filipino and regional dances. Featuring local dance troupes and cultural performers. Experience our heritage!',
    status: 'Upcoming',
    dateKey: '2026-10-21',
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'Community Fiesta 2026'
  },
  {
    id: '36',
    title: 'Fiesta Food Festival & Cooking Competition',
    date: 'Oct 22, 2026',
    time: '11:00 AM - 08:00 PM',
    location: 'Fiesta Food Court & Kitchen Stage',
    category: 'Meetup',
    attendees: 400,
    organizer: { name: 'Fiesta Committee', role: 'Community Events' },
    description: 'Taste the best local food! Food vendors from across the community. Cooking competition at 3:00 PM with cash prizes. Vote for your favorite dish!',
    status: 'Upcoming',
    dateKey: '2026-10-22',
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'Community Fiesta 2026'
  },
  {
    id: '37',
    title: 'Fiesta Games & Activities Day',
    date: 'Oct 23, 2026',
    time: '10:00 AM - 06:00 PM',
    location: 'Fiesta Carnival Area',
    category: 'Meetup',
    attendees: 450,
    organizer: { name: 'Fiesta Committee', role: 'Community Events' },
    description: 'Family fun day with carnival games, rides, prizes, and interactive activities for all ages. Win tickets for big prizes! Games for all skill levels.',
    status: 'Upcoming',
    dateKey: '2026-10-23',
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'Community Fiesta 2026'
  },
  {
    id: '38',
    title: 'Community Talent Show & Karaoke Night',
    date: 'Oct 24, 2026',
    time: '06:00 PM - 09:30 PM',
    location: 'Fiesta Main Stage',
    category: 'Meetup',
    attendees: 350,
    organizer: { name: 'Fiesta Committee', role: 'Community Events' },
    description: 'Showcase your talent! Singing, dancing, comedy, and more. Open karaoke for all. $500 prize for the top 3 acts. Register at the stage.',
    status: 'Upcoming',
    dateKey: '2026-10-24',
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'Community Fiesta 2026'
  },

  // December - Annual General Assembly
  {
    id: '39',
    title: 'Annual General Assembly 2026',
    date: 'Dec 15, 2026',
    time: '06:00 PM - 09:00 PM',
    location: 'Community Grand Hall',
    category: 'Meetup',
    attendees: 200,
    organizer: { name: 'Board of Directors', role: 'Community Leadership' },
    description: 'Annual General Assembly where we review community achievements, discuss 2027 plans, vote on budget allocation, and elect new board members. All residents welcome!',
    status: 'Upcoming',
    dateKey: '2026-12-15',
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'Annual General Assembly'
  },
  {
    id: '40',
    title: 'Year-End Community Appreciation Dinner',
    date: 'Dec 16, 2026',
    time: '05:00 PM - 08:00 PM',
    location: 'Community Center - Banquet Hall',
    category: 'Meetup',
    attendees: 180,
    organizer: { name: 'Board of Directors', role: 'Community Leadership' },
    description: 'Celebrate our community\'s achievements! Recognition ceremony for volunteers and leaders. Dinner, awards, and entertainment. RSVP required.',
    status: 'Upcoming',
    dateKey: '2026-12-16',
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'Annual General Assembly'
  },
  {
    id: '41',
    title: 'Budget Discussion and Q&A Session',
    date: 'Dec 12, 2026',
    time: '02:00 PM - 04:00 PM',
    location: 'Community Center - Conference Room',
    category: 'Workshop',
    attendees: 67,
    organizer: { name: 'Finance Committee', role: 'Board of Directors' },
    description: 'Public discussion on the 2027 community budget. Finance committee presents proposals and answers community questions. All members encouraged to attend.',
    status: 'Upcoming',
    dateKey: '2026-12-12',
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'Annual General Assembly'
  },
  {
    id: '42',
    title: 'Board Elections Information Session',
    date: 'Dec 13, 2026',
    time: '06:00 PM - 07:30 PM',
    location: 'Community Center - Room 101',
    category: 'Workshop',
    attendees: 54,
    organizer: { name: 'Election Committee', role: 'Board of Directors' },
    description: 'Learn about board positions, responsibilities, and voting procedures. Meet the candidates and understand what it takes to lead our community.',
    status: 'Upcoming',
    dateKey: '2026-12-13',
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'Annual General Assembly'
  },
  {
    id: '43',
    title: 'Year-End Community Reflection & Planning',
    date: 'Dec 17, 2026',
    time: '03:00 PM - 05:00 PM',
    location: 'Community Center - Main Hall',
    category: 'Workshop',
    attendees: 89,
    organizer: { name: 'Board of Directors', role: 'Community Leadership' },
    description: 'Community reflection session on 2026 achievements and planning for 2027 initiatives. Share your feedback and suggestions for the new year!',
    status: 'Upcoming',
    dateKey: '2026-12-17',
    communityName: 'Riverside Homeowners',
    roadmapMilestone: 'Annual General Assembly'
  }
];

export const CommunityEvents: React.FC<{
  isAdmin?: boolean;
  isEventModalOpen?: boolean;
  onOpenEventModal?: () => void;
  onOpenCalendarModal?: () => void;
}> = ({ 
  isAdmin,
  isEventModalOpen,
  onOpenEventModal,
  onOpenCalendarModal
}) => {
  const [filter, setFilter] = useState('All');
  const [selectedDate, setSelectedDate] = useState('2026-01-12');
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1)); // January 2026
  const [showRoadmapDetails, setShowRoadmapDetails] = useState(false);
  const [selectedRoadmapMilestone, setSelectedRoadmapMilestone] = useState<AnnualEvent | null>(null);

  const { dates: roadmapDates, events: monthRoadmapEvents } = getRoadmapDatesForMonth(currentMonth.getMonth(), currentMonth.getFullYear());

  const categories = ['All', 'Workshop', 'Meetup', 'Volunteer', 'Emergency Drill'];

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
    const count = SAMPLE_EVENTS.filter(e => e.dateKey === dateStr).length;
    return { dateStr, count };
  };

  const filteredEvents = selectedRoadmapMilestone
    ? SAMPLE_EVENTS.filter(e => {
        const matchesCategory = filter === 'All' || e.category === filter;
        const matchesMilestone = e.roadmapMilestone === selectedRoadmapMilestone.title;
        return matchesCategory && matchesMilestone;
      })
    : SAMPLE_EVENTS.filter(e => {
        const matchesDate = e.dateKey === selectedDate;
        const matchesCategory = filter === 'All' || e.category === filter;
        return matchesDate && matchesCategory;
      });

  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();
  const days = getDaysInMonth(currentMonth);
  const skip = getFirstDayOfMonth(currentMonth);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-teal-200">
                <CalendarIcon size={24} />
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic">
                Community <span className="text-teal-600">Events</span>
              </h2>
            </div>
            <p className="text-slate-500 font-medium max-w-lg">
              Stay connected with your neighbors through upcoming activities, workshops, and communal efforts.
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
                onClick={onOpenEventModal}
                className="h-14 px-8 bg-slate-600 hover:bg-slate-700 text-white font-black rounded-2xl shadow-xl shadow-slate-100 flex items-center gap-2"
              >
                <Plus size={20} className="stroke-[3px]" />
                PROPOSE EVENT
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
                  <p className="text-[10px] text-slate-400 font-bold mt-2 leading-relaxed">
                    {item.dateRange}
                  </p>
                </div>
                <Badge variant="outline" className={cn(
                  "text-[8px] uppercase font-black tracking-wider w-fit border-none",
                  item.type === 'Celebration' ? "bg-orange-50 text-orange-600" :
                  item.type === 'Mission' ? "bg-teal-50 text-teal-600" :
                  item.type === 'Security' ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-600"
                )}>
                  {item.type}
                </Badge>
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
                    // Clicking a date clears the milestone filter to show date-specific events
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

        {/* Events List */}
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

          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <Card key={event.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white">
                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <Badge className={cn(
                      "px-4 py-1.5 rounded-xl uppercase text-[10px] font-black tracking-tighter border-none",
                      event.status === 'Ongoing' ? "bg-teal-500 text-white animate-pulse" : "bg-teal-50 text-teal-600"
                    )}>
                      {event.status === 'Ongoing' ? '• Happening Now' : event.category}
                    </Badge>
                    <div className="flex items-center text-slate-400 font-bold text-xs gap-1">
                      <Users size={14} />
                      {event.attendees} interested
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-teal-600 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-slate-500 text-sm font-medium line-clamp-2">
                      {event.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <Clock size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-300 uppercase leading-none mb-1">Time</span>
                        <span className="text-xs font-bold text-slate-600 truncate">{event.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <MapPin size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-300 uppercase leading-none mb-1">Where</span>
                        <span className="text-xs font-bold text-slate-600 truncate">{event.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 text-[10px] font-black">
                        {event.organizer.name.charAt(0)}
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-800">{event.organizer.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{event.organizer.role}</span>
                      </div>
                    </div>
                    <Button variant="ghost" className="rounded-xl group/btn text-teal-600 font-black text-xs hover:bg-teal-50">
                      DETAILS
                      <ArrowRight size={14} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-50 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-200">
                <CalendarIcon size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-300 uppercase tracking-tight">
                {selectedRoadmapMilestone ? `No events for "${selectedRoadmapMilestone.title}"` : 'No events for this day'}
              </h3>
              <p className="text-slate-400 font-medium mt-2">
                {selectedRoadmapMilestone 
                  ? 'Select a different roadmap milestone or clear the selection.' 
                  : 'Select another date on the calendar to see upcoming events.'}
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