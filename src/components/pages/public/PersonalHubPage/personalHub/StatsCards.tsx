// components/personalHub/StatsCards.tsx
import React from 'react';
import { Card, Grid } from '../../../ui';
import { FileText, Activity, CheckCircle, Eye, TrendingUp, ArrowUpRight } from 'lucide-react';
import type { UserStats } from '../../../../../types/personalHub';

interface StatsCardsProps {
  stats: UserStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const statItems = [
    {
      label: 'Total Reports',
      value: stats.totalReports,
      icon: <FileText size={24} />,
      color: 'teal',
      trend: '+12%',
      bg: 'bg-teal-50',
      text: 'text-teal-600',
      border: 'border-teal-100'
    },
    {
      label: 'Active Reports',
      value: stats.activeReports,
      icon: <Activity size={24} />,
      color: 'emerald',
      trend: 'Live',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100'
    },
    {
      label: 'Resolved',
      value: stats.resolvedReports,
      icon: <CheckCircle size={24} />,
      color: 'orange',
      trend: '85%',
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      border: 'border-orange-100'
    },
    {
      label: 'Total Views',
      value: stats.totalViews,
      icon: <Eye size={24} />,
      color: 'teal',
      trend: '+2.4k',
      bg: 'bg-teal-50',
      text: 'text-teal-600',
      border: 'border-teal-100'
    }
  ];

  return (
    <Grid cols={4} gap={6} className="mb-8">
      {statItems.map((item, index) => (
        <Card 
          key={index} 
          className={`p-6 border ${item.border} ${item.bg} hover:shadow-lg transition-all duration-300 group cursor-default rounded-3xl`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-2xl bg-white shadow-sm ${item.text} group-hover:scale-110 transition-transform duration-300`}>
              {item.icon}
            </div>
            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-white/50 ${item.text}`}>
              {item.trend}
              <ArrowUpRight size={12} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 mb-1">
              {item.value.toLocaleString()}
            </div>
            <div className="text-slate-500 font-bold text-sm uppercase tracking-wider">
              {item.label}
            </div>
          </div>
          <div className="mt-4 h-1 w-full bg-white/50 rounded-full overflow-hidden">
            <div 
              className={`h-full ${item.text.replace('text', 'bg')} transition-all duration-1000`} 
              style={{ width: '70%' }} 
            />
          </div>
        </Card>
      ))}
    </Grid>
  );
};