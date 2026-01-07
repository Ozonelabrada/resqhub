import React from 'react';
import { 
  TrendingUp, 
  Award, 
  MapPin, 
  ChevronRight, 
  Plus, 
  Users, 
  ShieldAlert, 
  ChevronDown 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Avatar,
  Skeleton,
  Button
} from '../../../../ui';
import { cn } from "@/lib/utils";

interface CommunitySidebarProps {
  statistics?: any;
  trendingReports: any[];
  trendingLoading: boolean;
  navigate: (path: string) => void;
  joinedCommunities: any[];
  isSafetyExpanded: boolean;
  setIsSafetyExpanded: (expanded: boolean) => void;
  onOpenInviteModal: (communityName: string) => void;
  onOpenCreateCommunity: () => void;
}

const CommunitySidebar: React.FC<CommunitySidebarProps> = ({
  statistics,
  trendingReports,
  trendingLoading,
  navigate,
  joinedCommunities,
  isSafetyExpanded,
  setIsSafetyExpanded,
  onOpenInviteModal,
  onOpenCreateCommunity
}) => {
  const { t } = useTranslation();

  return (
    <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24 h-fit">
      {/* STATS CARD */}
      <Card className="p-8 border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full -mr-16 -mt-16 group-hover:bg-teal-100 transition-colors" />
        <h3 className="text-gray-900 font-black text-xl mb-6 flex items-center gap-3">
          <TrendingUp className="text-teal-600 w-6 h-6" />
          {t('newsfeed.community_impact')}
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{t('newsfeed.total_reports')}</span>
            <p className="text-3xl font-black text-slate-900">{statistics?.totalItems || 0}</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{t('newsfeed.reunited')}</span>
            <p className="text-3xl font-black text-emerald-600">{statistics?.successfulMatches || 0}</p>
          </div>
        </div>
        
        <div className="mt-8 p-4 rounded-2xl bg-teal-50/50 flex items-center justify-between">
          <div className="flex -space-x-3">
            {[1,2,3,4].map(i => (
              <Avatar key={i} className="w-8 h-8 border-2 border-white" />
            ))}
          </div>
          <span className="text-xs font-bold text-teal-700">+{statistics?.activeReports || 0} {t('newsfeed.active_now')}</span>
        </div>
      </Card>

      {/* ACTIVE REQUESTS / TRENDING */}
      <Card className="p-8 border-none shadow-sm bg-white rounded-[2.5rem]">
        <h3 className="text-gray-900 font-black text-xl mb-6 flex items-center gap-3">
          <Award className="text-orange-500 w-6 h-6" />
          {t('newsfeed.trending')}
        </h3>
        <div className="space-y-6">
          {trendingLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-14 h-14 rounded-2xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
          ) : trendingReports.slice(0, 3).map((report: any) => (
            <div key={report.id} className="group flex items-start gap-4 cursor-pointer" onClick={() => navigate(`/item/${report.id}`)}>
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                {report.images?.[0] ? (
                  <img src={report.images[0]} alt="" className="object-cover w-full h-full group-hover:scale-110 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Plus className="w-5 h-5" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
              <div className="flex-1 min-w-0 py-1">
                <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-teal-600 transition-colors">{report.title}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  <span className="truncate">{report.location}</span>
                </div>
              </div>
              <div className="self-center p-2 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition-all">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
        <Button 
            variant="ghost" 
            className="w-full mt-8 py-6 rounded-2xl border border-gray-100 text-teal-600 font-bold hover:bg-teal-50 transition-colors"
            onClick={() => navigate('/hub')}
        >
          Explore Global activity
        </Button>
      </Card>

      {/* COMMUNITIES SECTION */}
      <Card className="p-8 border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-gray-900 font-black text-xl flex items-center gap-3">
            <Users className="text-teal-600 w-6 h-6" />
            {t('community.sidebar_title') || "Communities"}
          </h3>
          <Button 
            size="sm" 
            variant="ghost" 
            className="w-10 h-10 p-0 rounded-xl bg-teal-50 text-teal-600 hover:bg-teal-100"
            onClick={onOpenCreateCommunity}
          >
            <Plus size={20} />
          </Button>
        </div>
        
        <div className="space-y-4">
          {joinedCommunities.map(community => (
            <div key={community.id} className="p-4 rounded-3xl border border-slate-50 hover:border-teal-100 hover:bg-teal-50/30 transition-all group" onClick={() => navigate(`/community/${community.id}`)}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {community.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{community.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{community.members} Members • {community.lastActivity}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 bg-white hover:bg-teal-50 text-teal-600 rounded-xl font-bold border border-slate-100"
                    onClick={(e) => { e.stopPropagation(); onOpenInviteModal(community.name); }}
                >
                  {t('community.invite') || "Invite"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button 
          className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-black py-4 h-14 rounded-2xl shadow-lg shadow-teal-100"
          onClick={onOpenCreateCommunity}
        >
          {t('community.create') || "Create Community"}
        </Button>
      </Card>

      {/* SAFETY ADVISORY */}
      <div className={cn(
        "p-8 rounded-[2.5rem] shadow-xl transition-all duration-500 relative overflow-hidden group",
        isSafetyExpanded 
          ? "bg-white border-2 border-orange-200" 
          : "bg-gradient-to-br from-orange-500 to-rose-600 text-white shadow-orange-100"
      )}>
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsSafetyExpanded(!isSafetyExpanded)}>
          <h3 className={cn(
            "font-black text-xl flex items-center gap-2",
            isSafetyExpanded ? "text-orange-600" : "text-white"
          )}>
            <ShieldAlert className={cn("w-6 h-6", !isSafetyExpanded && "text-white")} />
            {t('safety.title') || "Stay Safe!"}
          </h3>
          <ChevronDown className={cn(
            "w-6 h-6 transition-transform",
            !isSafetyExpanded && "text-white/70",
            isSafetyExpanded ? "rotate-180 text-orange-500" : ""
          )} />
        </div>

        {!isSafetyExpanded ? (
           <p className="text-orange-50 text-sm mt-4 leading-relaxed font-medium opacity-90">
             {t('safety.subtitle')}
           </p>
        ) : (
          <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            {[
              { title: t('safety.tip1_title'), desc: t('safety.tip1_desc') },
              { title: t('safety.tip2_title'), desc: t('safety.tip2_desc') },
              { title: t('safety.tip3_title'), desc: t('safety.tip3_desc') },
              { title: t('safety.tip4_title'), desc: t('safety.tip4_desc') }
            ].map((tip, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-orange-50 border border-orange-100 group/tip">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-black shrink-0">
                  {i + 1}
                </div>
                <div>
                  <h5 className="font-black text-orange-700 text-xs uppercase tracking-widest mb-1">{tip.title}</h5>
                  <p className="text-sm text-orange-600/80 font-medium leading-tight">{tip.desc}</p>
                </div>
              </div>
            ))}
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl h-12 mt-2">
              {t('safety.full_guide') || "Read Full Safety Guide"}
            </Button>
          </div>
        )}
        {!isSafetyExpanded && <ShieldAlert className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" />}
      </div>

    </aside>
  );
};

export default CommunitySidebar;
