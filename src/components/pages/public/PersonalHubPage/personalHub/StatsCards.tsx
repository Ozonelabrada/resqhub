// components/personalHub/StatsCards.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../../../ui';
import { FileText, Activity, CheckCircle, Eye } from 'lucide-react';
import type { UserStats } from '../../../../../types/personalHub';

interface StatsCardsProps {
  stats: UserStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const { t } = useTranslation();
  const statItems = [
    {
      label: t('common.total_reports'),
      value: stats.totalReports,
      icon: <FileText size={20} />,
      color: 'teal',
      trend: '+12%',
      bg: 'bg-teal-50',
      text: 'text-teal-600',
      border: 'border-teal-100',
      accent: 'bg-teal-500'
    },
    {
      label: t('common.active_reports'),
      value: stats.activeReports,
      icon: <Activity size={20} />,
      color: 'emerald',
      trend: 'Live',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      accent: 'bg-emerald-500'
    },
    {
      label: t('common.resolved'),
      value: stats.resolvedReports,
      icon: <CheckCircle size={20} />,
      color: 'orange',
      trend: '85%',
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      border: 'border-orange-100',
      accent: 'bg-orange-500'
    },
    {
      label: t('common.total_views'),
      value: stats.totalViews,
      icon: <Eye size={20} />,
      color: 'blue',
      trend: '+2.4k',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-100',
      accent: 'bg-blue-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {statItems.map((item, index) => (
        <Card 
          key={index}
          className={`p-6 border-none shadow-sm rounded-4xl ${item.bg} relative overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-2xl bg-white shadow-sm ${item.text}`}>
                {item.icon}
              </div>
              <div className={`text-[10px] font-black px-2 py-0.5 rounded-full bg-white/50 border border-white ${item.text} uppercase tracking-tight`}>
                {item.trend}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] leading-tight mb-1">
                {item.label}
              </p>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter">
                {item.value.toLocaleString()}
              </h3>
            </div>
          </div>
          
          {/* Decorative background shape */}
          <div className={`absolute -bottom-6 -right-6 w-24 h-24 ${item.accent} opacity-[0.03] rounded-full blur-2xl group-hover:opacity-[0.08] transition-opacity`} />
        </Card>
      ))}
    </div>
  );
};