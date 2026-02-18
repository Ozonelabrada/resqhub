import React from 'react';
import { 
  Info, 
  MapPin, 
  Users, 
  Calendar, 
  Shield, 
  Clock, 
  Globe,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Card, Badge, Avatar } from '@/components/ui';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/formatter';
import type { Community } from '@/types/community';

interface CommunityAboutProps {
  community: Community;
}

export const CommunityAbout: React.FC<CommunityAboutProps> = ({ community }) => {
  const stats = [
    { label: 'Members', value: community.membersCount || community.memberCount || 0, icon: <Users className="w-4 h-4" /> },
    { label: 'Location', value: community.location || 'Bacolod City, PH', icon: <MapPin className="w-4 h-4" /> },
    { label: 'Founded', value: community.dateCreated ? formatDate(community.dateCreated, { month: 'short', year: 'numeric' }) : 'N/A', icon: <Calendar className="w-4 h-4" /> },
    { label: 'Type', value: community.isPrivate ? 'Private' : 'Public', icon: <Globe className="w-4 h-4" /> },
  ];

  const rules = community.rules || [
    "Be respectful to all community members.",
    "Only post verified information about lost/found items.",
    "Do not share private contact information in public threads.",
    "Help others by reacting to helpful reports.",
    "Follow local barangay safety guidelines."
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Bio Section */}
      <Card className="p-8 border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Info size={120} className="text-teal-600" />
        </div>
        
        <div className="relative z-10">
          <Badge className="mb-4 bg-teal-50 text-teal-600 border-none uppercase text-[10px] font-black tracking-widest px-3 py-1">
            Community Mission
          </Badge>
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight mb-4 leading-tight">
            About {community.name}
          </h2>
          <p className="text-slate-600 text-lg font-medium leading-relaxed max-w-3xl">
            {community.description || "Building a safer, more connected neighborhood through rapid information sharing and community support."}
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Quick Stats & Details */}
        <div className="md:col-span-1 space-y-6">
          <Card className="p-6 border-none shadow-sm rounded-[2rem] bg-white">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              Quick Info
            </h3>
            <div className="space-y-4">
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-teal-600">
                      {stat.icon}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-700">{stat.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 border-none shadow-sm rounded-[2rem] bg-teal-600 text-white">
            <Shield className="w-8 h-8 mb-4 opacity-50" />
            <h3 className="text-sm font-black uppercase tracking-widest mb-2">Safe & Verified</h3>
            <p className="text-teal-50 text-xs font-medium leading-relaxed opacity-90">
              Every member in {community.name} is verified by FindrHub to ensure the safety of our neighborhood.
            </p>
          </Card>
        </div>

        {/* Right Column: Rules & Guidelines */}
        <div className="md:col-span-2">
          <Card className="p-8 border-none shadow-sm rounded-[2.5rem] bg-white h-full">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <Shield className="w-4 h-4 text-teal-600" />
              Community Guidelines
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              {rules.map((rule, i) => (
                <div key={i} className="flex items-start gap-4 p-5 rounded-3xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-black text-xs">
                    {i + 1}
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-700 font-bold text-sm tracking-tight">{rule}</p>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Enforced</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 rounded-[2rem] bg-amber-50 border border-amber-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-amber-500 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Reporting Violations</h4>
                <p className="text-xs text-amber-700 font-medium leading-tight">
                  Help keep this community safe. Report any content that violates these guidelines to the community moderators.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CommunityAbout;
