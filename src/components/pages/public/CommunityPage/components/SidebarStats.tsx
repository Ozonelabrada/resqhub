import React from 'react';
import { MapPin, Calendar, Heart, TrendingUp, Megaphone, ShieldCheck } from 'lucide-react';
import { Card, Avatar, Badge, Button } from '@/components/ui';

interface SidebarStatsProps {
  community: any;
  safeMembers: any[];
  todaysAnnouncements: any[];
  todaysEvents: any[];
  onUpdatesClick: () => void;
  onMembersClick: () => void;
}

const STATIC_MEMBERS = [
  { id: 1, name: 'Alex Rivera' },
  { id: 2, name: 'Sarah Chen' },
  { id: 3, name: 'Mike Johnson' },
  { id: 4, name: 'Elena Cruz' },
  { id: 5, name: 'David Smith' },
];

const SidebarStats: React.FC<SidebarStatsProps> = ({
  community,
  safeMembers,
  todaysAnnouncements,
  todaysEvents,
  onUpdatesClick,
  onMembersClick,
}) => {
  return (
    <>
      {/* TODAY'S UPDATES */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-50 flex flex-col gap-4 group/card hover:shadow-md transition-all shrink-0">
        <div className="flex items-center justify-between cursor-pointer" onClick={onUpdatesClick}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center group-hover/card:scale-110 transition-transform">
              <Megaphone className="text-blue-500 w-5 h-5" />
            </div>
            <h3 className="text-slate-900 font-black text-lg tracking-tight">Today's Updates</h3>
          </div>
          <Badge variant="outline" className="text-[9px] border-blue-100 text-blue-500 font-black uppercase tracking-tighter">
            {todaysAnnouncements.length} new
          </Badge>
        </div>

        <div className="space-y-3">
          {todaysAnnouncements.length > 0 ? (
            todaysAnnouncements.slice(0, 2).map((ann) => (
              <div
                key={ann.id}
                className="p-3 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-100 transition-colors cursor-pointer"
                onClick={onUpdatesClick}
              >
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">
                  {(ann as any).category || 'Zone 2'}
                </p>
                <p className="text-sm font-bold text-slate-800 line-clamp-1">{ann.title}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic px-2">No new updates</p>
          )}
        </div>
      </div>

      {/* JOIN THE ACTION */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-50 flex flex-col gap-4 group/card hover:shadow-md transition-all shrink-0">
        <div className="flex items-center justify-between cursor-pointer" onClick={onUpdatesClick}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover/card:scale-110 transition-transform">
              <Calendar className="text-emerald-500 w-5 h-5" />
            </div>
            <h3 className="text-slate-900 font-black text-lg tracking-tight">Join the Action</h3>
          </div>
          <Badge variant="outline" className="text-[9px] border-emerald-100 text-emerald-500 font-black uppercase tracking-tighter">
            {todaysEvents.length} TODAY
          </Badge>
        </div>

        <div className="space-y-3">
          {todaysEvents.length > 0 ? (
            todaysEvents.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-3 bg-emerald-50/30 rounded-2xl hover:bg-emerald-50 transition-colors cursor-pointer"
                onClick={onUpdatesClick}
              >
                <div className="flex flex-col items-center justify-center bg-white min-w-[40px] h-10 rounded-xl shadow-sm border border-emerald-100">
                  <span className="text-[10px] font-black text-emerald-600 leading-none">JAN</span>
                  <span className="text-sm font-black text-slate-800 leading-none">12</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{event.title}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic px-2">Quiet day, check back later!</p>
          )}
        </div>
      </div>

      {/* STATISTICS */}
      <Card className="p-7 border-none shadow-sm bg-white rounded-[2.5rem] relative group">
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
          <TrendingUp size={120} />
        </div>

        <div className="relative z-10 space-y-7">
          <div>
            <h3 className="text-slate-400 font-extrabold text-[11px] uppercase tracking-[0.2em] mb-6">
              LOCAL STATISTICS
            </h3>

            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0">
                  <MapPin className="text-teal-600 w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">
                    LOCATION
                  </p>
                  <p className="text-sm font-black text-slate-900 truncate">
                    {community?.location || 'Manolo Fortich, Bukidnon'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Calendar className="text-blue-500 w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">
                    ACTIVE SINCE
                  </p>
                  <p className="text-sm font-black text-slate-900 truncate">{community?.foundedDate || '2024'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <Heart className="text-emerald-500 w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">
                    RESOLVED CASES
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-slate-900">188 items</p>
                    <Badge className="bg-emerald-100 text-emerald-600 border-none text-[8px] font-bold px-1.5 h-3.5">
                      +12%
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                  <TrendingUp className="text-amber-500 w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">
                    ENGAGEMENT
                  </p>
                  <p className="text-sm font-black text-slate-900 truncate">High Activity</p>
                </div>
              </div>
            </div>
          </div>

          {/* CONTRIBUTORS */}
          <div className="pt-6 border-t border-slate-50">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-slate-400 font-extrabold text-[11px] uppercase tracking-[0.2em]">
                TOP CONTRIBUTORS
              </h3>
              <Badge variant="outline" className="text-[8px] font-black text-teal-600 border-teal-100 uppercase">
                {safeMembers.length || 0}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex -space-x-3">
                {(safeMembers.length > 0 ? safeMembers : STATIC_MEMBERS)
                  .slice(0, 4)
                  .map((member, i) => (
                    <Avatar
                      key={member.id || i}
                      className="w-10 h-10 border-4 border-white shadow-sm ring-1 ring-slate-100 bg-gradient-to-br from-teal-500 to-emerald-400 font-black text-[10px] text-white uppercase"
                    >
                      {member.name.charAt(0)}
                    </Avatar>
                  ))}
                {(safeMembers.length > 4 || (!safeMembers.length && STATIC_MEMBERS.length > 4)) && (
                  <div className="w-10 h-10 rounded-full bg-slate-50 border-4 border-white flex items-center justify-center text-[10px] font-black text-slate-400 ring-1 ring-slate-100">
                    +{(safeMembers.length || STATIC_MEMBERS.length) - 4}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onMembersClick}
                className="text-teal-600 font-black text-[10px] uppercase tracking-widest hover:bg-teal-50 px-3 h-8 rounded-xl"
              >
                View All
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* COMMUNITY WATCH */}
      <Card className="p-8 border-none shadow-sm rounded-[2.5rem] bg-teal-600 text-white relative group">
        <div className="relative z-10">
          <h4 className="text-xl font-black mb-2">Community Watch</h4>
          <p className="text-teal-100 text-sm font-medium leading-relaxed mb-6 opacity-80">
            Help keep our neighborhood safe by reporting suspicious activity.
          </p>
          <Button className="w-full bg-white text-teal-600 font-black rounded-xl hover:bg-teal-50 transition-colors">
            Learn More
          </Button>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[60px] -mr-16 -mt-16"></div>
      </Card>

      {/* RULES */}
      <Card className="p-8 rounded-[2.5rem] bg-white border-none shadow-sm">
        <h4 className="font-black text-slate-900 mb-6 flex items-center gap-2">
          <ShieldCheck size={20} className="text-teal-600" />
          Rules
        </h4>
        <ul className="space-y-4">
          {Array.isArray(community?.rules) && community.rules.length > 0 ? (
            community.rules.slice(0, 3).map((rule: string, i: number) => (
              <li key={rule} className="flex gap-4">
                <span className="w-6 h-6 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-[10px] font-black shrink-0">
                  {i + 1}
                </span>
                <p className="text-xs text-slate-500 font-medium line-clamp-2">{rule}</p>
              </li>
            ))
          ) : (
            <li className="text-slate-400 italic text-sm">No rules specified.</li>
          )}
        </ul>
      </Card>
    </>
  );
};

export default SidebarStats;
