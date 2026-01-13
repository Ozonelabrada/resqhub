import React from 'react';
import { TrendingUp, Clock, Award, Shield } from 'lucide-react';
import type { UserStats } from '@/types';
import type { NewsFeedItem } from './NewsFeed';
import { Card } from '@/components/ui';

interface OverviewGridProps {
  stats: UserStats;
  recentReports?: NewsFeedItem[];
}

export const OverviewGrid: React.FC<OverviewGridProps> = ({ stats, recentReports }) => {
  return (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-8 border-none shadow-sm bg-slate-900 text-white rounded-4xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                <div className="relative z-10">
                    <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-6">Impact Analysis</h4>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-1">
                            <p className="text-4xl font-black text-white leading-none">{stats.totalReports}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reports Filed</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-4xl font-black text-orange-400 leading-none">{stats.resolvedReports}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resolved</p>
                        </div>
                    </div>
                </div>
            </Card>

            <Card className="p-8 border-none shadow-sm bg-white rounded-4xl border border-slate-100 flex flex-col justify-between">
                <div>
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Active Badges</h4>
                   <div className="flex gap-3">
                       <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
                           <Award size={24} />
                       </div>
                       <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                           <Shield size={24} />
                       </div>
                       <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-200" />
                   </div>
                </div>
                <div className="mt-6">
                   <p className="text-xs font-bold text-slate-500 italic">"Community Hero: 75% progress to next level"</p>
                </div>
            </Card>
        </div>

        <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Clock size={16} className="text-teal-600" />
                Recent History
            </h3>
            <div className="grid grid-cols-1 gap-3">
                {recentReports?.slice(0, 2).map((report, idx) => (
                    <div key={idx} className="p-5 bg-white rounded-3xl border border-slate-50 shadow-sm flex items-center justify-between hover:border-teal-100 transition-colors">
                        <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-slate-50 rounded-2xl overflow-hidden">
                                 {report.images?.[0] && <img src={report.images[0]} className="w-full h-full object-cover" />}
                             </div>
                             <div>
                                 <p className="text-sm font-black text-slate-900">{report.title}</p>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase">{report.status}</p>
                             </div>
                        </div>
                        <TrendingUp size={16} className="text-slate-200" />
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};
