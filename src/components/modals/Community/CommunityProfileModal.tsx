import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  Avatar,
  Button
} from '../../ui';
import { 
  Users, 
  Globe, 
  ShieldCheck, 
  Activity,
  MapPin,
  MessageSquare,
  Plus
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from "@/lib/utils";
import { SITE } from '@/constants/site';

interface CommunityProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  community: {
    id: string | number;
    name: string;
    icon: string;
    members: number;
    description?: string;
    location?: string;
    activeReports?: number;
    lastActivity?: string;
  } | null;
}

export const CommunityProfileModal: React.FC<CommunityProfileModalProps> = ({ isOpen, onClose, community }) => {
  const { t } = useTranslation();

  if (!community) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto bg-white border-none shadow-2xl rounded-[2.5rem] p-0">
        {/* Banner */}
        <div className="h-40 bg-gradient-to-br from-teal-500 to-indigo-600 w-full relative">
           <div className="absolute inset-0 bg-black/10" />
           <div className="absolute top-6 right-6 flex gap-2">
              <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                 <Globe size={12} />
                 Public Community
              </div>
           </div>
        </div>
        
        <div className="px-8 pb-10 -mt-12 relative">
           <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
              <div className="w-24 h-24 rounded-3xl bg-white shadow-xl flex items-center justify-center text-4xl border-2 border-white ring-8 ring-white/10 z-10 transition-transform hover:scale-105">
                 {community.icon}
              </div>
              <div className="flex-1 pb-1">
                 <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    {community.name}
                    <ShieldCheck className="w-6 h-6 text-teal-600" />
                 </h2>
                 <div className="flex items-center gap-4 text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
                    <span className="flex items-center gap-1.5">
                       <Users className="w-3.5 h-3.5 text-teal-600" />
                       {community.members} Members
                    </span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="flex items-center gap-1.5">
                       <Activity className="w-3.5 h-3.5 text-orange-500" />
                       Active Now
                    </span>
                 </div>
              </div>
           </div>

           {/* Stats Overview */}
           <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 text-center">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reports</p>
                 <p className="text-xl font-black text-slate-900">{community.activeReports || 124}</p>
              </div>
              <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 text-center">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Resolved</p>
                 <p className="text-xl font-black text-emerald-600">86%</p>
              </div>
              <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 text-center">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Activity</p>
                 <p className="text-xl font-black text-teal-600">High</p>
              </div>
           </div>

           {/* Description */}
           <div className="space-y-4 mb-10">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">{t('community.about') || "About this Community"}</h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                 {community.description || `A localized community dedicated to helping neighbors reunite with their lost belongings. We prioritize safety and swift communication across ${SITE.name} districts.`}
              </p>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                 <MapPin size={16} className="text-orange-500" />
                 {community.location || `FindrHub City Metro`}
              </div>
           </div>

           {/* Recent Activity / Posts (Preview) */}
           <div className="space-y-4 mb-10">
              <div className="flex justify-between items-center">
                 <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Recent community posts</h3>
                 <Button variant="ghost" size="sm" className="text-teal-600 font-black text-[10px] uppercase tracking-widest">View All</Button>
              </div>
              <div className="space-y-3">
                 {[1, 2].map(i => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl border border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer group">
                       <div className="w-12 h-12 rounded-xl bg-slate-100 shrink-0" />
                       <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-teal-600 transition-colors">Lost Golden Retriever near Central...</h4>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">Reported 2 hours ago • By John D.</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Action Buttons */}
           <div className="flex gap-4">
              <Button 
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl h-14 font-black shadow-lg shadow-teal-100 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Join Community
              </Button>
              <Button 
                variant="outline"
                className="flex-1 border-2 border-slate-100 hover:border-teal-600 hover:text-teal-600 rounded-2xl h-14 font-black transition-all active:scale-95"
                onClick={onClose}
              >
                Close
              </Button>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
