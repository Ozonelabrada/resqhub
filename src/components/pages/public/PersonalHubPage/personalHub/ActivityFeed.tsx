import React from 'react';
import { Search, MessageCircle, TrendingUp, Shield, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui';

const MOCK_ACTIVITIES = [
  { id: '1', type: 'match', title: 'Potential match found', description: 'A "Black Leather Wallet" matching your report was found in Quezon City.', time: '2 hours ago', icon: <Search size={16} className="text-blue-500" /> },
  { id: '2', type: 'comment', title: 'New comment on your report', description: 'Someone commented on your "Lost Keys" report.', time: '4 hours ago', icon: <MessageCircle size={16} className="text-teal-500" /> },
  { id: '3', type: 'view', title: 'View milestone reached', description: 'Your "Missing Dog" report has reached 50 views!', time: 'Yesterday', icon: <TrendingUp size={16} className="text-emerald-500" /> },
  { id: '4', type: 'system', title: 'Security Alert', description: 'A new login was detected from a Chrome browser on Windows.', time: '2 days ago', icon: <Shield size={16} className="text-orange-500" /> },
  { id: '5', type: 'status', title: 'Report Status Updated', description: 'Your report "Lost Glasses" is now marked as Resolved.', time: '3 days ago', icon: <CheckCircle size={16} className="text-blue-500" /> },
];

export const ActivityFeed: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="divide-y divide-slate-50">
        {MOCK_ACTIVITIES.map((activity) => (
          <div key={activity.id} className="py-6 first:pt-0 last:pb-0 hover:bg-slate-50/50 px-4 -mx-4 rounded-3xl transition-colors cursor-pointer group">
            <div className="flex gap-4">
              <div className="mt-1 p-3 bg-white shadow-sm rounded-2xl group-hover:scale-110 transition-transform duration-300 border border-slate-100">
                {activity.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-black text-slate-900">{activity.title}</h4>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <Clock size={12} />
                     {activity.time}
                  </div>
                </div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">{activity.description}</p>
                <div className="mt-3 flex items-center gap-4">
                  <button className="text-[10px] font-black text-teal-600 uppercase tracking-widest hover:underline">View Details</button>
                  <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">Dismiss</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="pt-8 text-center border-t border-slate-50">
        <Button variant="ghost" className="text-slate-500 font-bold hover:text-teal-600 rounded-2xl">
          Load older activities
        </Button>
      </div>
    </div>
  );
};
