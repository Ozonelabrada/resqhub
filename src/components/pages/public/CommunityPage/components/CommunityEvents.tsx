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
}

export const SAMPLE_EVENTS: CommunityEvent[] = [
  {
    id: '1',
    title: 'Neighborhood First Aid Workshop',
    date: 'Jan 25, 2026',
    time: '10:00 AM - 12:00 PM',
    location: 'Community Center Main Hall',
    category: 'Workshop',
    attendees: 24,
    organizer: { name: 'Dr. Sarah Lee', role: 'Health Coordinator' },
    description: 'Learn essential life-saving skills including CPR and basic wound care. Open to all residents.',
    status: 'Upcoming',
    dateKey: '2026-01-25',
    communityName: 'Riverside Homeowners'
  },
  {
    id: '2',
    title: 'Emergency Response Drill 2026',
    date: 'Feb 05, 2026',
    time: '09:00 AM - 11:00 AM',
    location: 'Zone 4 Fire Station',
    category: 'Emergency Drill',
    attendees: 45,
    organizer: { name: 'Fire Chief Mike', role: 'Security Head' },
    description: 'Annual fire and earthquake response drill. Please register your household for participation credits.',
    status: 'Upcoming',
    dateKey: '2026-02-05',
    communityName: 'Zone 4 Safety Watch'
  },
  {
    id: '3',
    title: 'Local Goods Swap Meet',
    date: 'Jan 12, 2026',
    time: 'Ongoing until 4:00 PM',
    location: 'Sitio Maligaya Park',
    category: 'Meetup',
    attendees: 12,
    organizer: { name: 'Maria Santos', role: 'Community Lead' },
    description: 'Bring items you no longer need and swap them with your neighbors. Promoting zero waste!',
    status: 'Ongoing',
    dateKey: '2026-01-12',
    communityName: 'Green Valley Community'
  },
  {
    id: '4',
    title: 'Drainage Cleanup Drive',
    date: 'Jan 13, 2026',
    time: '06:00 AM - 09:00 AM',
    location: 'Riverside Block 2',
    category: 'Volunteer',
    attendees: 30,
    organizer: { name: 'Community Watch', role: 'Environment' },
    description: 'Help prevent flooding by clearing local drainage systems. Gloves and bags will be provided.',
    status: 'Upcoming',
    dateKey: '2026-01-13',
    communityName: 'Riverside Homeowners'
  }
];

export const CommunityEvents: React.FC = () => {
  const [filter, setFilter] = useState('All');
  const [selectedDate, setSelectedDate] = useState('2026-01-12');
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1)); // January 2026

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

  const filteredEvents = SAMPLE_EVENTS.filter(e => {
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

          <Button className="h-14 px-8 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl shadow-xl shadow-teal-100 flex items-center gap-2">
            <Plus size={20} className="stroke-[3px]" />
            PROPOSE EVENT
          </Button>
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
              Date: <span className="text-slate-900 ml-auto">{new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-300 uppercase px-2">Categories</span>
              <div className="grid grid-cols-1 gap-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all",
                      filter === cat 
                        ? "bg-teal-50 text-teal-600" 
                        : "text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Events Grid */}
        <div className="xl:col-span-8 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="relative group flex-1 max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search events for this day..." 
                className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-50 rounded-2xl text-xs font-bold focus:outline-none focus:border-teal-500 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white">
                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <Badge className={cn(
                      "px-4 py-1.5 rounded-xl uppercase text-[10px] font-black tracking-tighter border-none",
                      event.status === 'Ongoing' ? "bg-emerald-500 text-white animate-pulse" : "bg-teal-50 text-teal-600"
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
            ))}

            {filteredEvents.length === 0 && (
              <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-50 flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-200">
                  <CalendarIcon size={40} />
                </div>
                <h3 className="text-xl font-black text-slate-300 uppercase tracking-tight">No events for this day</h3>
                <p className="text-slate-400 font-medium mt-2">Try selecting another date or category.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};